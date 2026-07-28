import { useEffect, useState, useRef } from "react";

export default function MongoDumpViewer() {
  const [dumps, setDumps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);


const HOSTNAME = window.location.hostname;
const API_BASE = `http://${HOSTNAME}:5000`;
const RECEIVER_URL = `${API_BASE}/api/telemetry/latest`;

  // Silently fetches telemetry data without toggling the primary loader UI
  const fetchDumps = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setRefreshing(true);

      const response = await fetch(RECEIVER_URL); // "http://localhost:5000/api/telemetry/latest"
      if (!response.ok) throw new Error(`Failed to fetch database dumps: ${RECEIVER_URL}`);
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
  <section style={inlineStyle_3}>
    <div style={inlineStyle_4}>
      <div>
        <span className="panel-number">03</span>
        <h3>MongoDB Telemetry Dumps</h3>
      </div>

      <div style={inlineStyle_5}>
        <label style={inlineStyle_6}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh (5s)
        </label>

        <button
          style={inlineStyle_7}
          className="demo-button"
          onClick={() => fetchDumps(false)}
          disabled={refreshing || loading}
        >
          {refreshing ? "Polling..." : "Refresh Feeds"}
        </button>
      </div>
    </div>

    {loading && <p style={inlineStyle_8}>Querying mongodb://127.0.0.1:27017...</p>}
    {error && <p className="warning" style={inlineStyle_8}>Error: {error}</p>}

    {!loading && dumps.length === 0 && (
      <p style={inlineStyle_8}>No telemetry payloads recorded in `slop_db.ingested_telemetry` yet.</p>
    )}

    <div style={inlineStyle_9}>
      {dumps.map((dump) => {
        const visitorId = dump.identity?.fingerprintJS?.visitorId || "N/A";
        const gpuRenderer = dump.hardware?.gpu?.renderer || "Unknown GPU";
        const batteryLevel = dump.hardware?.battery ? `${Math.round(dump.hardware.battery.level * 100)}%` : "N/A";
        const fontsCount = dump.identity?.installedFonts?.length || 0;
        const mediaAudio = dump.hardware?.mediaDevices?.audioInputCount || 0;
        const mediaVideo = dump.hardware?.mediaDevices?.videoInputCount || 0;

        return (
          <details key={dump._id} style={inlineStyle_2}>
            <summary style={inlineStyle_10}>
              <span>
                [{dump.serverMetadata?.receivedAt || dump.timestamp}] IP: {dump.serverMetadata?.clientIp || "Unknown"}
              </span>
              <div style={inlineStyle_11}>
                <span style={pillStyle}>Visitor ID: {visitorId.slice(0, 8)}...</span>
                <span style={pillStyle}>GPU: {gpuRenderer.slice(0, 25)}...</span>
                <span style={pillStyle}>Battery: {batteryLevel}</span>
                <span style={pillStyle}>Fonts: {fontsCount}</span>
                <span style={pillStyle}>Media: {mediaAudio}a / {mediaVideo}v</span>
              </div>
            </summary>
            <pre style={inlineStyle_1}>
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
  color: "#cfc0d0",
  background: "#0f0f0f",
  padding: "2px 8px",
  borderRadius: "6px",
  fontSize: "0.75rem",
};

const inlineStyle_1 = {
  marginTop: "10px",
  overflowX: "auto",
  whiteSpace: "pre-wrap",
  background: "#1e1e1e",
  color: "#d4d4d4",
  padding: "12px",
  borderRadius: "8px",
};

const inlineStyle_2 = {
  background: "#282c34", // Charcoal slate item background
  color: "#abb2bf",
  padding: "12px",
  borderRadius: "8px",
  fontFamily: "monospace",
  fontSize: "0.85rem",
  border: "1px solid #3e4451",
}

const inlineStyle_3 = {
  gridColumn: "1 / -1",
  marginTop: "24px"
};

const inlineStyle_4 = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const inlineStyle_5 = {
  display: "flex",
  gap: "12px",
  alignItems: "center"
};

const inlineStyle_6 = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "0.85rem",
  cursor: "pointer"
};

const inlineStyle_7 = {
  background: "#0f0f0f"
};

const inlineStyle_8 = {
  marginTop: "12px"
};

const inlineStyle_9 = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "16px"
};

const inlineStyle_10 = {
  cursor: "pointer",
  fontWeight: "bold"
};

const inlineStyle_11 = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "6px",
  fontWeight: "normal"
};