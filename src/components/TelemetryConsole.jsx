import { useState } from "react";
import LivePlayer from "./PlayerRRWeb"; // Adjust import path
import MongoDumpViewer from "./MongoDumpViewer"; // Adjust import path
import { initTelemetry, SESSION_UUID } from '../slop/dispatcher';

initTelemetry();

export default function PseudoDevToolsPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
<div className="rr-block" style={rootOverlayStyle}>
  {/* Toggle Button (visible when panel is closed) */}
  {!isOpen && (
    <button
      onClick={() => setIsOpen(true)}
      style={toggleBtnStyle}
    >
      <span style={greenDotStyle}>●</span> Telemetry Feed
    </button>
  )}

  {/* Floating Slate Drawer */}
  <aside style={getDrawerStyle(isOpen)}>
    {/* Header Bar */}
    <div style={drawerHeaderStyle}>
      <div style={headerLeftStyle}>
        <span style={badgeStyle}>
          PSEUDO-DEVTOOLS
        </span>
        <span style={headerTitleStyle}>
          Live Telemetry & Recording
        </span>
        <span> {SESSION_UUID} </span>
      </div>

      <button
        onClick={() => setIsOpen(false)}
        style={closeBtnStyle}
        title="Close DevTools"
      >
        ✕
      </button>
    </div>

    {/* Scrollable Content Container */}
    <div style={drawerContentStyle}>
      {/* Top Section: Live Replayer */}
      <section style={cardSectionStyle}>
        <LivePlayer />
      </section>

      {/* Bottom Section: Mongo Telemetry Feed */}
      <section style={cardSectionStyle}>
        <MongoDumpViewer />
      </section>
    </div>
  </aside>
</div>
  );
}


// fff f

// Add this style for the wrapper:
const rootOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  zIndex: 99999,
  pointerEvents: "none" // Let page clicks pass through the zero-size overlay container
};


// fff f

const toggleBtnStyle = {

  pointerEvents: "auto", // Re-enable clicks

  position: "fixed",
  top: "16px",
  right: "16px",
  zIndex: 9998,
  backgroundColor: "#1e2227",
  color: "#61afef",
  border: "1px solid #3e4451",
  borderRadius: "8px",
  padding: "8px 16px",
  fontFamily: "monospace",
  fontSize: "0.85rem",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const greenDotStyle = {
  color: "#98c379"
};

// Helper function to handle the dynamic state-dependent transform
const getDrawerStyle = (isOpen) => ({

  pointerEvents: "auto", // Re-enable clicks

  position: "fixed",
  top: 0,
  right: 0,
  width: "820px",
  maxWidth: "100vw",
  height: "100vh",
  backgroundColor: "#181a1f",
  color: "#abb2bf",
  borderLeft: "1px solid #282c34",
  boxShadow: "-8px 0 24px rgba(0, 0, 0, 0.5)",
  zIndex: 9999,
  transform: isOpen ? "translateX(0)" : "translateX(100%)",
  transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box"
});

const drawerHeaderStyle = {
  padding: "12px 16px",
  backgroundColor: "#21252b",
  borderBottom: "1px solid #282c34",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexShrink: 0
};

const headerLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const badgeStyle = {
  fontSize: "0.75rem",
  padding: "2px 6px",
  borderRadius: "4px",
  background: "#2c313a",
  color: "#e06c75",
  fontFamily: "monospace"
};

const headerTitleStyle = {
  fontFamily: "monospace",
  fontSize: "0.85rem",
  fontWeight: "bold"
};

const closeBtnStyle = {
  background: "none",
  border: "none",
  color: "#5c6370",
  fontSize: "1.2rem",
  cursor: "pointer",
  padding: "0 4px",
  lineHeight: 1
};

const drawerContentStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const cardSectionStyle = {
  background: "#21252b",
  borderRadius: "8px",
  padding: "12px",
  border: "1px solid #282c34"
};