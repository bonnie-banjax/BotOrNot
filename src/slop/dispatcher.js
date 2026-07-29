import {
  getGPUInfo,
  getMemoryInfo,
  getNavigationTiming,
  getBatteryTelemetry,
  getMediaDevicesInfo,
  getAudioFingerprint,
  getCanvas2DFingerprint,
  getInstalledFontProfile,
  getSpeechVoices,
} from "./snitches.js";

import { record } from "rrweb";

/**
 * Higher-Order Telemetry Pipeline Factory
 * Standardizes lifecycle listeners, payload formatting, serialization, and
 *  dispatch across decoupled telemetry stream providers.
 */

function createTelemetryDispatcher({ endpoint, session_UUID, provider, interval }) {

  function send(data) {
    const dump = {
      session_UUID,
      timestamp: new Date().toISOString(),
      location: {
        href: window.location.href,
        referrer: document.referrer || null,
        origin: window.location.origin,
      },
      payload: data,
    };

    const payloadString = JSON.stringify(dump);

    // Use standard Blob with text/plain (CORS-safelisted type)
    const blob = new Blob([payloadString], { type: "text/plain;charset=UTF-8" });

    let sent = false;

    // 1. Primary Attempt: sendBeacon
    if (navigator.sendBeacon) {
      try {
        sent = navigator.sendBeacon(endpoint, blob);
      } catch (e) {
        sent = false;
      }
    }

    // 2. Fallback Attempt: fetch with keepalive
    if (!sent) {
      // keepalive caps at ~64KB. If over 60KB, strip keepalive to prevent hard NetworkError
      const isLargePayload = payloadString.length > 60000;

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: payloadString,
        keepalive: !isLargePayload,
        credentials: "omit",
        mode: "cors",
      }).catch((err) => {
        console.error(`[SLOP] Transmission failed [${endpoint}]:`, err);
      });
    }
  }

  async function flush() {
    try {
      const data = await provider();
      // Skip dispatching empty stream flushes (e.g., no new interaction counts)
      if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
        send(data);
      }
    } catch (err) {
      console.error(`[SLOP] Stream error [${endpoint}]:`, err);
    }
  }

  // function attach() {
  //   window.addEventListener("load", flush);
  //   window.addEventListener("visibilitychange", () => {
  //     if (document.visibilityState === "hidden") {
  //       flush();
  //     }
  //   });
  // }

  function attach() {
    window.addEventListener("load", flush);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        flush();
      }
    });

    // Continuously flush buffered rrweb mutations every N seconds
    if (interval===true) setInterval(flush, 1000);
  }

  return { flush, attach };
}

// ============================================================================
// STREAM PROVIDERS
// ============================================================================

/** 1. Hand-Rolled Interaction Listeners Stream */
function createInteractionStream() {
  let clicks = 0;
  let keyPresses = 0;
  let mouseMoves = 0;

  window.addEventListener("click", () => clicks++, { passive: true });
  window.addEventListener("keydown", () => keyPresses++, { passive: true });
  window.addEventListener("mousemove", () => mouseMoves++, { passive: true });

  return function collectInteractions() {
    return { clicks, keyPresses, mouseMoves };
  };
}

/** 2. rrweb Session Replay Stream */
function createRRWebStream() {
  const rrwebEvents = [];

  // Prefer ES module import, fall back to global window.rrweb
  const recordFn = typeof record === "function" ? record : window.rrweb?.record;

  if (typeof recordFn === "function") {
    try {
      recordFn({
        emit(event) {
          rrwebEvents.push(event);
        },
        maskAllInputs: false,
      });
    } catch (err) {
      console.error("[SLOP] Failed to initialize rrweb recording:", err);
    }
  } else {
    console.warn("[SLOP] rrweb record function is unavailable.");
  }

  return function collectSessionReplay() {
    return rrwebEvents.splice(0, rrwebEvents.length); // Drain buffered events
  };
}

