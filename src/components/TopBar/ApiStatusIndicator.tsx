import { useApiHealth } from "../../hooks/useApiHealth";

export function ApiStatusIndicator() {
  const status = useApiHealth();

  const dotClass = status === "ok" ? "dot ok" : status === "error" ? "dot err" : "dot";
  const text = status === "ok" ? "API online" : status === "error" ? "API unreachable" : "Checking API…";

  return (
    <div className="status">
      <span className={dotClass} />
      <span>{text}</span>
    </div>
  );
}
