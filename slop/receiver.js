// slop/receiver.js
import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = "slop_db";
const COLLECTION_NAME = "ingested_telemetry";

let collection;

// Middleware configuration
app.use(cors());
app.use(express.text({ type: "application/json", limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

// MongoDB Initialization
async function initializeDB() {
  try {
    const client = await MongoClient.connect(MONGO_URI);
    console.log("[SLOP] Connected successfully to MongoDB");
    const db = client.db(DB_NAME);
    collection = db.collection(COLLECTION_NAME);

    // Create index on visitor IDs and timestamp for analytics querying
    await collection.createIndex({ "identity.fingerprintJS.visitorId": 1 });
    await collection.createIndex({ "serverMetadata.receivedAt": -1 });
  } catch (err) {
    console.error("[SLOP] MongoDB Connection Error:", err);
  }
}

initializeDB();

// Receiver Endpoint
app.post("/api/telemetry", async (req, res) => {
  if (!collection) {
    return res.status(503).json({ error: "Database service unavailable" });
  }

  try {
    const rawBody = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const record = {
      ...rawBody,
      serverMetadata: {
        receivedAt: new Date().toISOString(),
        clientIp: req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"] || null,
        headers: req.headers,
      },
    };

    const result = await collection.insertOne(record);
    return res.status(200).json({ status: "dumped", id: result.insertedId });
  } catch (err) {
    console.error("[SLOP] Ingestion Error:", err);
    return res.status(500).json({ error: "Failed to process payload" });
  }
});

app.listen(PORT, () => {
  console.log(`[SLOP] Receiver active at http://localhost:${PORT}`);
});

// Add to slop/receiver.js
app.get("/api/telemetry/latest", async (req, res) => {
  try {
    if (!collection) {
      return res.status(503).json({ error: "Database service unavailable" });
    }

    // Retrieve the 10 most recent telemetry dumps indexed by timestamp
    const dumps = await collection
      .find({})
      .sort({ "serverMetadata.receivedAt": -1, _id: -1 })
      .limit(10)
      .toArray();
                                                                                console.log(`==INITIATING DUMP==\n\n${JSON.stringify(dumps, null, 2)}\n\n==END OF DUMP==`);
    return res.status(200).json(dumps);
  } catch (err) {
    console.error("[SLOP] Fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch telemetry dumps" });
  }
});