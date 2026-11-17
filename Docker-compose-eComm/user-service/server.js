const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(express.json());

const PORT = 3001;

const client = new MongoClient(
  process.env.MONGO_URL
);

let usersCollection;

async function startServer() {
  await client.connect();

  const db = client.db("ecommerce");

  usersCollection = db.collection("users");

  console.log("User Service connected to MongoDB");

  app.post("/users", async (req, res) => {
    try {
      const result = await usersCollection.insertOne({
        name: req.body.name,
        email: req.body.email
      });

      res.status(201).json({
        message: "User created successfully",
        userId: result.insertedId
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/users/:id", async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          error: "Invalid user ID"
        });
      }

      const user = await usersCollection.findOne({
        _id: new ObjectId(req.params.id)
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found"
        });
      }

      res.json(user);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`User Service running on ${PORT}`);
  });
}

startServer().catch(console.error);
