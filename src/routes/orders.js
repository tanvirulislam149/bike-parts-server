router.post("/orders", verifyJWT, async (req, res, next) => {
  try {
    const ordersCollection = getCollection("orders");
    const order = req.body;
    const result = await ordersCollection.insertOne(order);
    res.send(result);
  } catch (err) {
    next(err);
  }
});

// GET /orders/:email -- NOTE: original code used req.params as whole object; preserve by matching behavior
router.get("/orders/:email", async (req, res, next) => {
  try {
    const ordersCollection = getCollection("orders");
    const query = req.params; // same shape as original
    const cursor = ordersCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
  } catch (err) {
    next(err);
  }
});

// GET /orders (protected) -- original finds by query.email and query.id and returns a single order
router.get("/orders", verifyJWT, async (req, res, next) => {
  try {
    const ordersCollection = getCollection("orders");
    const email = req.query.email;
    const id = req.query.id;
    const result = await ordersCollection.findOne({
      _id: require("mongodb").ObjectId(id),
      email: email,
    });
    res.send(result);
  } catch (err) {
    next(err);
  }
});

// GET /allOrders (admin)
router.get("/allOrders", verifyJWT, verifyAdmin, async (req, res, next) => {
  try {
    const ordersCollection = getCollection("orders");
    const result = await ordersCollection.find({}).toArray();
    res.send(result);
  } catch (err) {
    next(err);
  }
});

// GET /deleteOrder/:id
router.get("/deleteOrder/:id", async (req, res, next) => {
  try {
    const ordersCollection = getCollection("orders");
    const { id } = req.params;
    const result = await ordersCollection.deleteOne({
      _id: require("mongodb").ObjectId(id),
    });
    res.send(result);
  } catch (err) {
    next(err);
  }
});

// GET /shipped/:id (admin)
router.get("/shipped/:id", verifyJWT, verifyAdmin, async (req, res, next) => {
  try {
    const ordersCollection = getCollection("orders");
    const { id } = req.params;
    const result = await ordersCollection.updateOne(
      { _id: require("mongodb").ObjectId(id) },
      { $set: { status: "Shipped" } },
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    next(err);
  }
});

// GET /cancelOrder/:id (admin)
router.get(
  "/cancelOrder/:id",
  verifyJWT,
  verifyAdmin,
  async (req, res, next) => {
    try {
      const ordersCollection = getCollection("orders");
      const { id } = req.params;
      const result = await ordersCollection.deleteOne({
        _id: require("mongodb").ObjectId(id),
      });
      res.send(result);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /updateOrder
router.put("/updateOrder", async (req, res, next) => {
  try {
    const ordersCollection = getCollection("orders");
    const id = req.body.orderId;
    const transId = req.body.transactionId;
    const { address, phone } = req.body;
    const result = await ordersCollection.updateOne(
      { _id: require("mongodb").ObjectId(id) },
      {
        $set: {
          pay: "paid",
          transactionId: transId,
          address: address,
          phone: phone,
          status: "Pending",
        },
      },
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
