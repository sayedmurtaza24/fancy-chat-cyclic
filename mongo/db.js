const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_DB_CONN_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});

let dbClient;
async function getDbClient() {
  if (dbClient) {
    return dbClient.db('fancychat');
  } else {
    dbClient = await client.connect();
    return dbClient.db('fancychat');
  }
}

async function getUsers() {
  return (await getDbClient()).collection('users');
}

module.exports = { getUsers };