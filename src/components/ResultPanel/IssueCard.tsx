import { priorityClass } from "../../utils/priorityClass";
import type { Issue } from "../../types/ticket";

interface IssueCardProps {
  issue: Issue;
  index: number;
  total: number;
}

export function IssueCard({ issue, index, total }: IssueCardProps) {
  const isPrimary = index === 0;
  // Out of Scope is a fixed, meaningless-input classification (always Low /
  // Tier-1 Support / High confidence) — those fields add noise, not signal,
  // so only the category itself is shown.
  const isOutOfScope = issue.category === "Out of Scope";

  return (
    <li
      className={"issue-card" + (isPrimary ? " issue-card-primary" : "")}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="issue-card-head">
        <span className="rank-badge">{index + 1}</span>
        <span className="issue-card-tag">
          {isPrimary ? "Primary issue" : `Other issue${total > 2 ? ` #${index + 1}` : ""}`}
        </span>
      </div>

      <div className="issue-card-badges">
        <span className="badge">{issue.category}</span>
        {!isOutOfScope && (
          <>
            <span className={`badge ${priorityClass(issue.priority)}`}>{issue.priority}</span>
            <span className="badge badge-neutral">{issue.assigned_team}</span>
            {issue.confidence && (
              <span className="badge badge-neutral badge-confidence">Confidence: {issue.confidence}</span>
            )}
          </>
        )}
      </div>

      <p className="issue-card-reasoning">{issue.reasoning}</p>
    </li>
  );
}
