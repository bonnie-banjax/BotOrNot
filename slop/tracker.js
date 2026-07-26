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

  function captureAndDump() {
    const nav = window.navigator;
    const screenInfo = window.screen;

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
      },
      hardware: {
        screenResolution: `${screenInfo?.width || 0}x${screenInfo?.height || 0}`,
        colorDepth: screenInfo?.colorDepth || null,
        pixelRatio: window.devicePixelRatio || null,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        hardwareConcurrency: nav.hardwareConcurrency || null,
        deviceMemoryGB: nav.deviceMemory || null,
        maxTouchPoints: nav.maxTouchPoints || 0,
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
      }
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

  // Dump on initial load
  window.addEventListener("load", captureAndDump);

  // Dump again when the user leaves or switches tabs
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") captureAndDump();
  });
})();