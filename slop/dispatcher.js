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

/**
 * Higher-Order Telemetry Pipeline Factory
 * Standardizes lifecycle listeners, payload formatting, serialization, and
 *  dispatch across decoupled telemetry stream providers.
 */

function createTelemetryDispatcher({ endpoint, session_UUID, provider }) {
  function send(data) {
    const dump = {
      session_UUID, // Included across all payload streams
      timestamp: new Date().toISOString(),
      location: {
        href: window.location.href,
        referrer: document.referrer || null,
        origin: window.location.origin,
      },
      payload: data,
    };

    const payload = JSON.stringify(dump);

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "text/plain" });
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: payload,
        keepalive: true,
      }).catch((err) => console.error("[SLOP] Transmission failed:", err));
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

  function attach() {
    window.addEventListener("load", flush);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        flush();
      }
    });
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

  if (window.rrweb && typeof window.rrweb.record === "function") {
    window.rrweb.record({
      emit(event) {
        rrwebEvents.push(event);
      },
      maskAllInputs: false,
    });
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

    let fingerprintJS = null;
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

(function () {
  const HOSTNAME = window.location.hostname;
  const API_BASE = `http://${HOSTNAME}:5000`;

  // Single Session UUID generated once per page context
  const SESSION_UUID = crypto.randomUUID();

  // Stream 1: Interactions
  const interactionTelemetry = createTelemetryDispatcher({
    endpoint: `${API_BASE}/api/telemetry/`,
    session_UUID: SESSION_UUID,
    provider: createInteractionStream(),
  });

  // Stream 2: Session Replay (rrweb)
  const rrwebTelemetry = createTelemetryDispatcher({
    endpoint: `${API_BASE}/api/telemetry/`,
    session_UUID: SESSION_UUID,
    provider: createRRWebStream(),
  });

  // Stream 3: Device / Browser Fingerprint
  const fingerprintTelemetry = createTelemetryDispatcher({
    endpoint: `${API_BASE}/api/telemetry/`,
    session_UUID: SESSION_UUID,
    provider: createHandrolledStream(),
  });

  // Attach lifecycle listeners for all individual streams
  // interactionTelemetry.attach();
  // rrwebTelemetry.attach();
  fingerprintTelemetry.attach();
})();
