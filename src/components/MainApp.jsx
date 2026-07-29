import RiskPanel from "./RiskPanel";
import Telemetry from "./Telemetry";
import BehaviorPanel from "./BehaviorPanel";
import useTelemetry from "../hooks/useTelemetry";
import useBehaviorTracking from "../hooks/useBehaviorTracking";

function MainApp() {
  const telemetry = useTelemetry();
  const behavior = useBehaviorTracking();

  return (
<div>
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
</div>
  );
}

export default MainApp;