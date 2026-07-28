import RiskPanel from "./components/RiskPanel";
import Telemetry from "./components/Telemetry";
import BehaviorPanel from "./components/BehaviorPanel";
import useTelemetry from "./hooks/useTelemetry";
import useBehaviorTracking from "./hooks/useBehaviorTracking";
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Overview from "./components/Overview.jsx";
import React, { useState } from 'react';
import Playground from "./components/Playground.jsx";
import Footer from "./components/Footer.jsx";

function App() {
  const telemetry = useTelemetry();
  const behavior = useBehaviorTracking();
  const [activeTab, setActiveTab] = useState('overview');

//For navigating to different areas of website
  const handleNavigation = (section) => {
    setActiveTab(section);

  const element = document.getElementById(section);
  if(element){
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

  return (
    <div className= "app-container">
    <Navbar onNavigate={handleNavigation}/>

    <div id="overview">
    <Hero onNavigate={handleNavigation} />
    </div>

    <div id="about">
    <Overview />
    </div>
    
    <div id="playground">
      <Playground onNavigate={handleNavigation}/>
    </div>

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
    <Footer onNavigate={handleNavigation}/>
    </div>
  );
}

export default App;