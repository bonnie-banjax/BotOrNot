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
              autoPlay: true,
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
  minHeight: "400px",
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