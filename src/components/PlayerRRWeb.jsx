import { useEffect, useRef } from 'react';
import { record } from 'rrweb';
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';

export default function LivePlayer() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const PlayerComponent = rrwebPlayer.default || rrwebPlayer;
    let playerInstance = null;
    let resizeObserver = null;
    const initialEvents = [];

    // Helper to calculate responsive width and height (16:9 aspect ratio)
    const getDimensions = () => {
      const containerWidth = containerRef.current?.clientWidth || 800;
      const calculatedHeight = Math.round((containerWidth * 9) / 16);
      return { width: containerWidth, height: calculatedHeight };
    };

    // 1. Start recording first to capture initial events
    const stopRecording = record({
      emit(event) {
        if (playerInstance) {
          playerInstance.addEvent(event);
        } else {
          initialEvents.push(event);

          if (initialEvents.length >= 2 && containerRef.current) {
            const { width, height } = getDimensions();

            playerInstance = new PlayerComponent({
              target: containerRef.current,
              props: {
                events: initialEvents,
                width,
                height,
                liveMode: true,
                autoPlay: false,
              },
            });

            // 2. Observe container resizes and update player dimensions dynamically
            resizeObserver = new ResizeObserver(() => {
              if (playerInstance && containerRef.current) {
                const updated = getDimensions();
                playerInstance.$set({
                  width: updated.width,
                  height: updated.height,
                });
              }
            });

            resizeObserver.observe(containerRef.current);
          }
        }
      },
      checkoutEveryNms: 10000,
    });

    // 3. Clean up player, observer, and recorder
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (stopRecording) stopRecording();
      if (playerInstance?.$destroy) {
        playerInstance.$destroy();
      }
    };
  }, []);

  return (
<div className="rr-block" style={inline_style_1}>
  <style>{literal_inline_CSS}</style>
  <h3 style={inline_style_3}>Live Telemetry Feed</h3>
  <div ref={containerRef} style={inline_style_2} />
</div>
  );
}

const inline_style_1 = {
  background: "#282c34",
  color: "#abb2bf",
  padding: "12px",
  borderRadius: "8px",
  fontFamily: "monospace",
  fontSize: "0.85rem",
  border: "1px solid #3e4451",
  width: "100%",
  boxSizing: "border-box",
  // Add flex column layout to force child elements into normal flow
  display: "flex",
  flexDirection: "column",
  gap: "12px",
}

const inline_style_2 = {
  width: "100%",
  overflow: "hidden", // Prevents the player canvas/iframe from bleeding past borders
  display: "flex",
  justifyContent: "center"
}

const inline_style_3 = {
  margin: 0
};

const literal_inline_CSS = `
  .rr-player {
    background-color: #282c34 !important;
  }
  .rr-player .rr-controller {
    background-color: #21252b !important;
    color: #abb2bf !important;
    border-top: 1px solid #3e4451 !important;
  }
  .rr-player .rr-controller button,
  .rr-player .rr-timeline {
    filter: invert(0.85) hue-rotate(180deg);
  }
  .rr-player .rr-player__frame {
    background-color: #1e2227 !important;
  }
`;