const { getCollection } = require("../db");

async function verifyAdmin(req, res, next) {
  try {
    const userEmail = req.decoded && req.decoded.email;
    const usersCollection = getCollection("users");
    const userAccount = await usersCollection.findOne({ email: userEmail });
    if (userAccount && userAccount.role === "admin") {
      return next();
    }
    return res.status(403).send({ message: "forbidden" });
  } catch (err) {
    next(err);
  }
}

module.exports = verifyAdmin;
