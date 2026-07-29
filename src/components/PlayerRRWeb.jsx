import { useEffect, useRef } from "react";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";
import { subscribeRRWeb } from "../lib/rrwebStore"; // Shared listener

export default function LivePlayer() {
  const containerRef = useRef(null);


useEffect(() => {
  if (!containerRef.current) {
    console.warn("[LivePlayer] containerRef.current is null on mount!");
    return;
  }

                                                                                // consol.log("[LivePlayer] Component mounted. Subscribing to rrwebStore...");
  const PlayerComponent = rrwebPlayer.default || rrwebPlayer;
  let playerInstance = null;
  let resizeObserver = null;
  const initialEvents = [];

  const getDimensions = () => {
    const containerWidth = containerRef.current?.clientWidth || 800;
    const calculatedHeight = Math.round((containerWidth * 9) / 16);
    return { width: containerWidth, height: calculatedHeight };
  };

  const unsubscribe = subscribeRRWeb((event) => {
                                                                                // consol.log(`[LivePlayer] Received event type: ${event.type}`);

    if (playerInstance) {
                                                                                // consol.log(`[LivePlayer] Stream active -> Calling playerInstance.addEvent(type: ${event.type})`);
      playerInstance.addEvent(event);
    } else {
      initialEvents.push(event);

      const hasMeta = initialEvents.some((e) => e.type === 4);
      const hasFullSnapshot = initialEvents.some((e) => e.type === 2);

                                                                                // consol.log(`[LivePlayer Buffer] Events stored: ${initialEvents.length} | Has Meta(4): ${hasMeta} | Has FullSnapshot(2): ${hasFullSnapshot}`);

      if (hasMeta && hasFullSnapshot && containerRef.current) {
                                                                                // consol.log("[LivePlayer] Both Meta (4) & FullSnapshot (2) present! Bootstrapping player...");

        // Ensure Meta event (4) comes first
        initialEvents.sort((a, b) => (a.type === 4 ? -1 : b.type === 4 ? 1 : 0));

        try {
          const { width, height } = getDimensions();

          // Clear any lingering DOM elements before instantiating
                                                                                // consol.log("[LivePlayer] Clearing target DOM container before player creation.");
          containerRef.current.innerHTML = "";

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
                                                                                // consol.log("[LivePlayer] Player successfully instantiated!");
        } catch (err) {
          console.error("[LivePlayer] Failed to instantiate player:", err);
        }

        resizeObserver = new ResizeObserver(() => {
          if (playerInstance && containerRef.current) {
            const updated = getDimensions();
                                                                                // consol.log(`[LivePlayer ] Container resized -> updating player bounds: ${updated.width}x${updated.height}`);
            playerInstance.$set({
              width: updated.width,
              height: updated.height,
            });
          }
        });
        resizeObserver.observe(containerRef.current);
      }
    }
  });

  return () => {
                                                                                // consol.log("[LivePlayer] Unmounting component and running cleanup...");
    unsubscribe();
    if (resizeObserver) {
                                                                                // consol.log("[LivePlayer] Disconnecting ResizeObserver.");
      resizeObserver.disconnect();
    }
    if (playerInstance?.$destroy) {
                                                                                // consol.log("[LivePlayer] Destroying playerInstance.");
      playerInstance.$destroy();
    }
    if (containerRef.current) {
                                                                                // consol.log("[LivePlayer] Wiping container innerHTML on cleanup.");
      containerRef.current.innerHTML = "";
    }
  };
}, []);

  return (
<div className="rr-block" style={inline_style_1}>
  <style>{literal_inline_CSS}</style>
  <h3 style={inline_style_3}>DOM Mutation Replayer</h3>
  <div ref={containerRef} style={inline_style_2} />
</div>
  );
}
const inline_style_1 = {
  background: "#08103A", // Dark blue slate container
  color: "#abb2bf",
  padding: "12px",
  borderRadius: "8px",
  fontFamily: "monospace",
  fontSize: "0.85rem",
  lineHeight: "1.4",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  width: "100%",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const inline_style_2 = {
  width: "100%",
  minHeight: "400px",
  overflow: "hidden",
  display: "flex",
  justifyContent: "center",
  borderRadius: "6px",
  background: "#050B28"
};

const inline_style_3 = {
  margin: 0,
  fontFamily: "monospace",
  fontSize: "0.85rem",
  lineHeight: "1.2",
  fontWeight: "bold",
  color: "#ffffff",
  textTransform: "none",
  letterSpacing: "normal"
};

// CSS overrides that force reset font sizes/margins inside rrweb's internal DOM
const literal_inline_CSS = `
  /* Master Reset for RRWeb internal spans, divs, buttons, and text */
  .rr-player,
  .rr-player *,
  .rr-player span,
  .rr-player div,
  .rr-player button {
    font-family: monospace !important;
    font-size: 11px !important;
    line-height: 1.2 !important;
    letter-spacing: normal !important;
    text-transform: none !important;
  }

  /* Core player background */
  .rr-player {
    background-color: #050B28 !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 6px !important;
    overflow: hidden !important;
  }

  .rr-player .rr-player__frame {
    background-color: #050B28 !important;
  }

  /* Control bar footer */
  .rr-player .rr-controller {
    background-color: #08103A !important;
    color: #abb2bf !important;
    border-top: 1px solid rgba(255, 255, 255, 0.15) !important;
    padding: 6px 12px !important;
    height: auto !important;
  }

  /* Control buttons */
  .rr-player .rr-controller button {
    color: #ffffff !important;
    fill: #ffffff !important;
    font-size: 11px !important;
    background: transparent !important;
    border: none !important;
    cursor: pointer !important;
  }

  .rr-player .rr-controller button:hover {
    opacity: 0.8 !important;
  }

  /* Timeline container reset */
  .rr-player .rr-timeline {
    height: 8px !important;
    background-color: #050B28 !important;
    border-radius: 4px !important;
    margin: 0 10px !important;
    position: relative !important;
    cursor: pointer !important;
  }

  /* Played progress bar track */
  .rr-player .rr-timeline__finished {
    background-color: #61afef !important;
    border-radius: 4px !important;
    height: 100% !important;
  }

  /* Scrubber handle (knob) */
  .rr-player .rr-timeline__handler {
    width: 14px !important;
    height: 14px !important;
    border-radius: 50% !important;
    background-color: #98c379 !important; /* Green dot theme color */
    border: 2px solid #ffffff !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.5) !important;
    cursor: grab !important;
  }

  /* Time display text */
  .rr-player .rr-controller span {
    font-size: 11px !important;
    color: #abb2bf !important;
    margin: 0 4px !important;
  }
`;