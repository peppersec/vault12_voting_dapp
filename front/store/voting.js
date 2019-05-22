/* eslint-disable no-console */
import moment from 'moment'
import BN from 'bignumber.js'
import votingABI from '../static/voting.abi.json'
import participants from '../static/participants.json'
const { numberToHex, hexToNumber, soliditySha3 } = require('web3-utils')
const DECISIONS = ['Not Voted', 'No Change', 'Dual Token', 'Transaction Split']
export const state = () => ({
  voteTx: {
    txHash: '',
    status: null
  },
  expirationDate: 0,
  decision: 'Not Voted',
  duration: {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  },
  votingResults: {
    data: [
      {
        label: 'No Change',
        percent: 0,
        votes: 0
      },
      {
        label: 'Dual Token',
        percent: 0,
        votes: 0
      },
      {
        label: 'Transaction Split',
        percent: 0,
        votes: 0
      }
    ],
    totalVoted: 0
  }
})

export const getters = {
  balance: (state, getters, rootState, rootGetters) => {
    const ethAccount = rootState.metamask.ethAccount
    const { tokenDecimals } = rootGetters['metamask/networkConfig']
    const amount = participants[ethAccount] || 0
    const withDecimals = BN(amount).div(BN(10).pow(tokenDecimals))
    return withDecimals.toFormat()
  },
  votingInstance: (state, getters, rootState, rootGetters) => {
    const web3 = rootGetters['metamask/web3']
    const { votingContractAddress } = rootGetters['metamask/networkConfig']
    return new web3.eth.Contract(votingABI, votingContractAddress)
  },
  txExplorerUrl: (state, getters, rootState, rootGetters) => txName => {
    const { explorerUrl } = rootGetters['metamask/networkConfig']
    return explorerUrl.tx + state[txName].txHash
  },
  txHashToRender: state => (txName, txHash) => {
    const hash = txHash || state[txName].txHash
    return hash.slice(0, 20) + '...' + hash.slice(-20)
  },
  txStatusClass: state => status => {
    let cssClass
    switch (status) {
      case 1: // success
        cssClass = 'is-success'
        break
      case 0: // fail
        cssClass = 'is-danger'
        break
      default:
        cssClass = 'is-loading'
        break
    }
    return cssClass
  },
  isUserInVotingList: (state, getters, rootState, rootGetters) => {
    const ethAccount = rootState.metamask.ethAccount
    return participants[ethAccount] !== undefined
  },
  merkleTreeLeafs: (state, getters, rootState, rootGetters) => {
    const web3 = rootGetters['metamask/web3']
    return Object.entries(participants).map(holder => {
      const leaf = web3.eth.abi.encodeParameters(['address', 'uint256'], holder)
      return soliditySha3(leaf)
    })
  },
  userMerkleTreeLeaf: (state, getters, rootState, rootGetters) => {
    const web3 = rootGetters['metamask/web3']
    const ethAccount = rootState.metamask.ethAccount
    return soliditySha3(
      web3.eth.abi.encodeParameters(['address', 'uint256'], [ethAccount, participants[ethAccount]])
    )
  },
  expectedVotingAmount: state => {
    return Object.entries(participants).reduce((accum, [ethAccount, value]) => {
      accum = accum.plus(value)
      return accum
    }, BN('0'))
  }
}

export const mutations = {
  SAVE_VOTE_TX_HASH(state, { txHash }) {
    this._vm.$set(state.voteTx, 'txHash', txHash)
  },
  CHANGE_VOTE_TX_STATUS(state, { status }) {
    this._vm.$set(state.voteTx, 'status', status)
  },
  SAVE_EXPIRATION_DATE(state, expirationDate) {
    state.expirationDate = expirationDate
  },
  SAVE_DECISION(state, decision) {
    state.decision = decision
  },
  SAVE_DURATION(state, duration) {
    state.duration = duration
  },
  SAVE_VOTING_PERCENTAGES(
    state,
    {
      noChangePercent,
      txSplitPercent,
      dualTokenPercent,
      noChangeVotes,
      dualTokenVotes,
      txSplitVotes,
      totalVoted,
      tokenDecimals
    }
  ) {
    const power = BN(10).exponentiatedBy(tokenDecimals)
    this._vm.$set(state, 'votingResults', {
      data: [
        {
          label: 'No Change',
          percent: BN(noChangePercent)
            .dividedBy(100)
            .toString(10),
          votes: BN(noChangeVotes)
            .div(power)
            .toFixed()
        },
        {
          label: 'Dual Token',
          percent: BN(dualTokenPercent)
            .dividedBy(100)
            .toString(10),
          votes: BN(dualTokenVotes)
            .div(power)
            .toFixed()
        },
        {
          label: 'Transaction Split',
          percent: BN(txSplitPercent)
            .dividedBy(100)
            .toString(10),
          votes: BN(txSplitVotes)
            .div(power)
            .toFixed()
        }
      ],
      totalVoted: BN(totalVoted)
        .div(power)
        .toFixed()
    })
  }
}

