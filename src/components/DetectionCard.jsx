export function MetricCard({ label, value, helper }) {
  return (
    <article className="metric-card">
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      {helper && <small>{helper}</small>}
    </article>
  );
}
