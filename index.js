const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.idgn7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();

        const partsCollection = client.db("autoParts").collection("parts");
        const ordersCollection = client.db("autoParts").collection("orders");

        app.get("/", async (req, res) => {
            res.send("Auto Parts Company");
        })

        app.get("/parts", async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/purchase/:partsId", async (req, res) => {
            const id = req.params.partsId;
            const query = { _id: ObjectId(id) };
            const result = await partsCollection.findOne(query);
            res.send(result);
        })

        app.post("/orders", async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        })

        app.put("/updateQuantity", async (req, res) => {
            const newQuantity = req.body.quantity;
            const id = req.body.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: { quantity: newQuantity }
            }
            const result = await partsCollection.updateOne(filter, updateDoc, options);
            res.send(result);

        })



    } finally {
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})