const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const stripe = require("stripe")(process.env.SECRET_KEY);
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
  const authHeaders = req.headers.authorization;
  if (!authHeaders) {
    return res.status(401).send({ message: "unauthorized access" })
  }
  jwt.verify(authHeaders, process.env.JWT_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" })
    }
    req.decoded = decoded;
    next();
  })
}




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.idgn7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
  try {
    await client.connect();

    const partsCollection = client.db("autoParts").collection("parts");
    const ordersCollection = client.db("autoParts").collection("orders");
    const usersCollection = client.db("autoParts").collection("users");
    const reviewsCollection = client.db("autoParts").collection("reviews");

    app.get("/", async (req, res) => {
      res.send("Auto Parts Company");
    })


    const verifyAdmin = async (req, res, next) => {
      const user = req.decoded.email;
      const userAccount = await usersCollection.findOne({ email: user });
      if (userAccount.role === 'admin') {
        next();
      }
      else {
        res.status(403).send({ message: 'forbidden' });
      }
    }


    app.post("/getToken", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_TOKEN, { expiresIn: "1d" });
      res.send({ token });
    })



    app.post("/create-payment-intent", async (req, res) => {
      const order = req.body;
      const price = order.price;
      const money = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: money,
        currency: "usd",
        payment_method_types: ["card"]
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    })

    app.get("/parts", async (req, res) => {
      const query = {};
      const cursor = partsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/purchase/:partsId", verifyJWT, async (req, res) => {
      const id = req.params.partsId;
      const query = { _id: ObjectId(id) };
      const result = await partsCollection.findOne(query);
      res.send(result);
    })

    app.post("/orders", verifyJWT, async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    })

    app.put("/updateQuantity", verifyJWT, async (req, res) => {
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

    app.put("/users", async (req, res) => {
      const user = req.body;
      const email = req.body.email;
      const filter = { email: email }
      const options = { upsert: true };
      const updateDoc = {
        $set: user
      }
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    app.get("/headerName/:email", async (req, res) => {
      const email = req.params;
      const query = email;
      const result = await usersCollection.findOne(query);
      res.send(result);
    })

    app.get("/orders/:email", async (req, res) => {
      const email = req.params;
      const query = email;
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/orders", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const id = req.query.id;
      const query = { _id: ObjectId(id), email: email };
      const result = await ordersCollection.findOne(query);
      res.send(result);
    })

    app.get("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    })

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    })

    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewsCollection.find(query);
      const result = await cursor.toArray()
      res.send(result);
    })

    app.put("/updateOrder", async (req, res) => {
      const id = req.body.orderId;
      const transId = req.body.transactionId;
      const { address, phone } = req.body;
      const filter = { _id: ObjectId(id) }
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          pay: "paid",
          transactionId: transId,
          address: address,
          phone: phone,
          status: "Pending"
        }
      }
      const result = await ordersCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    app.get("/userData/:email", async (req, res) => {
      const email = req.params;
      const query = email;
      const result = await usersCollection.findOne(query);
      res.send(result);
    })

    app.put("/updateUser", async (req, res) => {
      const { email, address, phone, education } = req.body;
      const filter = { email: email }
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          address,
          phone,
          education
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    app.get("/allUser", verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const cursor = usersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.put("/makeAdmin/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const { id } = req.params;
      console.log(id);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { role: "admin" }
      }
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    app.get("/checkAdmin/:email", async (req, res) => {
      const { email } = req.params;
      const filter = { email: email };
      const result = await usersCollection.findOne(filter);
      res.send(result);
    })

    app.post("/parts", verifyJWT, verifyAdmin, async (req, res) => {
      const product = req.body;
      const result = await partsCollection.insertOne(product);
      res.send(result);
    })

    app.get("/allOrders", verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/shipped/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const { id } = req.params;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          status: "Shipped",
        }
      }
      const result = await ordersCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    app.get("/cancelOrder/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) }
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    })

    app.get("/deleteProduct/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) }
      const result = await partsCollection.deleteOne(query);
      res.send(result);
    })


  } finally {
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})