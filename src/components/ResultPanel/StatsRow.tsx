import { useCountUp } from "../../hooks/useCountUp";

interface StatsRowProps {
  issueCount: number;
  processingTimeMs: number;
  animationTrigger: unknown;
}

export function StatsRow({ issueCount, processingTimeMs, animationTrigger }: StatsRowProps) {
  const animatedMs = useCountUp(processingTimeMs, animationTrigger);

  return (
    <div className="stats-row">
      <span className="stat-chip">
        {issueCount} issue{issueCount === 1 ? "" : "s"} detected
      </span>
      <span className="stat-chip stat-chip-time">⚡ {animatedMs}ms</span>
    </div>
  );
}
