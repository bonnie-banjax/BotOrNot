// I separated the data collection from the presentation layer. Made a useTelemetry custom hook grabs API access, while Telemetry component is responsible only for rendering the data.
//made a custom hook for collecting and managing data
import { useEffect, useState } from "react";

function useTelemetry() {
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    setTelemetry({
      language: navigator.language,
      platform: navigator.platform,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      cookiesEnabled: navigator.cookieEnabled,
      online: navigator.onLine,
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency,
      touchPoints: navigator.maxTouchPoints,
      webdriver: navigator.webdriver,
    });
  }, []);

  return telemetry;
}

export default useTelemetry;