export const actions = {
  async vote({ dispatch, getters, rootGetters, rootState, commit }, { votingOption }) {
    try {
      votingOption = DECISIONS[votingOption]
      const gasPrice = rootGetters['metamask/gasPrice']
      const { ethAccount } = rootState.metamask
      const { votingInstance } = getters
      const votingAmount = participants[ethAccount]
      const merkleTree = new this.$merkleTree(getters.merkleTreeLeafs)
      const proof = merkleTree.getHexProof(getters.userMerkleTreeLeaf)

      const data = votingInstance.methods.vote(votingOption, votingAmount, proof).encodeABI()
      const gas = await votingInstance.methods
        .vote(votingOption, votingAmount, proof)
        .estimateGas({ from: ethAccount })
      const callParams = {
        method: 'eth_sendTransaction',
        params: [
          {
            from: ethAccount,
            to: votingInstance.address,
            gas: numberToHex(gas + 10000),
            gasPrice,
            data
          }
        ],
        from: ethAccount
      }
      const txHash = await dispatch('metamask/sendAsync', callParams, {
        root: true
      })
      commit('SAVE_VOTE_TX_HASH', { txHash })

      const { status } = await dispatch('metamask/waitForTxReceipt', { txHash }, { root: true })
      await dispatch('askVotingForChanges', {
        method: 'votes',
        params: [ethAccount],
        currentValue: 0
      })
      commit('SAVE_DECISION', votingOption)
      commit('CHANGE_VOTE_TX_STATUS', { status: hexToNumber(status) })
    } catch (e) {
      console.error(e)
    }
  },
  async fetchExpiration({ getters, commit, dispatch }) {
    const { votingInstance } = getters
    let expirationDate = await votingInstance.methods.expirationDate().call()
    expirationDate = Number(expirationDate.toString())
    commit('SAVE_EXPIRATION_DATE', expirationDate)
    dispatch('calcutateDuration')
  },
  async fetchVotingPercentages({ getters, commit, dispatch, rootGetters }) {
    const { smartContractPollTime, tokenDecimals } = rootGetters['metamask/networkConfig']
    try {
      const { votingInstance, expectedVotingAmount } = getters
      const {
        noChangePercent,
        txSplitPercent,
        dualTokenPercent,
        noChangeVotes,
        dualTokenVotes,
        txSplitVotes,
        totalVoted
      } = await votingInstance.methods.votingPercentages(expectedVotingAmount.toString(10)).call()
      commit('SAVE_VOTING_PERCENTAGES', {
        noChangePercent,
        txSplitPercent,
        dualTokenPercent,
        noChangeVotes,
        dualTokenVotes,
        txSplitVotes,
        totalVoted,
        tokenDecimals
      })
    } catch (e) {
      console.error('fetchVotingPercentages', e)
    }
    setTimeout(() => {
      dispatch('fetchVotingPercentages')
    }, smartContractPollTime * 1000)
  },
  calcutateDuration({ state, commit, dispatch }) {
    const { expirationDate } = state
    const currentTime = moment().unix()
    const duration = moment.duration(expirationDate - currentTime, 'seconds')
    const durationLeft = {
      days: duration.days(),
      hours: duration.hours(),
      minutes: duration.minutes(),
      seconds: duration.seconds()
    }
    commit('SAVE_DURATION', durationLeft)
    setTimeout(() => {
      dispatch('calcutateDuration')
    }, 1000)
  },
  async fetchDecision({ getters, commit, rootState, rootGetters }) {
    const { votingInstance } = getters
    const { ethAccount } = rootState.metamask
    const { deployedBlockNumber } = rootGetters['metamask/networkConfig']
    const event = await votingInstance.getPastEvents('NewVote', {
      fromBlock: deployedBlockNumber,
      toBlock: 'latest',
      filter: { who: ethAccount }
    })
    if (event.length) {
      commit('SAVE_DECISION', event[0].returnValues.vote)
      commit('SAVE_VOTE_TX_HASH', { txHash: event[0].transactionHash })
      commit('CHANGE_VOTE_TX_STATUS', { status: 1 })
    }
  },
  fetchStats({ dispatch, commit }) {
    dispatch('fetchExpiration')
    dispatch('fetchDecision')
    dispatch('fetchVotingPercentages')
  },
  askVotingForChanges({ dispatch, getters, rootGetters }, { method, params = [], currentValue }) {
    const { votingInstance } = getters
    const { rpcCallRetryAttempt } = rootGetters['metamask/networkConfig']
    const data = votingInstance.methods[method](...params).encodeABI()
    currentValue = new BN(currentValue)
    return new Promise(async (resolve, reject) => {
      const checkForChanges = async ({ retryAttempt = 0, currentValue, rpcCallRetryAttempt }) => {
        retryAttempt++
        const newValue = await dispatch(
          'metamask/callWeb3',
          { data, to: votingInstance.address, web3Method: 'call' },
          { root: true }
        )
        if (new BN(newValue).isEqualTo(currentValue)) {
          if (retryAttempt > rpcCallRetryAttempt) {
            return reject(new Error(`return value of '${method}' method was not changed`))
          }
          setTimeout(async () => {
            await checkForChanges({ retryAttempt, currentValue, rpcCallRetryAttempt })
          }, 1000 * retryAttempt)
        } else {
          return resolve(newValue)
        }
      }
      await checkForChanges({ currentValue, rpcCallRetryAttempt })
    })
  }
}
