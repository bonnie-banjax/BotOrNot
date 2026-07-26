const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function scoreSession({ telemetry, behavior }) {
  let score = 0;
  const reasons = [];
  const add = (points, code, explanation) => {
    score += points;
    reasons.push({ points, code, explanation });
  };

  if (telemetry.webdriver) {
    add(45, 'WEBDRIVER_PRESENT', 'Browser reports automation through navigator.webdriver.');
  }

  if (!telemetry.userAgent || !telemetry.language || !telemetry.timezone) {
    add(18, 'MISSING_BROWSER_DATA', 'One or more common browser identity fields are missing.');
  }

  if ((telemetry.screen.width || 0) === 0 || (telemetry.screen.height || 0) === 0) {
    add(20, 'INVALID_SCREEN', 'Screen dimensions are unavailable or invalid.');
  }

  if (behavior.clickCount >= 4 && behavior.averageClickIntervalMs < 120) {
    add(28, 'RAPID_CLICKS', 'Average click timing is faster than typical deliberate human clicking.');
  }

  if (behavior.keyCount >= 10 && behavior.averageKeyIntervalMs < 35) {
    add(24, 'RAPID_TYPING', 'Keystrokes arrived at a highly uniform or unusually fast rate.');
  }

  if (behavior.pointerMoveCount === 0 && behavior.clickCount >= 3) {
    add(18, 'CLICKS_WITHOUT_POINTER_PATH', 'Multiple clicks occurred without recorded pointer movement.');
  }

  if (behavior.pointerMoveCount >= 12 && behavior.pointerPathDistance < 45) {
    add(12, 'LOW_POINTER_VARIATION', 'Pointer movement was repeated but covered very little distance.');
  }

  if (behavior.sessionDurationMs < 2500 && behavior.clickCount >= 3) {
    add(12, 'SHORT_ACTION_BURST', 'Several actions happened almost immediately after the session began.');
  }

  const normalizedScore = clamp(score, 0, 100);
  const level = normalizedScore >= 65 ? 'High' : normalizedScore >= 30 ? 'Medium' : 'Low';

  if (reasons.length === 0) {
    reasons.push({
      points: 0,
      code: 'NO_MAJOR_FLAGS',
      explanation: 'No high-confidence suspicious patterns have been observed yet.'
    });
  }

  return { score: normalizedScore, level, reasons };
}
