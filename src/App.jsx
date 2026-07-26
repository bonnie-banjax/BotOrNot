import RiskPanel from "./components/RiskPanel";
import Telemetry from "./components/Telemetry";
import BehaviorPanel from "./components/BehaviorPanel";
import useTelemetry from "./hooks/useTelemetry";
import useBehaviorTracking from "./hooks/useBehaviorTracking";
import MongoDumpViewer from "./components/MongoDumpViewer";

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
          {/* mongo dump go here */}
          <MongoDumpViewer />
        </div>
      </section>
    </main>
  );
}

export default App;