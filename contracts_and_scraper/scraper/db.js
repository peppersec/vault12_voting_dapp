const { MongoClient } = require('mongodb')

async function initialize({ host, port, dbName }) {
  try {
    const url = `mongodb://${host}:${port}`
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
    const dbConnection = await conn.db(dbName)
    return {dbConnection, client}
  } catch (e) {
    console.error(`initialize = ${JSON.stringify({
      name: e.name,
      message: e.message,
      arguments: {
        host, port, dbName
      }
    })}`)
  }
}

module.exports = {
  initialize
}
