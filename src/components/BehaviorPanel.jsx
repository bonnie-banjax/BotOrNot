function BehaviorPanel({ behavior }) {
  return (
    <section className="detail-panel">

        <div>
          <strong>{behavior.mouseMoveCount}</strong>
        </div>

        <div>
          <strong>{behavior.clickCount}</strong>
        </div>

        <div>
          <strong>{behavior.keyPressCount}</strong>
        </div>
    </section>
  );
}

export default BehaviorPanel;