Smart contracts:
1. git clone the repo
2. install mongodb (mac `brew install mongodb`)
3. `cd contracts_and_scraper`
4. `yarn && cd scraper && yarn`
4. `./setupMongo.sh`
5. set .env (`cp .env.example .env`)
    * TOKEN_ADDRESS
    * FROM_BLOCK
    * TO_BLOCK
    * DECIMALS
6. `node setupDB.js`
7. `node scrape.js` - builds the map of token cap holders
8. `node merkleTreeGenerator.js`
9. save merkle root hash and ipfs file hash
10. `cd ../` # should get you in `contracts_and_scraper` folder
12. `yarn compile`
13. `yarn test`
14. `yarn flat`
15. open remix.ethereum.org, copy/paste 
`cat flats/FLAT_V12Voting.sol | pbcopy` 
file, choose compiler 0.5.8
16. constructor params:
    * merkleRootHash
    * ipfsHash
    * expiration (timestamp) (use https://www.epochconverter.com/)
17. deploy the contract and save the address
At this step you should have:
`snapshotBlock` (TO_BLOCK) param from .env file
`contractAddress`
`participants.json`
block number at which the contract was deployed

UI
1. `cd ../front`
2. `yarn` - installs deps
3. `cp ../contracts_and_scraper/scraper/participants.json static/`
4. change `networkConfig.json`
    * votingContractAddress - deployed contract address
    * deployedBlockNumber - Voting contract deployment block
    * snaphotBlock - TO_BLOCK that you used when building the token's holders cap table
5. Change `YOUR_DOMAIN_NAME` in `package.json` file for `deploy-prod` command
6. `git commit -am "ballot info"`
7. `yarn deploy-prod`