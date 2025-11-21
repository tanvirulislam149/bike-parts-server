require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./src/db");
const routes = require("./src/routes");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// register routes
app.use("/", routes);

// start server after connecting to DB
async function start() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
