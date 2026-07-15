import { useEffect, useState } from "react";

/**
 * Animates a number counting up from 0 to `target` using an ease-out cubic
 * curve. Pass a `trigger` value (e.g. the result object the count belongs
 * to) that changes identity whenever the animation should replay, even if
 * `target` happens to equal its previous value.
 */
export function useCountUp(target: number, trigger: unknown, durationMs = 500): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let rafId: number;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, trigger, durationMs]);

  return value;
}
