import type { RouterStatus } from "../../hooks/useTicketRouter";
import type { RouteResponse } from "../../types/ticket";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { ResultCard } from "./ResultCard";

interface ResultPanelProps {
  status: RouterStatus;
  result: RouteResponse | null;
}

export function ResultPanel({ status, result }: ResultPanelProps) {
  return (
    <section className="panel result-panel">
      <div className="panel-head">
        <h2>Routing decision</h2>
        <p>Every distinct issue, fully classified — category, priority, team, and reasoning.</p>
      </div>

      {status === "empty" && <EmptyState />}
      {status === "loading" && <LoadingState />}
      {status === "result" && result && <ResultCard result={result} />}
    </section>
  );
}
