import React from "react";
import "./TelemetryPanel.css";

export default function TelemetryPanel({ isOpen, onClose, telemetry, behavior }) {
  return (
    <>
      {/* backdrop overlay, click to close */}
      <div
        className={`telemetry-backdrop ${isOpen ? "visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`telemetry-panel ${isOpen ? "open" : ""}`}>
        <div className="telemetry-panel-header">
          <div>
            <h2>Invasive Telemetry Collection Dashboard</h2>
            <p className="telemetry-panel-subtitle">
              this is completely normal for websites to collect
            </p>
          </div>
          <button
            className="telemetry-close-btn"
            onClick={onClose}
            aria-label="Close telemetry panel"
          >
            ×
          </button>
        </div>

        <div className="telemetry-panel-body">
          <section className="telemetry-group">
            <h3>Device Data</h3>
            <ul>
              <li>
                <span>User Agent</span>
                <span className="telemetry-value">
                  {telemetry?.userAgent ?? "Loading…"}
                </span>
              </li>
              <li>
                <span>Platform</span>
                <span className="telemetry-value">
                  {telemetry?.platform ?? "Loading…"}
                </span>
              </li>
              <li>
                <span>Screen Resolution</span>
                <span className="telemetry-value">
                  {telemetry?.screen
                    ? `${telemetry.screen.width} × ${telemetry.screen.height}`
                    : "Loading…"}
                </span>
              </li>
              <li>
                <span>WebDriver Detected</span>
                <span className="telemetry-value">
                  {telemetry?.webdriver ? "Yes" : "No"}
                </span>
              </li>
            </ul>
          </section>

          <section className="telemetry-group">
            <h3>Live Interaction Counters</h3>
            <ul>
              <li>
                <span>Clicks</span>
                <span className="telemetry-value">{behavior?.clickCount ?? 0}</span>
              </li>
              <li>
                <span>Keypresses</span>
                <span className="telemetry-value">{behavior?.keyPressCount ?? 0}</span>
              </li>
              <li>
                <span>Mouse Movements</span>
                <span className="telemetry-value">{behavior?.mouseMoveCount ?? 0}</span>
              </li>
            </ul>
          </section>
        </div>
      </aside>
    </>
  );
}