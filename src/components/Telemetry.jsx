// import react hooks such as useState that remembers data and useEffect which runs our code at specific times
import useTelemetry from "../hooks/useTelemetry";

function Telemetry() {
  const telemetry = useTelemetry();

  if (!telemetry) {
    return <p>Collecting browser telemetry...</p>;
  }

  return (
    <section>
      <h2>Browser Telemetry</h2>

      <p>
        <strong>Language:</strong> {telemetry.language}
      </p>

      <p>
        <strong>Platform:</strong> {telemetry.platform}
      </p>

      <p>
        <strong>Timezone:</strong> {telemetry.timezone}
      </p>

      <p>
        <strong>Screen resolution:</strong> {telemetry.screenWidth} ×{" "}
        {telemetry.screenHeight}
      </p>

      <p>
        <strong>Cookies enabled:</strong>{" "}
        {telemetry.cookiesEnabled ? "Yes" : "No"}
      </p>

      <p>
        <strong>Online:</strong> {telemetry.online ? "Yes" : "No"}
      </p>


      <p>
        <strong>Touch points:</strong> {telemetry.touchPoints}
      </p>

      <p>
        <strong>WebDriver detected:</strong>{" "}
        {telemetry.webdriver ? "Yes" : "No"}
      </p>

      <p>
        <strong>User agent:</strong> {telemetry.userAgent}
      </p>
    </section>
  );
}

export default Telemetry;