// slop/receiver.js
import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = "slop_db";
const COLLECTION_NAME = "ingested_telemetry";
const COLLECTION_NAME_2 = "raw_event_streams";

let collection;
let rawEventStreams;

// Middleware configuration
app.use(cors());
app.use(express.text({ type: ["text/plain", "application/json"], limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

// MongoDB Initialization
async function initializeDB() {
  try {
    const client = await MongoClient.connect(MONGO_URI);
    console.log("[SLOP] Connected successfully to MongoDB");
    const db = client.db(DB_NAME);
    collection = db.collection(COLLECTION_NAME);
    rawEventStreams = db.collection(COLLECTION_NAME_2);

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

                console.log("[RECEIVED]:["+Date.now()+"]" );
    return res.status(200).json(dumps);
  } catch (err) {
    console.error("[SLOP] Fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch telemetry dumps" });
  }
});


/**
 * SINGLE-PURPOSE RRWEB STREAM ENDPOINT
 * GET /api/telemetry/rrweb/stream
 *
 * Pulls all recorded telemetry documents, extracts rrweb event arrays,
 * flattens them, deduplicates identical events, and forces correct
 * initialization order (Meta [4] -> FullSnapshot [2] -> Incremental [3]).
 */
app.get("/api/telemetry/rrweb/stream", async (req, res) => {
  if (!collection) {
    return res.status(503).json({ error: "Database service unavailable" });
  }

  try {
    // 1. Fetch raw documents using the module-scoped `collection`
    const rawDumps = await collection.find({}).toArray();

    if (!rawDumps || rawDumps.length === 0) {
      return res.json([]);
    }

    // 2. Extract and flatten all rrweb events from incoming payloads
    const allEvents = [];
    rawDumps.forEach((dump) => {
      // Extract array whether nested under dump.payload or directly in dump
      const payload = dump.payload || dump;
      if (Array.isArray(payload)) {
        payload.forEach((event) => {
          // Verify it's an rrweb event structure (has numeric 'type' and 'timestamp')
          if (event && typeof event.type === "number" && event.timestamp) {
            allEvents.push(event);
          }
        });
      }
    });

    if (allEvents.length === 0) {
      return res.json([]);
    }

    // 3. Deduplicate events (using timestamp + type + payload string length)
    const seen = new Set();
    const uniqueEvents = allEvents.filter((event) => {
      const key = `${event.timestamp}-${event.type}-${JSON.stringify(event.data || {}).length}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 4. Primary sort by event.timestamp ASC
    uniqueEvents.sort((a, b) => a.timestamp - b.timestamp);

    // 5. Enforce baseline initialization order for matching timestamps:
    // Meta (4) MUST come before FullSnapshot (2), followed by everything else.
    uniqueEvents.sort((a, b) => {
      if (a.timestamp === b.timestamp) {
        if (a.type === 4) return -1;
        if (b.type === 4) return 1;
        if (a.type === 2) return -1;
        if (b.type === 2) return 1;
      }
      return 0;
    });

    return res.json(uniqueEvents);
  } catch (err) {
    console.error("[RRWeb Stream Error]:", err);
    return res.status(500).json({ error: "Failed to assemble rrweb stream" });
  }
});

/**
 * PARAMETERIZED RRWEB STREAM ENDPOINT
 * GET /api/telemetry/rrweb/stream/:sessionUUID
 */
app.get("/api/telemetry/rrweb/stream/:sessionUUID", async (req, res) => {
  if (!rawEventStreams) {
    return res.status(503).json({ error: "Database service unavailable" });
  }

  const { sessionUUID } = req.params;

  try {
    // 1. Pull exclusively from the rawEventStreams collection
    const rawDumps = await rawEventStreams.find({ session_UUID: sessionUUID }).toArray();

    if (!rawDumps || rawDumps.length === 0) {
      return res.json([]);
    }

    // 2. Extract, flatten, deduplicate, and sort
    const allEvents = [];
    rawDumps.forEach((dump) => {
      const payload = dump.payload || dump;
      if (Array.isArray(payload)) {
        payload.forEach((event) => {
          if (event && typeof event.type === "number" && event.timestamp) {
            allEvents.push(event);
          }
        });
      }
    });

    if (allEvents.length === 0) return res.json([]);

    const seen = new Set();
    const uniqueEvents = allEvents.filter((event) => {
      const key = `${event.timestamp}-${event.type}-${JSON.stringify(event.data || {}).length}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort chronologically and enforce Meta (4) -> FullSnapshot (2) order
    uniqueEvents.sort((a, b) => a.timestamp - b.timestamp);
    uniqueEvents.sort((a, b) => {
      if (a.timestamp === b.timestamp) {
        if (a.type === 4) return -1;
        if (b.type === 4) return 1;
        if (a.type === 2) return -1;
        if (b.type === 2) return 1;
      }
      return 0;
    });

    return res.json(uniqueEvents);
  } catch (err) {
    console.error("[RRWeb Stream Error]:", err);
    return res.status(500).json({ error: "Failed to assemble rrweb stream" });
  }
});

/**
 * POST /api/telemetry/rrweb/stream
 * Ingests high-frequency raw rrweb event payloads into raw_event_streams
 */
app.post("/api/telemetry/rrweb/stream", async (req, res) => {
  if (!rawEventStreams) {
    return res.status(503).json({ error: "Database service unavailable" });
  }

  try {
    const rawBody = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const record = {
      session_UUID: rawBody.session_UUID,
      payload: rawBody.payload || rawBody,
      serverMetadata: {
        receivedAt: new Date().toISOString(),
        clientIp: req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress,
      },
    };

    const result = await rawEventStreams.insertOne(record);
    return res.status(200).json({ status: "streamed", id: result.insertedId });
  } catch (err) {
    console.error("[SLOP] Raw Stream Ingestion Error:", err);
    return res.status(500).json({ error: "Failed to log raw stream payload" });
  }
});
// ORD

// ============================================================================
// DEBUG ENDPOINT: RRWEB VERIFICATION
// ============================================================================
app.get("/api/debug/rrweb", async (req, res) => {
  if (!collection) {
    return res.status(503).json({ error: "Database service unavailable" });
  }

  try {
    // Find recent documents where rrweb payload data exists
    // Supports both raw array payloads and flattened dot-notation fields
    const query = {
      $or: [
        { "payload.0": { $exists: true } },          // Unnested/Flattened array format
        { payload: { $type: "array", $ne: [] } },     // Direct array format
        { "payload.type": { $exists: true } }          // Single rrweb event object
      ]
    };

    const latestReplays = await collection
      .find(query)
      .sort({ _id: -1 })
      .limit(5)
      .toArray();

    if (latestReplays.length === 0) {
      return res.status(404).json({
        status: "empty",
        message: "No rrweb replay events found in database. Check client-side initialization or window.rrweb loading.",
      });
    }

    // Map summary metadata for quick inspection
    const summary = latestReplays.map((doc) => {
      // Reconstruct array items if stored in flattened format (e.g. payload.0, payload.1)
      let events = [];
      if (Array.isArray(doc.payload)) {
        events = doc.payload;
      } else {
        events = Object.keys(doc)
          .filter((key) => key.startsWith("payload."))
          .map((key) => doc[key]);
      }

      return {
        id: doc._id,
        session_UUID: doc.session_UUID || doc["session_UUID"],
        receivedAt: doc.serverMetadata?.receivedAt || doc["serverMetadata.receivedAt"],
        eventCount: events.length,
        sampleEvents: events.slice(0, 3), // First 3 events for visual inspection
      };
    });

    console.log(`\n== [DEBUG] RRWEB REPLAY DUMP (${summary.length} streams) ==\n`);
    console.dir(summary, { depth: null, colors: true });

    return res.status(200).json({
      status: "ok",
      totalCapturedStreams: latestReplays.length,
      streams: summary,
    });
  } catch (err) {
    console.error("[SLOP Debug] rrweb fetch error:", err);
    return res.status(500).json({ error: "Failed to inspect rrweb telemetry" });
  }
});



// ============================================================================
// POST ENDPOINT: RRWEB REAL-TIME STDOUT DEBUGGER & VALIDATOR
// ============================================================================
app.post("/api/telemetry/rrweb-debug", (req, res) => {
  const timestamp = new Date().toISOString();
  console.log("\n" + "=".repeat(80));
  console.log(`[SLOP DEBUGGER] Incoming rrweb payload received at ${timestamp}`);
  console.log("=".repeat(80));

  let rawBody = req.body;
  const issues = [];
  const warnings = [];

  // 1. Parse payload if delivered as string
  if (typeof rawBody === "string") {
    try {
      rawBody = JSON.parse(rawBody);
    } catch (err) {
      issues.push(`[CRITICAL] Payload body is invalid JSON: ${err.message}`);
      console.error("\x1b[31m%s\x1b[0m", issues[0]);
      console.log("Raw Text Received:", req.body);
      return res.status(400).json({ status: "error", issues });
    }
  }

  // 2. Validate top-level telemetry wrapper structure
  const { session_UUID, location, payload } = rawBody || {};

  if (!session_UUID) {
    issues.push("[MISSING FIELD] Root 'session_UUID' is missing.");
  }
  if (!location) {
    warnings.push("[WARNING] Root 'location' object is missing.");
  }

  if (payload === undefined || payload === null) {
    issues.push("[CRITICAL] Top-level 'payload' field is missing or null.");
  } else if (!Array.isArray(payload)) {
    issues.push(`[TYPE MISMATCH] Expected 'payload' to be an Array of rrweb events, but received type '${typeof payload}'.`);
  } else if (payload.length === 0) {
    warnings.push("[EMPTY STREAM] Payload array is empty. No rrweb events were buffered in this dispatch.");
  }

  // 3. Inspect individual rrweb events if payload is an array
  const RRWEB_EVENT_TYPES = {
    0: "DomContentLoaded",
    1: "Load",
    2: "FullSnapshot",
    3: "IncrementalSnapshot",
    4: "Meta",
    5: "Custom",
    6: "Plugin",
  };

  const eventCounts = {};
  let previousTimestamp = null;
  let largeDataNodes = 0;

  if (Array.isArray(payload) && payload.length > 0) {
    payload.forEach((evt, idx) => {
      const prefix = `Event [${idx}]`;

      if (typeof evt !== "object" || evt === null) {
        issues.push(`${prefix}: Is not an object (received ${typeof evt}).`);
        return;
      }

      // Check required rrweb properties
      if (evt.type === undefined) {
        issues.push(`${prefix}: Missing 'type' property.`);
      } else {
        const typeName = RRWEB_EVENT_TYPES[evt.type] || `Unknown (${evt.type})`;
        eventCounts[typeName] = (eventCounts[typeName] || 0) + 1;

        if (!(evt.type in RRWEB_EVENT_TYPES)) {
          warnings.push(`${prefix}: Unknown rrweb event type '${evt.type}'.`);
        }
      }

      if (!evt.timestamp) {
        issues.push(`${prefix}: Missing 'timestamp' property.`);
      } else if (typeof evt.timestamp !== "number") {
        issues.push(`${prefix}: Timestamp must be a numeric epoch millis timestamp, got '${typeof evt.timestamp}'.`);
      } else {
        // Check for chronological sequence
        if (previousTimestamp && evt.timestamp < previousTimestamp) {
          warnings.push(`${prefix}: Out of order! Timestamp (${evt.timestamp}) is earlier than previous event (${previousTimestamp}).`);
        }
        previousTimestamp = evt.timestamp;
      }

      if (!evt.data) {
        issues.push(`${prefix}: Missing 'data' object.`);
      } else {
        // Inspect for unmasked inputs or heavy inline payloads
        const strData = JSON.stringify(evt.data);
        if (strData.length > 100000) {
          largeDataNodes++;
          warnings.push(`${prefix}: Unusually large event data payload (${(strData.length / 1024).toFixed(2)} KB).`);
        }
      }
    });
  }

  // 4. Output validation summary to stdout
  console.log("\n--- [ METADATA & HEADERS ] ---");
  console.log(`Session UUID : ${session_UUID || "MISSING"}`);
  console.log(`Client IP    : ${req.headers["x-forwarded-for"] || req.socket.remoteAddress}`);
  console.log(`URL Origin   : ${location?.href || "N/A"}`);
  console.log(`Payload Size : ${(JSON.stringify(rawBody).length / 1024).toFixed(2)} KB`);

  console.log("\n--- [ EVENT BREAKDOWN ] ---");
  if (Object.keys(eventCounts).length > 0) {
    console.table(eventCounts);
  } else {
    console.log("No valid events to summarize.");
  }

  console.log("\n--- [ DIAGNOSTIC FINDINGS ] ---");
  if (issues.length === 0 && warnings.length === 0) {
    console.log("\x1b[32m%s\x1b[0m", "✔ PERFECT READOUT: No issues or warnings detected in this payload stream!");
  } else {
    if (issues.length > 0) {
      console.log(`\n\x1b[31m✘ ERRORS FOUND (${issues.length}):\x1b[0m`);
      issues.forEach((i) => console.log(`  \x1b[31m• ${i}\x1b[0m`));
    }
    if (warnings.length > 0) {
      console.log(`\n\x1b[33m⚠ WARNINGS (${warnings.length}):\x1b[0m`);
      warnings.forEach((w) => console.log(`  \x1b[33m• ${w}\x1b[0m`));
    }
  }

  // 5. Full Raw Event Payload Readout
  console.log("\n--- [ FULL RAW PAYLOAD READOUT ] ---");
  console.dir(rawBody, { depth: null, colors: true, maxArrayLength: null });
  console.log("=".repeat(80) + "\n");

  // Respond to client
  return res.status(200).json({
    status: issues.length === 0 ? "ok" : "issues_detected",
    eventCount: Array.isArray(payload) ? payload.length : 0,
    issues,
    warnings,
  });
});

// END