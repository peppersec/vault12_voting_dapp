How it works.
1. Run scaper to get all VGT token holders. Filter team and advisor token addresses.
2. Run a script which takes those addresses, generates merkle tree and uploads it in ipfs.
3. V12Voting owner deploys contract with `root` and `ipfsHash` to initialize voting.
4. Each voter should visit vault12voting.com, choose one of three possible options, click `vote` btn and accept MM tx.

Voting process takes some time (e.g. a week) and after that smart contract no longer accepts any votes.
