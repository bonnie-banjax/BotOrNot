// I separated the data collection from the presentation layer. Made a useTelemetry custom hook grabs API access, while Telemetry component is responsible only for rendering the data.
//made a custom hook for collecting and managing data
import { useEffect, useState } from "react";

function useTelemetry() {
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    setTelemetry({
      webdriver: navigator.webdriver,
      touchPoints: navigator.maxTouchPoints,
    });
  }, []);

  return telemetry;
}

export default useTelemetry;