/** 3. Device & Browser Fingerprinting Stream */
function createHandrolledStream() {
  return async function collectFingerprint() {
    const nav = window.navigator;
    const screenInfo = window.screen;


    const [battery, mediaDevices, audioHash] = await Promise.all([
      getBatteryTelemetry(),
      getMediaDevicesInfo(),
      getAudioFingerprint(),
    ]);

    return {
      identity: {
        userAgent: nav.userAgent || null,
        platform: nav.userAgentData?.platform || nav.platform || null,
        language: nav.language || null,
        languages: Array.from(nav.languages || []),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
        webdriver: nav.webdriver === true,
        cookieEnabled: nav.cookieEnabled,
        doNotTrack: nav.doNotTrack || null,
        audioHash,
        canvasDataUrl: getCanvas2DFingerprint(),
        installedFonts: getInstalledFontProfile(),
        speechVoices: getSpeechVoices(),
      },
      hardware: {
        screenResolution: `${screenInfo?.width || 0}x${screenInfo?.height || 0}`,
        colorDepth: screenInfo?.colorDepth || null,
        pixelRatio: window.devicePixelRatio || null,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        hardwareConcurrency: nav.hardwareConcurrency || null,
        deviceMemoryGB: nav.deviceMemory || null,
        maxTouchPoints: nav.maxTouchPoints || 0,
        gpu: getGPUInfo(),
        memory: getMemoryInfo(),
        battery,
        mediaDevices,
      },
      performance: {
        navigationTiming: getNavigationTiming(),
        network: nav.connection
          ? {
              effectiveType: nav.connection.effectiveType,
              downlink: nav.connection.downlink,
              rtt: nav.connection.rtt,
              saveData: nav.connection.saveData,
            }
          : null,
      },
    };
  };
}

function FingerprintJsStream() {
  return async function collectFingerprint() {
    const nav = window.navigator;
    const screenInfo = window.screen;

    let finger_print_JS = null;
    if (window.FingerprintJS) {
      try {
        const fp = await window.FingerprintJS.load();
        const result = await fp.get();
        finger_print_JS = {
          visitorId: result.visitorId,
          components: result.components,
        };
      } catch (err) {
        console.error("[SLOP] FingerprintJS error:", err);
      }
    }

    return { fingerprintJS: finger_print_JS, };
  };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Replace the (function () { ... })() IIFE with this:

let isInitialized = false;

  export const SESSION_UUID =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : 'uuid-' + Math.random().toString(36).substring(2, 15);

export function initTelemetry() {
  // Prevent duplicate listener attachments in React Strict Mode / HMR
  if (isInitialized || typeof window === "undefined") return;
  isInitialized = true;

  const HOSTNAME = window.location.hostname;
  const API_BASE = `http://${HOSTNAME}:5000`;


  const interactionTelemetry = createTelemetryDispatcher({
    endpoint: `${API_BASE}/api/telemetry`,
    session_UUID: SESSION_UUID,
    provider: createInteractionStream(),
    interval: false,
  });

  const rrwebTelemetry = createTelemetryDispatcher({
    endpoint: `${API_BASE}/api/telemetry/rrweb/stream`,
    session_UUID: SESSION_UUID,
    provider: createRRWebStream(),
    interval: true,
  });

  const handRolledTelemetry = createTelemetryDispatcher({
    endpoint: `${API_BASE}/api/telemetry`,
    session_UUID: SESSION_UUID,
    provider: createHandrolledStream(),
    interval: false,
  });

  const fingerprintTelemetry = createTelemetryDispatcher({
    endpoint: `${API_BASE}/api/telemetry`,
    session_UUID: SESSION_UUID,
    provider: FingerprintJsStream(), // Corrected from duplicate createHandrolledStream
    interval: false,
  });

  interactionTelemetry.attach();
  rrwebTelemetry.attach();
  handRolledTelemetry.attach();
  fingerprintTelemetry.attach();
}