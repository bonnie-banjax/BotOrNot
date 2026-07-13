import { useEffect, useMemo, useRef, useState } from 'react';

const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

export function useBehaviorSignals() {
  const sessionStart = useRef(performance.now());
  const lastClick = useRef(null);
  const lastKey = useRef(null);
  const lastPointer = useRef(null);
  const clickIntervals = useRef([]);
  const keyIntervals = useRef([]);
  const pointerDistance = useRef(0);

  const [counts, setCounts] = useState({ clickCount: 0, keyCount: 0, pointerMoveCount: 0 });
  const [clock, setClock] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setClock((value) => value + 1), 500);

    const onClick = () => {
      const now = performance.now();
      if (lastClick.current !== null) clickIntervals.current.push(now - lastClick.current);
      lastClick.current = now;
      setCounts((current) => ({ ...current, clickCount: current.clickCount + 1 }));
    };

    const onKeyDown = () => {
      const now = performance.now();
      if (lastKey.current !== null) keyIntervals.current.push(now - lastKey.current);
      lastKey.current = now;
      setCounts((current) => ({ ...current, keyCount: current.keyCount + 1 }));
    };

    const onPointerMove = (event) => {
      if (lastPointer.current) {
        const dx = event.clientX - lastPointer.current.x;
        const dy = event.clientY - lastPointer.current.y;
        pointerDistance.current += Math.hypot(dx, dy);
      }
      lastPointer.current = { x: event.clientX, y: event.clientY };
      setCounts((current) => ({ ...current, pointerMoveCount: current.pointerMoveCount + 1 }));
    };

    window.addEventListener('click', onClick, { passive: true });
    window.addEventListener('keydown', onKeyDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return useMemo(() => ({
    ...counts,
    averageClickIntervalMs: Math.round(average(clickIntervals.current)),
    averageKeyIntervalMs: Math.round(average(keyIntervals.current)),
    pointerPathDistance: Math.round(pointerDistance.current),
    sessionDurationMs: Math.round(performance.now() - sessionStart.current)
  }), [counts, clock]);
}
