const networkConfig = {
  netId1: {
    rpcCallRetryAttempt: 15,
    gasPrice: { fast: 21, low: 1 },
    currencyName: 'ETH',
    explorerUrl: {
      tx: 'https://etherscan.io/tx/'
    },
    networkName: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum-rpc.trustwalletapp.com',
    votingContractAddress: '0x908d81a4961c4a40b38c91f16d216c6307a89954',
    smartContractPollTime: 15,
    gasOracleUrls: [
      'https://www.etherchain.org/api/gasPriceOracle',
      'https://gasprice.poa.network/'
    ],
    tokenDecimals: 18,
    tokenSymbol: 'VGT',
    deployedBlockNumber: 7851115,
    snapshotBlock: 7850817
  },
  netId42: {
    rpcCallRetryAttempt: 15,
    gasPrice: { fast: 2, low: 1 },
    currencyName: 'kETH',
    explorerUrl: {
      tx: 'https://kovan.etherscan.io/tx/'
    },
    networkName: 'Kovan',
    smartContractPollTime: 5,
    rpcUrl: 'https://kovan.infura.io/',
    votingContractAddress: '0x4933d4d8e12d3ec78bf4aff9be76e8e5f331a902',
    tokenDecimals: 18,
    tokenSymbol: 'VGT',
    deployedBlockNumber: 11084800,
    snapshotBlock: 11956027
  }
}

export default networkConfig
