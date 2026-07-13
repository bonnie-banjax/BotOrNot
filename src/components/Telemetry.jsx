import { useEffect, useState } from "react";

function TelemetryPanel() {
  const [telemetry, setTelemetry] = useState({});

  useEffect(() => {
    setTelemetry({
      language: navigator.language,
      platform: navigator.platform,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      cookiesEnabled: navigator.cookieEnabled,
    });
  }, []);

  return (
    <div>
      <h2>Browser Telemetry</h2>

      <p>Language: {telemetry.language}</p>
      <p>Platform: {telemetry.platform}</p>
      <p>Timezone: {telemetry.timezone}</p>
      <p>
        Resolution: {telemetry.screenWidth} × {telemetry.screenHeight}
      </p>
      <p>Cookies Enabled: {String(telemetry.cookiesEnabled)}</p>
    </div>
  );
}

export default TelemetryPanel;