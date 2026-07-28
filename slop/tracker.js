
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


(function () {

  // Derives host dynamically from the browser's current location bar
  const HOSTNAME = window.location.hostname; // e.g., '192.168.4.187'
  const API_BASE = `http://${HOSTNAME}:5000`;
  const RECEIVER_URL = `${API_BASE}/api/telemetry`;


  // Interaction Counters
  let clicks = 0;
  let keyPresses = 0;
  let mouseMoves = 0;

  window.addEventListener("click", () => clicks++, { passive: true });
  window.addEventListener("keydown", () => keyPresses++, { passive: true });
  window.addEventListener("mousemove", () => mouseMoves++, { passive: true });

  // Array to collect rrweb DOM mutation/recording events
  const rrwebEvents = [];

  if (window.rrweb && typeof window.rrweb.record === "function") {
    window.rrweb.record({
      emit(event) {
        rrwebEvents.push(event);
      },
      maskAllInputs: false,
    });
  }

  // --- Aggregator & Dispatcher ---

  async function captureAndDump() {
    const nav = window.navigator;
    const screenInfo = window.screen;

    // FingerprintJS collection
    let fingerprintData = null;
    if (window.FingerprintJS) {
      try {
        const fp = await window.FingerprintJS.load();
        const result = await fp.get();
        fingerprintData = {
          visitorId: result.visitorId,
          components: result.components,
        };
      } catch (err) {
        console.error("[SLOP] Fingerprint error:", err);
      }
    }

    // Parallel async execution for high-entropy hardware metrics
    const [battery, mediaDevices, audioFingerprint] = await Promise.all([
      getBatteryTelemetry(),
      getMediaDevicesInfo(),
      getAudioFingerprint(),
    ]);

    // Drain session replay events gathered so far
    const sessionReplayEvents = rrwebEvents.splice(0, rrwebEvents.length);


    const dump = {
      timestamp: new Date().toISOString(),
      location: {
        href: window.location.href,
        referrer: document.referrer || null,
        origin: window.location.origin,
      },
      identity: {
        userAgent: nav.userAgent || null,
        platform: nav.userAgentData?.platform || nav.platform || null,
        language: nav.language || null,
        languages: Array.from(nav.languages || []),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
        webdriver: nav.webdriver === true,
        cookieEnabled: nav.cookieEnabled,
        doNotTrack: nav.doNotTrack || null,
        // fingerprintJS: fingerprintData,
        audioHash: audioFingerprint,
        canvasDataUrl: getCanvas2DFingerprint(),
        installedFonts: getInstalledFontProfile(),
        speechVoices: getSpeechVoices(),
      },
      hardware: {
        screenResolution: `${screenInfo?.width||0}x${screenInfo?.height||0}`,
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
        network: nav.connection ? {
          effectiveType: nav.connection.effectiveType,
          downlink: nav.connection.downlink,
          rtt: nav.connection.rtt,
          saveData: nav.connection.saveData,
        } : null,
      },
      liveSessionInteractions: {
        clicks,
        keyPresses,
        mouseMoves,
      },
      sessionReplay: sessionReplayEvents,
    };

    const payload = JSON.stringify(dump);


    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "text/plain" });                 // "application/json"
      navigator.sendBeacon(RECEIVER_URL, blob);
    } else {
      fetch(RECEIVER_URL, {                                                     // this branch was never triggered before
        method: "POST",                                                         // unclear what started causing that
        headers: { "Content-Type": "text/plain" },                              // "application/json"
        body: payload,
        keepalive: true,
      }).catch((err) => console.error("[SLOP] Transmission failed:", err));
    }
  }



  // Load event trigger
  window.addEventListener("load", captureAndDump);

  // Tab unload / visibility state change trigger
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      captureAndDump();
    }
  });
})();