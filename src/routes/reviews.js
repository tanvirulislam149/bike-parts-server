const express = require("express");
const router = express.Router();
const { getCollection } = require("../db");

// POST /reviews
router.post("/reviews", async (req, res, next) => {
  try {
    const reviewsCollection = getCollection("reviews");
    const review = req.body;
    const result = await reviewsCollection.insertOne(review);
    res.send(result);
  } catch (err) {
    next(err);
  }
});

// GET /reviews
router.get("/reviews", async (req, res, next) => {
  try {
    const reviewsCollection = getCollection("reviews");
    const result = await reviewsCollection.find({}).toArray();
    res.send(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
