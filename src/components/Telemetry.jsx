// import react hooks such as useState that remembers data and useEffect which runs our code at specific times
function Telemetry({ telemetry }) {
  if (!telemetry) {
    return (
      <section className="detail-panel">
      </section>
    );    
  }

  return (
    <section className="detail-panel">

      <div className="signal-result">

        <strong className={telemetry.webdriver ? "warning" : "success"}>
          {telemetry.webdriver ? "Detected" : "Not detected"}
        </strong>
      </div>
    </section>
  );
}

export default Telemetry;