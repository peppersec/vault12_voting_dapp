require('dotenv').config();
const { DB_HOST, DB_PORT, DB_NAME, NET_ID } = process.env;
const { initialize } = require('./db');
const Web3 = require('web3');
const { toWei, soliditySha3 } = require('web3-utils');
const { MerkleTree } = require('../helpers/merkleTree.js');
const BN = require('bignumber.js');
const ipfsClient = require('ipfs-http-client');
const fs = require('fs');

const ipfs = ipfsClient('/dns4/ipfs.infura.io/tcp/5001/https');
const web3 = new Web3('https://localhost:8545');

async function main() {
  const { dbConnection, client } = await initialize({ 
    host: DB_HOST,
    port: DB_PORT,
    dbName: DB_NAME
  });
  let participants = await dbConnection.collection(`ethAddressesWithBalance${NET_ID}`)
    .find()
    .project({ _id: 0, ethAccount: 1, value: 1 })
    .toArray();
  participants = participants.reduce((accum, { ethAccount, value }) => {
    accum[ethAccount] = value;
    return accum
  }, {})

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
  fs.writeFileSync('participants.json', participants)
  console.log('participants.json file has been created as well');
  process.exit();
}

main()
