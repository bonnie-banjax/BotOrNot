export function RiskPanel({ risk }) {
  return (
    <section className="panel risk-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Explainable decision engine</p>
          <h2>Bot risk assessment</h2>
        </div>
        <span className={`risk-pill risk-${risk.level.toLowerCase()}`}>{risk.level} risk</span>
      </div>

      <div className="score-row">
        <div className="score-ring" style={{ '--score': `${risk.score * 3.6}deg` }}>
          <span>{risk.score}</span>
          <small>/ 100</small>
        </div>
        <div>
          <h3>Why this score?</h3>
          <p>The score updates live as browser and behavior signals change.</p>
        </div>
      </div>

      <div className="reason-list">
        {risk.reasons.map((reason) => (
          <div className="reason" key={reason.code}>
            <span className="reason-points">+{reason.points}</span>
            <div>
              <strong>{reason.code.replaceAll('_', ' ')}</strong>
              <p>{reason.explanation}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
