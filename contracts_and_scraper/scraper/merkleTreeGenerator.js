require('dotenv').config();
const Web3 = require('web3');
const { soliditySha3 } = require('web3-utils');
const { MerkleTree } = require('../helpers/merkleTree.js');
const ipfsClient = require('ipfs-http-client');

const ipfs = ipfsClient('/dns4/ipfs.infura.io/tcp/5001/https');
const web3 = new Web3('https://localhost:8545');

async function main() {
  let participants = require('./participants.json')
  const merkleTreeLeafs = Object.entries(participants).map(holder => {
    const leaf = web3.eth.abi.encodeParameters(['address', 'uint256'], holder);
    return soliditySha3(leaf);
  });
  const merkleTree = new MerkleTree(merkleTreeLeafs);
  const root = merkleTree.getHexRoot();

  console.log('Your Merkle Tree root:', root);
  participants = JSON.stringify(participants, null, 2);
  const ipfsResult = await ipfs.add(Buffer.from(participants));
  const ipfsHash = ipfsResult[0].hash;
  console.log('Your IPFS hash:', ipfsHash);
  console.log('Visit https://ipfs.io/ipfs/' + ipfsHash);
  process.exit();
}

main()
