import type { RouteResponse } from "../../types/ticket";
import { IssueCard } from "./IssueCard";
import { RawJsonViewer } from "./RawJsonViewer";
import { StatsRow } from "./StatsRow";

interface ResultCardProps {
  result: RouteResponse;
}

export function ResultCard({ result }: ResultCardProps) {
  const issues = result.issues || [];

  return (
    <div className="result-card">
      <StatsRow issueCount={issues.length} processingTimeMs={result.processing_time_ms ?? 0} animationTrigger={result} />

      <ol className="issues-list">
        {issues.map((issue, i) => (
          <IssueCard key={issue.id ?? i} issue={issue} index={i} total={issues.length} />
        ))}
      </ol>

      <RawJsonViewer data={result} />
    </div>
  );
}
