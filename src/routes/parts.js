const express = require("express");
const router = express.Router();
const { getCollection } = require("../db");
const verifyJWT = require("../middleware/verifyJWT");
const verifyAdmin = require("../middleware/verifyAdmin");

router.get("/", async (req, res) => {
  res.send("Auto Parts Company");
});

router.get("/parts", async (req, res, next) => {
  try {
    const partsCollection = getCollection("parts");
    const result = await partsCollection.find({}).toArray();
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.get("/purchase/:partsId", verifyJWT, async (req, res, next) => {
  try {
    const partsCollection = getCollection("parts");
    const id = req.params.partsId;
    const result = await partsCollection.findOne({
      _id: require("mongodb").ObjectId(id),
    });
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.post("/parts", verifyJWT, verifyAdmin, async (req, res, next) => {
  try {
    const partsCollection = getCollection("parts");
    const product = req.body;
    const result = await partsCollection.insertOne(product);
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.put("/updateQuantity", verifyJWT, async (req, res, next) => {
  try {
    const partsCollection = getCollection("parts");
    const { quantity, id } = req.body;
    const result = await partsCollection.updateOne(
      { _id: require("mongodb").ObjectId(id) },
      { $set: { quantity } },
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.get(
  "/deleteProduct/:id",
  verifyJWT,
  verifyAdmin,
  async (req, res, next) => {
    try {
      const partsCollection = getCollection("parts");
      const { id } = req.params;
      const result = await partsCollection.deleteOne({
        _id: require("mongodb").ObjectId(id),
      });
      res.send(result);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
