function RiskPanel({ telemetry, behavior }) {
  if (!telemetry || !behavior) {
    return (
      <section className="risk-hero">
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
      <div className="hero-content">
        <div className="score-area">
          <div
            className="score-circle"
            style={{ "--progress": `${circleProgress}deg` }}
          >

          </div>
        </div>
      </div>

      <div className="reason-row">
        {reasons.map((reason) => (
          <div className="reason" key={reason}>
            {reason}
          </div>
        ))}
      </div>
    </section>
  );
}

export default RiskPanel;