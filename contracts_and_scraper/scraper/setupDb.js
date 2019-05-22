
require('dotenv').config()
const { MongoClient } = require('mongodb')

const { DB_HOST, DB_PORT, DB_NAME, NET_ID } = process.env

async function main({ dbName, netId }) {
  try {
    const url = `mongodb://${DB_HOST}:${DB_PORT}`
    const client = new MongoClient(url, {
      useNewUrlParser: true,
      keepAlive: 30000 * 1000,
      connectTimeoutMS: 30000 * 1000,
      socketTimeoutMS: 360000 * 1000,
      reconnectTries: 100,
      reconnectInterval: 10000,
      loggerLevel: 'error'
    })
    const conn = await client.connect()
    const db = await conn.db(dbName)
    await db.dropDatabase()

    await db.createCollection(`ethAddresses${netId}`)
    await db.collection(`ethAddresses${netId}`).createIndex({ 'ethAccount': 1 }, { unique: true })
    await db.createCollection(`ethAddressesWithBalance${netId}`)
    await db.collection(`ethAddressesWithBalance${netId}`).createIndex({ 'ethAccount': 1 }, { unique: true })

    await client.close()
  } catch (e) {
    console.error(e)
  }
}
if (require.main === module) {
  main({
    host: DB_HOST,
    port: DB_PORT,
    dbName: DB_NAME,
    netId: NET_ID
  })
}
module.exports = main
