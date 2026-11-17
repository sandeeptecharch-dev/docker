const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(express.json());

const PORT = 3002;

const client = new MongoClient(
  process.env.MONGO_URL
);

let ordersCollection;

async function startServer() {
  await client.connect();

  const db = client.db("ecommerce");

  ordersCollection = db.collection("orders");

  console.log("Order Service connected to MongoDB");

  app.post("/orders/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;

      // Communicate with User Service
      const response = await fetch(
        `http://user-service:3001/users/${userId}`
      );

      if (!response.ok) {
        return res.status(response.status).json({
          error: "User verification failed"
        });
      }

      const user = await response.json();

      // Save order in MongoDB
      const result = await ordersCollection.insertOne({
        userId: user._id,
        userName: user.name,
        product: req.body.product,
        amount: req.body.amount,
        createdAt: new Date()
      });

      res.status(201).json({
        message: "Order created successfully",
        orderId: result.insertedId,
        customer: user.name
      });

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  });

  app.get("/orders", async (req, res) => {
    const orders = await ordersCollection.find().toArray();

    res.json(orders);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Order Service running on ${PORT}`);
  });
}

startServer().catch(console.error);
