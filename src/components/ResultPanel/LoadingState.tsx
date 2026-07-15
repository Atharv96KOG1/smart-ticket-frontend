export function LoadingState() {
  return (
    <div className="loading-state" aria-hidden="true">
      <div className="skeleton-stats">
        <span className="skeleton skeleton-chip" />
        <span className="skeleton skeleton-chip" />
      </div>
      <div className="skeleton-card" />
      <div className="skeleton-card skeleton-card-sm" />
    </div>
  );
}
