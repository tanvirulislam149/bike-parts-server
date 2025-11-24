const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.SECRET_KEY);

// POST /create-payment-intent
router.post("/create-payment-intent", async (req, res, next) => {
  try {
    const order = req.body;
    const price = order.price;
    const money = price * 100;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: money,
      currency: "usd",
      payment_method_types: ["card"],
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
