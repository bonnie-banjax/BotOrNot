// slop/tracker.js
(function () {
  const RECEIVER_URL = "http://localhost:5000/api/telemetry";

  // Interaction Counters
  let clicks = 0;
  let keyPresses = 0;
  let mouseMoves = 0;

  window.addEventListener("click", () => clicks++, { passive: true });
  window.addEventListener("keydown", () => keyPresses++, { passive: true });
  window.addEventListener("mousemove", () => mouseMoves++, { passive: true });

  // Array to collect rrweb DOM mutation/recording events
  const rrwebEvents = [];

  // Start rrweb recording if loaded
  if (window.rrweb) {
    window.rrweb.record({
      emit(event) {
        rrwebEvents.push(event);
      },
      maskAllInputs: false, // Set to true if you need to obscure text inputs
    });
  }

  // Extract GPU / Unmasked Renderer
  function getGPUInfo() {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return null;
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (!debugInfo) return null;
      return {
        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
      };
    } catch (e) {
      return null;
    }
  }

  // Extract Chromium Memory Heap
  function getMemoryInfo() {
    if (performance && performance.memory) {
      return {
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        usedJSHeapSize: performance.memory.usedJSHeapSize,
      };
    }
    return null;
  }

  async function captureAndDump() {
    const nav = window.navigator;
    const screenInfo = window.screen;

    // Get FingerprintJS attributes
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

    // Drain recorded rrweb events up to this moment
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
        fingerprint: fingerprintData,
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
      },
      network: nav.connection ? {
        effectiveType: nav.connection.effectiveType,
        downlink: nav.connection.downlink,
        rtt: nav.connection.rtt,
        saveData: nav.connection.saveData,
      } : null,
      liveSessionInteractions: {
        clicks,
        keyPresses,
        mouseMoves,
      },
      sessionReplay: sessionReplayEvents,
    };

    const blob = new Blob([JSON.stringify(dump)], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(RECEIVER_URL, blob);
    } else {
      fetch(RECEIVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dump),
        keepalive: true,
      });
    }
  }

  // Initial load dump
  window.addEventListener("load", captureAndDump);

  // Dump on visibility change or tab exit
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") captureAndDump();
  });
})();