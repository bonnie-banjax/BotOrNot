// import react hooks such as useState that remembers data and useEffect which runs our code at specific times
function Telemetry({ telemetry }) {
  if (!telemetry) {
    return (
      <section className="detail-panel">
        <p>Checking browser automation...</p>
      </section>
    );
  }

  return (
    <section className="detail-panel">
      <span className="panel-number">01</span>
      <h3>Browser check</h3>

      <p>
        The browser reports whether it is being controlled by common automation
        software.
      </p>

      <div className="signal-result">
        <span>WebDriver</span>

        <strong className={telemetry.webdriver ? "warning" : "success"}>
          {telemetry.webdriver ? "Detected" : "Not detected"}
        </strong>
      </div>
    </section>
  );
}

export default Telemetry;