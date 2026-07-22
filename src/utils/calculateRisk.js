function calculateRisk(telemetry, behavior) {
  if (!telemetry || !behavior) {
    return {
      score: 0,
      classification: "Analyzing...",
      reasons: [],
    };
  }

  let score = 0;
  const reasons = [];

  if (telemetry.webdriver) {
    score += 70;
    reasons.push("Browser automation was detected");
  }

  const totalInteractions =
    behavior.clickCount +
    behavior.keyPressCount +
    behavior.mouseMoveCount;

  if (totalInteractions === 0) {
    score += 20;
    reasons.push("No human interaction detected");
  }

  if (
    behavior.mouseMoveCount > 500 &&
    behavior.clickCount === 0 &&
    behavior.keyPressCount === 0
  ) {
    score += 15;
    reasons.push("Unusual movement pattern detected");
  }

  score = Math.min(score, 100);

  let classification = "Human";

  if (score >= 60) {
    classification = "A Bot";
  } else if (score >= 30) {
    classification = "More info needed";
  }

  return {
    score,
    classification,
    reasons,
  };
}

export default calculateRisk;