import { useState } from "react";
function RiskPanel({ telemetry, behavior }) {
  if (!telemetry || !behavior) {
    return (
      <section className="risk-hero">
        <p className="loading-message">Analyzing your session...</p>
      </section>
    );
  }

  const totalInteractions =
    behavior.clickCount +
    behavior.keyPressCount +
    behavior.mouseMoveCount;

  let riskScore = 5;
  const reasons = [];

  if (telemetry.webdriver) {
    riskScore += 75;
    reasons.push("Browser automation was detected");
  } else {
    reasons.push("Browser automation was not detected");
  }

  if (totalInteractions === 0) {
    riskScore += 15;
    reasons.push("Waiting for human interaction");
  } else {
    reasons.push("Human interaction was detected");
  }

  riskScore = Math.min(riskScore, 100);

  const isBot = riskScore >= 60;
  const result = isBot ? "A Bot" : "A Human";
  const circleProgress = riskScore * 3.6;

  return (
    <section className={`risk-hero ${isBot ? "bot-result" : ""}`}>
      <nav className="hero-nav">
        <a className="brand" href="/">
          BotOrNot
        </a>

        <span className="live-badge">
          <span className="live-dot"></span>
          Live analysis
        </span>
      </nav>

      <div className="hero-content">
        <div className="hero-copy">
          <span className="eyebrow">Bot detection test</span>

          <h1>
            You are
            <span>{result}.</span>
          </h1>

          <p className="hero-description">
            BotOrNot evaluates browser automation and live behavior to estimate
            whether this session appears human or bot-automated.
          </p>

          <div className="result-message">
            <span className="result-icon">{isBot ? "!" : "✓"}</span>

            <div>
              <small>Current result</small>
              <strong>{result}</strong>
            </div>
          </div>
        </div>

        <div className="score-area">
          <div
            className="score-circle"
            style={{ "--progress": `${circleProgress}deg` }}
          >
            <div className="score-inner">
              <span className="score-number">{riskScore}</span>
              <span className="score-label">risk score</span>
            </div>
          </div>

          <p>
            A lower score means the session indicates human behavior.
          </p>
        </div>
      </div>

      <div className="reason-row">
        {reasons.map((reason) => (
          <div className="reason" key={reason}>
            <span>{isBot ? "•" : "✓"}</span>
            {reason}
          </div>
        ))}
      </div>
    </section>
  );
}

export default RiskPanel;