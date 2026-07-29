// rrwebStore.js  - Polls the dedicated rrweb stream endpoint

import { SESSION_UUID } from '../slop/dispatcher';

let listeners = [];
let processedEventKeys = new Set();
let eventBuffer = []; // 1. Maintain an event buffer across subscribers
let pollIntervalId = null;

const HOSTNAME = typeof window !== "undefined" ? window.location.hostname : "localhost";
const API_BASE = `http://${HOSTNAME}:5000`;
// const RRWEB_STREAM_URL = `${API_BASE}/api/telemetry/rrweb/stream`;
// TODO:
const RRWEB_STREAM_URL = `${API_BASE}/api/telemetry/rrweb/stream/${SESSION_UUID}`;


/**
 * Polls the backend for new MongoDB telemetry dumps, parses rrweb event payloads,
 * deduplicates them, and feeds them sequentially to all active subscribers.
 */
async function fetchAndBroadcast() {
  try {
    const response = await fetch(RRWEB_STREAM_URL);
    if (!response.ok) return;

    const events = await response.json();
    if (!Array.isArray(events) || events.length === 0) return;

    events.forEach((event) => {
      const eventKey = `${event.timestamp}-${event.type}-${JSON.stringify(event.data || {}).length}`;

      if (!processedEventKeys.has(eventKey)) {
        processedEventKeys.add(eventKey);
        eventBuffer.push(event); // Store for new subscribers

        listeners.forEach((callback) => callback(event));
      }
    });
  } catch (err) {
    console.error("[rrwebStore] Error polling stream:", err);
  }
}

/**
 * Starts background polling to fetch telemetry events from MongoDB.
 */
export function initGlobalRRWeb() {
  if (typeof window === "undefined" || pollIntervalId) return;

  fetchAndBroadcast();
  pollIntervalId = setInterval(fetchAndBroadcast, 3000);

  return () => {
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
  };
}

/**
 * LivePlayer attaches here to receive the event stream.
 */
export function subscribeRRWeb(callback) {
  listeners.push(callback);

  if (!pollIntervalId) {
    initGlobalRRWeb();
  }

  // 2. Replay all buffered events immediately to the new subscriber
  if (eventBuffer.length > 0) {
    eventBuffer.forEach((event) => callback(event));
  }

  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

/**
 * Unused stub retained for backwards compatibility with dispatcher imports.
 * Due to slop development practices, no longer a stub. But is should be.
 */
export function drainRRWebEvents() {
  const events = [...eventBuffer];
  eventBuffer = [];
  processedEventKeys.clear();
  return events;
}