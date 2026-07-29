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
        <span style={badgeStyle}> {SESSION_UUID} </span>
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

// Neutralizes outer parent CSS pollution by explicitly overriding typography/layout resets
const rootOverlayStyle = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "monospace",
  fontSize: "14px",
  lineHeight: "1.4",
  textTransform: "none",
  margin: "16px 0"
};

const toggleBtnStyle = {
  position: "relative",
  width: "100%",
  backgroundColor: "#08103A", // Darker blue tint matching #0D1B5E panel theme
  color: "#61afef",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "8px",
  padding: "12px 16px",
  fontFamily: "monospace",
  fontSize: "0.85rem",
  fontWeight: "bold",
  textTransform: "none",
  letterSpacing: "normal",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxSizing: "border-box"
};

const greenDotStyle = {
  color: "#98c379",
  fontSize: "0.85rem",
  lineHeight: "1"
};

const getDrawerStyle = (isOpen) => ({
  width: "100%",
  maxHeight: isOpen ? "2000px" : "0px",
  opacity: isOpen ? 1 : 0,
  overflow: "hidden",
  backgroundColor: "#08103A",
  color: "#abb2bf",
  border: isOpen ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
  borderRadius: "8px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box"
});

const drawerHeaderStyle = {
  padding: "12px 16px",
  backgroundColor: "#050B28",
  borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexShrink: 0,
  boxSizing: "border-box"
};

const headerLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const badgeStyle = {
  fontSize: "0.75rem",
  lineHeight: "1.2",
  padding: "2px 6px",
  borderRadius: "4px",
  background: "#122373",
  color: "#e06c75",
  fontFamily: "monospace",
  textTransform: "none",
  letterSpacing: "normal"
};

const headerTitleStyle = {
  fontFamily: "monospace",
  fontSize: "0.85rem",
  lineHeight: "1.2",
  fontWeight: "bold",
  color: "#ffffff",
  textTransform: "none",
  letterSpacing: "normal"
};

const closeBtnStyle = {
  background: "none",
  border: "none",
  color: "rgba(255, 255, 255, 0.6)",
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
  gap: "16px",
  boxSizing: "border-box"
};

const cardSectionStyle = {
  background: "#0D1B5E",
  borderRadius: "8px",
  padding: "12px",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  boxSizing: "border-box"
};