import { useEffect, useState } from "react";

export default function MongoDumpViewer() {
  const [dumps, setDumps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDumps = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/telemetry/latest");
      if (!response.ok) throw new Error("Failed to fetch database dumps");
      const data = await response.json();
      setDumps(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDumps();
    // Poll every 5 seconds for live updates
    const interval = setInterval(fetchDumps, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="detail-panel" style={{ gridColumn: "1 / -1", marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span className="panel-number">03</span>
          <h3>MongoDB Telemetry Dumps</h3>
        </div>
        <button className="demo-button" onClick={fetchDumps}>
          Refresh Feeds
        </button>
      </div>

      {loading && <p>Querying mongodb://127.0.0.1:27017...</p>}
      {error && <p className="warning">Error: {error}</p>}

      {!loading && dumps.length === 0 && (
        <p>No telemetry payloads recorded in `slop_db.ingested_telemetry` yet.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
        {dumps.map((dump) => (
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
              [{dump.serverMetadata?.receivedAt || dump.timestamp}] IP: {dump.serverMetadata?.clientIp} | Agent: {dump.identity?.userAgent?.slice(0, 40)}...
            </summary>
            <pre style={{ marginTop: "10px", overflowX: "auto", whiteSpace: "pre-wrap" }}>
              {JSON.stringify(dump, null, 2)}
            </pre>
          </details>
        ))}
      </div>
    </section>
  );
}