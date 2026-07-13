import { useMemo, useState } from 'react';
import { MetricCard } from './components/MetricCard';
import { RiskPanel } from './components/RiskPanel';
import { useBehaviorSignals } from './hooks/useBehaviorSignals';
import { collectBrowserTelemetry } from './lib/telemetry';
import { scoreSession } from './lib/riskEngine';

export default function App() {
  const [telemetry] = useState(() => collectBrowserTelemetry());
  const behavior = useBehaviorSignals();
  const risk = useMemo(() => scoreSession({ telemetry, behavior }), [telemetry, behavior]);
  const [testText, setTestText] = useState('');
  const [status, setStatus] = useState('Not submitted');

  const payload = useMemo(() => ({
    sessionId: crypto.randomUUID?.() || `session-${Date.now()}`,
    telemetry,
    behavior,
    risk,
    capturedAt: new Date().toISOString()
  }), [telemetry, behavior, risk]);

  const submitSession = async () => {
    setStatus('Sending...');
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      setStatus('Saved to backend');
    } catch (error) {
      setStatus('Backend not connected yet - payload logged');
      console.table(payload);
      console.info(error.message);
    }
  };

  return (
    <main>
      <header className="hero">
        <div>
          <p className="brand">TRUST</p>
          <h1>Browser Signal Lab</h1>
          <p className="hero-copy">
            A live React dashboard that captures browser telemetry, measures behavior, and explains a rule-based bot risk score.
          </p>
        </div>
        <div className="live-badge"><span /> Live session</div>
      </header>

      <section className="metrics-grid" aria-label="Live behavior metrics">
        <MetricCard label="Clicks" value={behavior.clickCount} helper={`${behavior.averageClickIntervalMs || 0} ms average interval`} />
        <MetricCard label="Keystrokes" value={behavior.keyCount} helper={`${behavior.averageKeyIntervalMs || 0} ms average interval`} />
        <MetricCard label="Pointer events" value={behavior.pointerMoveCount} helper={`${behavior.pointerPathDistance}px path distance`} />
        <MetricCard label="Session time" value={`${(behavior.sessionDurationMs / 1000).toFixed(1)}s`} helper="Updates every 0.5 seconds" />
      </section>

      <div className="dashboard-grid">
        <RiskPanel risk={risk} />

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Browser exposure</p>
              <h2>Telemetry snapshot</h2>
            </div>
          </div>
          <dl className="telemetry-list">
            <div><dt>Platform</dt><dd>{telemetry.platform || 'Unavailable'}</dd></div>
            <div><dt>Timezone</dt><dd>{telemetry.timezone || 'Unavailable'}</dd></div>
            <div><dt>Language</dt><dd>{telemetry.language || 'Unavailable'}</dd></div>
            <div><dt>Screen</dt><dd>{telemetry.screen.width} × {telemetry.screen.height}</dd></div>
            <div><dt>Viewport</dt><dd>{telemetry.viewport.width} × {telemetry.viewport.height}</dd></div>
            <div><dt>CPU threads</dt><dd>{telemetry.hardwareConcurrency ?? 'Unavailable'}</dd></div>
            <div><dt>Touch points</dt><dd>{telemetry.touchPoints}</dd></div>
            <div><dt>WebDriver</dt><dd>{telemetry.webdriver ? 'Detected' : 'Not detected'}</dd></div>
          </dl>
        </section>
      </div>

      <section className="panel interaction-lab">
        <div>
          <p className="eyebrow">Behavior test area</p>
          <h2>Generate realistic session signals</h2>
          <p>Move the pointer, type naturally, and click the controls. The score reacts immediately.</p>
        </div>
        <textarea
          value={testText}
          onChange={(event) => setTestText(event.target.value)}
          placeholder="Type a short sentence here to generate keyboard timing data..."
          rows="4"
        />
        <div className="actions">
          <button onClick={() => setTestText('')}>Clear text</button>
          <button className="primary" onClick={submitSession}>Submit session snapshot</button>
          <span className="status">{status}</span>
        </div>
      </section>
    </main>
  );
}
