const express = require("express");
const router = express.Router();
const { getCollection } = require("../db");
const verifyJWT = require("../middleware/verifyJWT");
const verifyAdmin = require("../middleware/verifyAdmin");

router.put("/users", async (req, res, next) => {
  try {
    const usersCollection = getCollection("users");
    const user = req.body;
    const email = user.email;
    const result = await usersCollection.updateOne(
      { email },
      { $set: user },
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.get("/headerName/:email", async (req, res, next) => {
  try {
    const usersCollection = getCollection("users");
    const query = req.params;
    const result = await usersCollection.findOne(query);
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.get("/userData/:email", async (req, res, next) => {
  try {
    const usersCollection = getCollection("users");
    const query = req.params;
    const result = await usersCollection.findOne(query);
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.put("/updateUser", async (req, res, next) => {
  try {
    const usersCollection = getCollection("users");
    const { email, address, phone, education } = req.body;
    const result = await usersCollection.updateOne(
      { email },
      { $set: { address, phone, education } },
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.get("/allUser", verifyJWT, verifyAdmin, async (req, res, next) => {
  try {
    const usersCollection = getCollection("users");
    const result = await usersCollection.find({}).toArray();
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.put("/makeAdmin/:id", verifyJWT, verifyAdmin, async (req, res, next) => {
  try {
    const usersCollection = getCollection("users");
    const { id } = req.params;
    const result = await usersCollection.updateOne(
      { _id: require("mongodb").ObjectId(id) },
      { $set: { role: "admin" } },
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.get("/checkAdmin/:email", async (req, res, next) => {
  try {
    const usersCollection = getCollection("users");
    const { email } = req.params;
    const result = await usersCollection.findOne({ email });
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.post("/getToken", async (req, res, next) => {
  try {
    const jwt = require("jsonwebtoken");
    const user = req.body;
    const token = jwt.sign(user, process.env.JWT_TOKEN, { expiresIn: "1d" });
    res.send({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
