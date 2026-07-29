import './RiskBar.css';

export default function RiskBar({ score = 0 , classification = "Loading.."}) {
  const progress = score * 3.6; // turning into circle degrees
  const level = score >= 60 ? 'bot' : score >= 30 ? 'warn' : 'human';

  return (
    <div
      className={`risk-bar risk-bar--${level}`}
      style={{ '--progress': `${progress}deg` }}
      role="img"
    >
      <div className="risk-bar__ring">
        <div className="risk-bar__inner">
          <span className="risk-bar__number">{score}</span>
          <span className="risk-bar__unit">/ 100</span>
        </div>
      </div>
      <span className="risk-bar__caption">Risk Score</span>
    <div className="verdict">
      <span className="verdict__dot" />
      <span className="verdict__label">{classification}</span>
    </div>
    </div>
  );
}
