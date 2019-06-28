require('dotenv').config()
const fs = require('fs');
let {
    RPC_URL,
    TOKEN_ADDRESS,
    DB_HOST,
    DB_PORT,
    DB_NAME,
    NET_ID,
    FROM_BLOCK,
    TO_BLOCK, 
    BLOCK_INTERVAL,
    TOKEN_DECIMALS
} = process.env
const Web3 = require('web3')
const { toWei } = require('web3-utils')
const ERC20_ABI = require('./ERC20.abi.json')
const { initialize } = require('./db')
const BN = require('bignumber.js')
BLOCK_INTERVAL = Number(BLOCK_INTERVAL)
TO_BLOCK = Number(TO_BLOCK)
FROM_BLOCK = Number(FROM_BLOCK)
const web3 = new Web3(RPC_URL)

async function main() {
  let addresses = {}
  return new Promise(async (resolve, reject) => {
    console.log(RPC_URL, TOKEN_ADDRESS)
    const {dbConnection, client} = await initialize({ host: DB_HOST,
      port: DB_PORT,
      dbName: DB_NAME
    })
    const token = web3.eth.Contract(ERC20_ABI, TOKEN_ADDRESS)
    // addresses['0x372427Ce1d7Cda259597896d3433243C73774724'] = '1000000000000000000000000000'
    for(let i = FROM_BLOCK; i <= TO_BLOCK; i=i+BLOCK_INTERVAL) {
      console.log(`from ${i} to ${i+BLOCK_INTERVAL}`)
      const events = await token.getPastEvents('Transfer', {
        fromBlock: i,
        toBlock: i+BLOCK_INTERVAL
      })
      for( event of events ) {
        const {from, to, value} = event.returnValues
        try {
          if (from !== '0x0000000000000000000000000000000000000000') {
            addresses[from] = BN(addresses[from] || 0).minus(value.toString(10)).toFixed()
          }
          if (to !== '0x0000000000000000000000000000000000000000') {
            addresses[to] = BN(addresses[to] || 0).plus(value.toString(10)).toFixed()
          }
        } catch(e) {
          console.error(e)
        }
  
      }
    }
    addresses = Object.entries(addresses).filter(([address, value]) => !BN(value).isZero() )
    let total = addresses.reduce((totalValue, [address, value]) => {
      totalValue = BN(value).plus(totalValue)
      return totalValue
    }, BN(0))
    const prepareArray = addresses.map(([address, value]) => {
      return {ethAccount: address, value}
    })
    await dbConnection.collection(`ethAddressesWithBalance${NET_ID}`).insertMany(prepareArray)
    total = total.div(BN(10).pow(TOKEN_DECIMALS))
    console.log('Total holders:', prepareArray.length, 'Total balance', total.toFormat())
    await createFile({dbConnection})
    await client.close()
    resolve()

  })

}

function createFile({ dbConnection }) {
  return new Promise(async (resolve, reject) => {
    let participants = await dbConnection.collection(`ethAddressesWithBalance${NET_ID}`)
      .find()
      .project({ _id: 0, ethAccount: 1, value: 1 })
      .toArray();
    participants = participants.reduce((accum, { ethAccount, value }) => {
      accum[ethAccount] = value;
      return accum
    }, {})
    participants = JSON.stringify(participants, null, 2);
    fs.writeFileSync('participants.json', participants)
    console.log('participants.json file has been created as well');
    resolve()
  })
}


async function addExtra() {
  return new Promise(async (resolve, reject) => {
    const {dbConnection, client} = await initialize({ host: DB_HOST,
      port: DB_PORT,
      dbName: DB_NAME
    })
    const extra = [
      {
        address: '0x31Fa15e720F140CFa08b151bA9A7F85bfb30712E',
        value: toWei('1500000')
      },
      {
        address: '0xA43Ce8Cc89Eff3AA5593c742fC56A30Ef2427CB0',
        value: toWei('2500000')
      },
      {
        address: '0x0039F22efB07A647557C7C5d17854CFD6D489eF3',
        value: toWei('3500000')
      },
      {
        address: '0xC8c30Fa803833dD1Fd6DBCDd91Ed0b301EFf87cF',
        value: toWei('4500000')
      },
      {
        address: '0x7725d1FE8Bb1537117cb7289Ba24D7EBCfc594D8',
        value: toWei('1370004')
      },
      {
        address: '0x33471b4544ef94524318420ea1a2089bB634bf79',
        value: toWei('6779561')
      }
    ]
    for(let i = 0; i < extra.length; i++) {
      await dbConnection.collection(`ethAddressesWithBalance${NET_ID}`).updateOne({
        ethAccount: extra[i].address
      }, {
        $set: {value: extra[i].value}
      },{
        upsert: true
      })
    }
    await client.close()
    resolve()
  })
}

async function run() {
  // only for testing we can add some extra addresses
  // await addExtra()
  await main()
}

run()
