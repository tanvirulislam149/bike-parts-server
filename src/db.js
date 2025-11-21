const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.idgn7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
let _db;

async function connectDB() {
  if (_db) return _db;
  await client.connect();
  _db = client.db("autoParts");
  return _db;
}

function getCollection(name) {
  if (!_db) throw new Error("Database not connected. Call connectDB() first.");
  return _db.collection(name);
}

module.exports = { connectDB, getCollection, client };
