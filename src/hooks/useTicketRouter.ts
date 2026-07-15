import { useCallback, useState } from "react";
import { API_BASE } from "../constants/api";
import type { ErrorResponse, RouteResponse } from "../types/ticket";

// Mirrors the original vanilla-DOM state machine exactly:
//  - "empty"   initial state, no ticket routed yet
//  - "loading" a /route request is in flight
//  - "result"  the last request succeeded and `result` holds its payload
//  - "blank"   a request failed (validation, HTTP error, or network error)
//              after loading had already hidden the empty/result panels —
//              the panel shows nothing until the next successful route.
export type RouterStatus = "empty" | "loading" | "result" | "blank";

export function useTicketRouter(onRouted?: (message: string, result: RouteResponse) => void) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<RouterStatus>("empty");
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorNonce, setErrorNonce] = useState(0);

  const showError = useCallback((message: string) => {
    setError(message);
    setErrorNonce((n) => n + 1);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const submit = useCallback(async () => {
    clearError();
    const message = value;

    if (!message.trim()) {
      showError("Ticket message must not be blank.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      let body: RouteResponse | ErrorResponse | null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }

      if (!res.ok) {
        const detail = body && "detail" in body && body.detail ? body.detail : `Request failed (HTTP ${res.status}).`;
        showError(detail);
        setStatus("blank");
        return;
      }

      const data = body as RouteResponse;
      setResult(data);
      setStatus("result");
      onRouted?.(message, data);
    } catch {
      showError("Could not reach the API. Is the server running?");
      setStatus("blank");
    }
  }, [value, onRouted, showError, clearError]);

  const clear = useCallback(() => {
    setValue("");
    clearError();
  }, [clearError]);

  const restore = useCallback(
    (message: string, historyResult: RouteResponse) => {
      setValue(message);
      clearError();
      setResult(historyResult);
      setStatus("result");
    },
    [clearError]
  );

  return { value, setValue, status, result, error, errorNonce, submit, clear, clearError, restore };
}
