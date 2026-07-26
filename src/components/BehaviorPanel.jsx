function BehaviorPanel({ behavior }) {
  return (
    <section className="detail-panel">
      <span className="panel-number">02</span>
      <h3>Live behavior</h3>

      <p>
        These values update as you move, click, and type during the session.
      </p>

      <div className="behavior-results">
        <div>
          <strong>{behavior.mouseMoveCount}</strong>
          <span>Movements</span>
        </div>

        <div>
          <strong>{behavior.clickCount}</strong>
          <span>Clicks</span>
        </div>

        <div>
          <strong>{behavior.keyPressCount}</strong>
          <span>Key presses</span>
        </div>
      </div>
    </section>
  );
}

export default BehaviorPanel;