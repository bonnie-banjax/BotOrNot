import { useEffect, useState } from "react";

function useBehaviorTracking() {
  const [behavior, setBehavior] = useState({
    clickCount: 0,
    keyPressCount: 0,
    mouseMoveCount: 0,
  });

  useEffect(() => {
    function handleClick() {
      setBehavior((previousBehavior) => ({
        ...previousBehavior,
        clickCount: previousBehavior.clickCount + 1,
      }));
    }

    function handleKeyDown() {
      setBehavior((previousBehavior) => ({
        ...previousBehavior,
        keyPressCount: previousBehavior.keyPressCount + 1,
      }));
    }

    function handleMouseMove() {
      setBehavior((previousBehavior) => ({
        ...previousBehavior,
        mouseMoveCount: previousBehavior.mouseMoveCount + 1,
      }));
    }

    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return behavior;
}

export default useBehaviorTracking;