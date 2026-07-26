// slop/receiver.js
import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

const app = express();
const PORT = 5000;

// Update if using MongoDB Atlas or custom port
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = "slop_db";
const COLLECTION_NAME = "ingested_telemetry";

let collection;

app.use(cors());
app.use(express.text({ type: "application/json" }));
app.use(express.json());

MongoClient.connect(MONGO_URI)
  .then((client) => {
    console.log("[SLOP] Connected to MongoDB");
    collection = client.db(DB_NAME).collection(COLLECTION_NAME);
  })
  .catch((err) => console.error("[SLOP] MongoDB Connection Error:", err));

app.post("/api/telemetry", async (req, res) => {
  try {
    const rawBody = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const record = {
      ...rawBody,
      serverMetadata: {
        receivedAt: new Date().toISOString(),
        clientIp: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        headers: req.headers,
      }
    };

    if (collection) {
      await collection.insertOne(record);
      return res.status(200).json({ status: "dumped" });
    }
    return res.status(500).json({ error: "DB not connected" });
  } catch (err) {
    console.error("[SLOP] Ingestion Error:", err);
    return res.status(500).json({ error: "Failed to process payload" });
  }
});

app.listen(PORT, () => {
  console.log(`[SLOP] Receiver active at http://localhost:${PORT}`);
});