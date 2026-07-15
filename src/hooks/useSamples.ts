import { useEffect, useState } from "react";
import { API_BASE } from "../constants/api";
import type { SampleTicket } from "../types/ticket";

export function useSamples(): string[] {
  const [samples, setSamples] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/data/sample_tickets.json`);
        if (!res.ok) return;
        const data: SampleTicket[] = await res.json();
        if (cancelled) return;
        setSamples(
          data.filter((s) => s.text && s.text.trim()).map((s) => s.text)
        );
      } catch {
        // sample list is optional
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return samples;
}
