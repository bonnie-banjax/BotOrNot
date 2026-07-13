export function collectBrowserTelemetry() {
  const nav = window.navigator;
  const screenInfo = window.screen;

  return {
    userAgent: nav.userAgent || null,
    platform: nav.userAgentData?.platform || nav.platform || null,
    language: nav.language || null,
    languages: Array.from(nav.languages || []),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    screen: {
      width: screenInfo?.width ?? null,
      height: screenInfo?.height ?? null,
      colorDepth: screenInfo?.colorDepth ?? null,
      pixelRatio: window.devicePixelRatio ?? null
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    hardwareConcurrency: nav.hardwareConcurrency ?? null,
    deviceMemory: nav.deviceMemory ?? null,
    cookieEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack ?? null,
    touchPoints: nav.maxTouchPoints ?? 0,
    webdriver: nav.webdriver === true,
    online: nav.onLine,
    collectedAt: new Date().toISOString()
  };
}
