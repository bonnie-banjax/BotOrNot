import RiskPanel from "./components/RiskPanel";
import Telemetry from "./components/Telemetry";
import BehaviorPanel from "./components/BehaviorPanel";
import useTelemetry from "./hooks/useTelemetry";
import useBehaviorTracking from "./hooks/useBehaviorTracking";
import MongoDumpViewer from "./components/MongoDumpViewer";
import LivePlayer from './components/PlayerRRWeb';


import TelemetryConsole from "./components/TelemetryConsole";
import MainPageContent from "./components/MainApp";

function App() {

  return (
    <div>
      {/* Existing application page content (scrolls normally) */}
      <main style={{ padding: "24px" }}>
        <MainPageContent />
      </main>

      {/* DevTools Drawer (fixed overlay) */}
      <TelemetryConsole />
    </div>
  );
}

export default App;