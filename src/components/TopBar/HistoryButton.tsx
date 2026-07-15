interface HistoryButtonProps {
  count: number;
  onClick: () => void;
}

export function HistoryButton({ count, onClick }: HistoryButtonProps) {
  return (
    <button className="theme-toggle history-toggle" type="button" aria-label="View ticket history" onClick={onClick}>
      <span className="history-icon" aria-hidden="true">
        🕘
      </span>
      <span className="history-count" hidden={count === 0}>
        {count}
      </span>
    </button>
  );
}
