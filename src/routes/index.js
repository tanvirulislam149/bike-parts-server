const express = require("express");
const router = express.Router();

const partsRouter = require("./parts");
const ordersRouter = require("./orders");
const usersRouter = require("./users");
const reviewsRouter = require("./reviews");
const paymentsRouter = require("./payments");

// mount routers
router.use("/", partsRouter);
router.use("/", ordersRouter);
router.use("/", usersRouter);
router.use("/", reviewsRouter);
router.use("/", paymentsRouter);

module.exports = router;
