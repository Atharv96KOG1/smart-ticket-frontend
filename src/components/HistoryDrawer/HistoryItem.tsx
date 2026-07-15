import { formatRelativeTime } from "../../utils/formatRelativeTime";
import { priorityClass } from "../../utils/priorityClass";
import type { HistoryEntry } from "../../types/history";

interface HistoryItemProps {
  entry: HistoryEntry;
  onClick: () => void;
}

export function HistoryItem({ entry, onClick }: HistoryItemProps) {
  const primary = entry.result.issues && entry.result.issues[0];
  const isOutOfScope = primary?.category === "Out of Scope";

  return (
    <button className="history-item" type="button" onClick={onClick}>
      <div className="history-item-top">
        <span className="history-item-time">{formatRelativeTime(entry.timestamp)}</span>
        {primary && (
          <span className={`badge ${isOutOfScope ? "" : priorityClass(primary.priority)}`}>
            {isOutOfScope ? primary.category : `${primary.category} · ${primary.priority}`}
          </span>
        )}
      </div>
      <p className="history-item-msg">{entry.message}</p>
    </button>
  );
}
