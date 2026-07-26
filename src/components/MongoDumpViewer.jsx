import { useEffect, useState, useRef } from "react";

export default function MongoDumpViewer() {
  const [dumps, setDumps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);

  // Silently fetches telemetry data without toggling the primary loader UI
  const fetchDumps = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setRefreshing(true);

      const response = await fetch("http://localhost:5000/api/telemetry/latest");
      if (!response.ok) throw new Error("Failed to fetch database dumps");
      const data = await response.json();
      setDumps(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDumps(true);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDumps(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <section className="detail-panel" style={{ gridColumn: "1 / -1", marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span className="panel-number">03</span>
          <h3>MongoDB Telemetry Dumps</h3>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (5s)
          </label>

          <button className="demo-button" onClick={() => fetchDumps(false)} disabled={refreshing || loading}>
            {refreshing ? "Polling..." : "Refresh Feeds"}
          </button>
        </div>
      </div>

      {loading && <p style={{ marginTop: "12px" }}>Querying mongodb://127.0.0.1:27017...</p>}
      {error && <p className="warning" style={{ marginTop: "12px" }}>Error: {error}</p>}

      {!loading && dumps.length === 0 && (
        <p style={{ marginTop: "12px" }}>No telemetry payloads recorded in `slop_db.ingested_telemetry` yet.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
        {dumps.map((dump) => {
          const visitorId = dump.identity?.fingerprintJS?.visitorId || "N/A";
          const gpuRenderer = dump.hardware?.gpu?.renderer || "Unknown GPU";
          const batteryLevel = dump.hardware?.battery ? `${Math.round(dump.hardware.battery.level * 100)}%` : "N/A";
          const fontsCount = dump.identity?.installedFonts?.length || 0;
          const mediaAudio = dump.hardware?.mediaDevices?.audioInputCount || 0;
          const mediaVideo = dump.hardware?.mediaDevices?.videoInputCount || 0;

          return (
            <details
              key={dump._id}
              style={{
                background: "#edf1e8",
                padding: "12px",
                borderRadius: "12px",
                fontFamily: "monospace",
                fontSize: "0.85rem",
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                <span>
                  [{dump.serverMetadata?.receivedAt || dump.timestamp}] IP: {dump.serverMetadata?.clientIp || "Unknown"}
                </span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px", fontWeight: "normal" }}>
                  <span style={pillStyle}>Visitor ID: {visitorId.slice(0, 8)}...</span>
                  <span style={pillStyle}>GPU: {gpuRenderer.slice(0, 25)}...</span>
                  <span style={pillStyle}>Battery: {batteryLevel}</span>
                  <span style={pillStyle}>Fonts: {fontsCount}</span>
                  <span style={pillStyle}>Media: {mediaAudio}a / {mediaVideo}v</span>
                </div>
              </summary>
              <pre
                style={{
                  marginTop: "10px",
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  background: "#1e1e1e",
                  color: "#d4d4d4",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                {JSON.stringify(dump, null, 2)}
              </pre>
            </details>
          );
        })}
      </div>
    </section>
  );
}

const pillStyle = {
  background: "#d3ded0",
  padding: "2px 8px",
  borderRadius: "6px",
  fontSize: "0.75rem",
};