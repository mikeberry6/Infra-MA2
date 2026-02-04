import { useState, useEffect, useRef } from "react";

interface UseAnimatedNumberOptions {
  duration?: number;
  easing?: "linear" | "easeOut" | "easeInOut";
}

function easingFunctions(t: number, type: string): number {
  switch (type) {
    case "easeOut":
      return 1 - Math.pow(1 - t, 3);
    case "easeInOut":
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    default:
      return t;
  }
}

export function useAnimatedNumber(
  targetValue: number,
  options: UseAnimatedNumberOptions = {}
): number {
  const { duration = 400, easing = "easeOut" } = options;
  const [displayValue, setDisplayValue] = useState(targetValue);
  const previousValue = useRef(targetValue);
  const animationFrame = useRef<number>();

  useEffect(() => {
    const startValue = previousValue.current;
    const startTime = performance.now();
    const diff = targetValue - startValue;

    // Skip animation if no change
    if (diff === 0) return;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunctions(progress, easing);

      const current = startValue + diff * easedProgress;
      setDisplayValue(Math.round(current));

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = targetValue;
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [targetValue, duration, easing]);

  return displayValue;
}
