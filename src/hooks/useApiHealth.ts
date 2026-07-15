import { useEffect, useState } from "react";
import { API_BASE } from "../constants/api";

export type ApiHealthStatus = "checking" | "ok" | "error";

export function useApiHealth(): ApiHealthStatus {
  const [status, setStatus] = useState<ApiHealthStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        if (cancelled) return;
        setStatus(res.ok ? "ok" : "error");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
