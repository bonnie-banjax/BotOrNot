import RiskPanel from "./components/RiskPanel";
import Telemetry from "./components/Telemetry";
import BehaviorPanel from "./components/BehaviorPanel";
import useTelemetry from "./hooks/useTelemetry";
import useBehaviorTracking from "./hooks/useBehaviorTracking";

function App() {
  const telemetry = useTelemetry();
  const behavior = useBehaviorTracking();

  return (
    <main>
      <RiskPanel telemetry={telemetry} behavior={behavior} />

      <section className="details-section">
        <div className="section-heading">
          <span>Analysis</span>
          <h2>BotOrNot Signals</h2>
        </div>

        <div className="details-grid">
          <Telemetry telemetry={telemetry} />
          <BehaviorPanel behavior={behavior} />
        </div>
      </section>
    </main>
  );
}

export default App;