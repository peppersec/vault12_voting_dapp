const should = require('chai')
  .use(require('bn-chai')(web3.utils.BN))
  .use(require('chai-as-promised'))
.should();

const { takeSnapshot, revertSnapshot, increaseTime } = require('../helpers/ganacheHelper');
const { MerkleTree } = require('../helpers/merkleTree.js');
const { toWei, toBN, soliditySha3 } = web3.utils;

const Voting = artifacts.require('./V12Voting.sol');

const VotingOption = Object.freeze({
  Invalid: 'Invalid',
  NoChange: 'No Change',
  DualToken: 'Dual Token',
  TxSplit: 'Transaction Split'
})

contract('Voting', accounts => {
  const owner = accounts[0];
  const sender = accounts[1];
  const ipfs = 'IPFS_HASH'
  let root
  let votingInstance
  let expirationDate
  const oneHundredPercent = toBN(10000)

  const participants = [
    { address: accounts[2], amount: toWei('1') },
    { address: accounts[3], amount: toWei('2') },
    { address: accounts[4], amount: toWei('3') },
    { address: accounts[5], amount: toWei('4') },
    { address: accounts[6], amount: toWei('5') },
  ];

  function createElements(data) {
    return data.map(item => soliditySha3(
      web3.eth.abi.encodeParameters(['address', 'uint256'], [item.address, item.amount])
    ));
  }

  function totalVotingPower(participants) {
    return participants.reduce((accum, { amount }) => {
      return accum.add(toBN(amount));
    }, toBN('0'));
  }

  function createRoot(data = participants) {
    const elements = createElements(data);
    const merkleTree = new MerkleTree(elements);
    return merkleTree.getHexRoot();
  }

  const nowSeconds = () => Math.floor(Date.now() / 1000)

  before(async () => {
    root = createRoot();
    expirationDate = nowSeconds() + 60 * 60 // an hour
    votingInstance = await Voting.new(root, ipfs, expirationDate)
    snapshotId = await takeSnapshot();
  });

  afterEach(async () => {
    await revertSnapshot(snapshotId.result);
    snapshotId = await takeSnapshot();
  });

  describe('constructor', function () {
    it('should set root and ipfs', async function () {
      const _root = await votingInstance.merkleTreeRoot()
      const _ipfs = await votingInstance.ipfs()
      _root.should.be.equal(root)
      _ipfs.should.be.equal(ipfs)
      const _expirationDate = await votingInstance.expirationDate()
      _expirationDate.should.be.eq.BN(toBN(expirationDate))
    });
  });

  describe('vote', function () {
    it('should vote', async function() {
      const elements = participants;
      const preparedElements = createElements(elements);
      const merkleTree = new MerkleTree(preparedElements);
      const proof = merkleTree.getHexProof(preparedElements[0]);
      const expectedVotingAmount = totalVotingPower(participants);
      const { address: user, amount } = elements[0];

      const { logs } = await votingInstance.vote(VotingOption.TxSplit, amount, proof, { from: user });
      logs[0].event.should.be.equal('NewVote');
      logs[0].args.who.should.be.equal(user);
      logs[0].args.vote.should.be.equal(VotingOption.TxSplit);
      logs[0].args.amount.should.be.eq.BN(toBN(amount));

      const vote = await votingInstance.votes(user);
      vote.should.be.equal(soliditySha3(VotingOption.TxSplit));

      const noChange = await votingInstance.votingResult(soliditySha3(VotingOption.NoChange))
      const dualToken = await votingInstance.votingResult(soliditySha3(VotingOption.DualToken))
      const txSplit = await votingInstance.votingResult(soliditySha3(VotingOption.TxSplit))

      noChange.should.be.eq.BN(toBN('0'))
      dualToken.should.be.eq.BN(toBN('0'))
      txSplit.should.be.eq.BN(toBN(amount))

      const { 
        noChangePercent,
        dualTokenPercent,
        txSplitPercent,
        turnoutPercent,
      } = await votingInstance.votingPercentages(expectedVotingAmount);
      const expectedTurnout = toBN(amount).mul(toBN(oneHundredPercent)).div(expectedVotingAmount);
      turnoutPercent.should.be.eq.BN(expectedTurnout);

      noChangePercent.should.be.eq.BN(toBN('0'));
      dualTokenPercent.should.be.eq.BN(toBN('0'));
      txSplitPercent.should.be.eq.BN(toBN(oneHundredPercent));
    })

    it('should fail after expiration date', async function () {
      let { address: user, amount } = participants[0];
      const preparedElements = createElements(participants);
      const merkleTree = new MerkleTree(preparedElements);
      let proof = merkleTree.getHexProof(preparedElements[0]);
      await votingInstance.vote(VotingOption.DualToken, amount, proof, { from: user });

      await increaseTime(expirationDate + 1);

      ({ address: user, amount } = participants[1]);
      proof = merkleTree.getHexProof(preparedElements[1]);
      const error = await votingInstance.vote(VotingOption.DualToken, amount, proof, { from: user }).should.be.rejected;
      error.reason.should.be.equal('voting finished');
    });
    
  })

  describe('votingPercentages', function () {
    it('should return correct results', async function () {
      const preparedElements = createElements(participants);
      const merkleTree = new MerkleTree(preparedElements);
      let realVotedAmount = toBN('0');
      
      let { address: user, amount } = participants[0];
      let proof = merkleTree.getHexProof(preparedElements[0]);
      await votingInstance.vote(VotingOption.DualToken, amount, proof, { from: user });
      realVotedAmount = realVotedAmount.add(toBN(amount));
      
      ({ address: user, amount } = participants[1]);
      proof = merkleTree.getHexProof(preparedElements[1]);
      await votingInstance.vote(VotingOption.TxSplit, amount, proof, { from: user });
      realVotedAmount = realVotedAmount.add(toBN(amount));
      
      ({ address: user, amount } = participants[2]);
      proof = merkleTree.getHexProof(preparedElements[2]);
      await votingInstance.vote(VotingOption.NoChange, amount, proof, { from: user });
      realVotedAmount = realVotedAmount.add(toBN(amount));

      ({ address: user, amount } = participants[4]);
      proof = merkleTree.getHexProof(preparedElements[4]);
      await votingInstance.vote(VotingOption.TxSplit, amount, proof, { from: user });
      realVotedAmount = realVotedAmount.add(toBN(amount));
      const expectedVotingAmount = totalVotingPower(participants);
      const { 
        noChangePercent,
        dualTokenPercent,
        txSplitPercent,
        turnoutPercent,
      } = await votingInstance.votingPercentages(expectedVotingAmount);

      const expectedNoChangePercent = toBN(participants[2].amount).mul(oneHundredPercent).div(realVotedAmount);
      noChangePercent.should.be.eq.BN(expectedNoChangePercent);

      const expectedDualTokenPercent = toBN(participants[0].amount).mul(oneHundredPercent).div(realVotedAmount);
      dualTokenPercent.should.be.eq.BN(expectedDualTokenPercent);

      const expectedTxSplitPercent = oneHundredPercent.sub(expectedNoChangePercent).sub(expectedDualTokenPercent);
      txSplitPercent.should.be.eq.BN(expectedTxSplitPercent);

      const expectedTurnoutPercent = realVotedAmount.mul(oneHundredPercent).div(expectedVotingAmount);
      turnoutPercent.should.be.eq.BN(expectedTurnoutPercent);

      const wholePercentage = expectedNoChangePercent
        .add(expectedDualTokenPercent)
        .add(expectedTxSplitPercent);
        wholePercentage.should.be.eq.BN(oneHundredPercent)
    });

    it('should fail after expiration date', async function () {
      let { address: user, amount } = participants[0];
      const preparedElements = createElements(participants);
      const merkleTree = new MerkleTree(preparedElements);
      let proof = merkleTree.getHexProof(preparedElements[0]);
      await votingInstance.vote(VotingOption.DualToken, amount, proof, { from: user });

      await increaseTime(expirationDate + 1);

      ({ address: user, amount } = participants[1]);
      proof = merkleTree.getHexProof(preparedElements[1]);
      const error = await votingInstance.vote(VotingOption.DualToken, amount, proof, { from: user }).should.be.rejected;
      error.reason.should.be.equal('voting finished');
    });

    it('should fail if a wrong vote option passed', async function () {
      let { address: user, amount } = participants[0];
      const preparedElements = createElements(participants);
      const merkleTree = new MerkleTree(preparedElements);
      let proof = merkleTree.getHexProof(preparedElements[0]);
      let error = await votingInstance.vote(VotingOption.Invalid, amount, proof, { from: user }).should.be.rejected;
      error.reason.should.be.equal('invalid vote option');
    });

    it('should fail if already voted', async function () {
      let { address: user, amount } = participants[0];
      const preparedElements = createElements(participants);
      const merkleTree = new MerkleTree(preparedElements);
      let proof = merkleTree.getHexProof(preparedElements[0]);
      await votingInstance.vote(VotingOption.DualToken, amount, proof, { from: user });

      let error = await votingInstance.vote(VotingOption.TxSplit, amount, proof, { from: user }).should.be.rejected;
      error.reason.should.be.equal('already voted');
    });

    it('should fail the proof is wrong', async function () {
      let { address: user, amount } = participants[0];
      const preparedElements = createElements(participants);
      const merkleTree = new MerkleTree(preparedElements);
      let proof = merkleTree.getHexProof(preparedElements[0]);
      let lastHash = proof.pop();
      lastHash = lastHash.slice(0, 24) + 'beef' + lastHash.slice(28);
      proof.push(lastHash);
      let error = await votingInstance.vote(VotingOption.DualToken, amount, proof, { from: user }).should.be.rejected;
      error.reason.should.be.equal('the proof is wrong');
    });
    
  })

  describe('verify', function () {
    it('should return true for a valid Merkle proof', async function () {
      const elements = ['a', 'b', 'c', 'd'];
      const merkleTree = new MerkleTree(elements);

      const root = merkleTree.getHexRoot();

      const proof = merkleTree.getHexProof(elements[0]);

      const leaf = soliditySha3(elements[0]);

      (await votingInstance.verify(proof, root, leaf)).should.equal(true);
    });

    it('should return false for an invalid Merkle proof', async function () {
      const correctElements = ['a', 'b', 'c'];
      const correctMerkleTree = new MerkleTree(correctElements);

      const correctRoot = correctMerkleTree.getHexRoot();

      const correctLeaf = soliditySha3(correctElements[0]);

      const badElements = ['d', 'e', 'f'];
      const badMerkleTree = new MerkleTree(badElements);

      const badProof = badMerkleTree.getHexProof(badElements[0]);

      (await votingInstance.verify(badProof, correctRoot, correctLeaf)).should.equal(false);
    });

    it('should return false for a Merkle proof of invalid length', async function () {
      const elements = ['a', 'b', 'c'];
      const merkleTree = new MerkleTree(elements);

      const root = merkleTree.getHexRoot();

      const proof = merkleTree.getHexProof(elements[0]);
      const badProof = proof.slice(0, proof.length - 5);

      const leaf = soliditySha3(elements[0]);

      (await votingInstance.verify(badProof, root, leaf)).should.equal(false);
    });
  });
});
