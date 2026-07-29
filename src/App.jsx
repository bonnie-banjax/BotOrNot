import RiskPanel from "./components/RiskPanel";
import Telemetry from "./components/Telemetry";
import BehaviorPanel from "./components/BehaviorPanel";
import TelemetryPanel from "./components/TelemetryPanel";
import useTelemetry from "./hooks/useTelemetry";
import useBehaviorTracking from "./hooks/useBehaviorTracking";
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Overview from "./components/Overview.jsx";
import React, { useState } from 'react';
import Playground from "./components/Playground.jsx";
import Footer from "./components/Footer.jsx";
import './App.css';

function App() {
  const telemetry = useTelemetry();
  const behavior = useBehaviorTracking();
  const [activeTab, setActiveTab] = useState('overview');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleNavigation = (section) => {
    setActiveTab(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openTelemetryPanel = () => setIsPanelOpen(true);
  const closeTelemetryPanel = () => setIsPanelOpen(false);

  return (
    <div className="app-container">
      <Navbar onNavigate={handleNavigation} onOpenTelemetry={openTelemetryPanel} />

      <div id="overview">
        <Hero onNavigate={handleNavigation} onOpenTelemetry={openTelemetryPanel} />
      </div>

      <div id="about">
        <Overview />
      </div>
      <div id="playground">
        <Playground telemetry={telemetry} behavior={behavior} onNavigate={handleNavigation} />
      </div>

      <Footer onNavigate={handleNavigation} onOpenTelemetry={openTelemetryPanel}/>

      <TelemetryPanel
        isOpen={isPanelOpen}
        onClose={closeTelemetryPanel}
        telemetry={telemetry}
        behavior={behavior}
      />
    </div>
  );
}

export default App;