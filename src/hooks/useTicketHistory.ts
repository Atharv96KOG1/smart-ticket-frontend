import { useCallback, useState } from "react";
import { HISTORY_KEY, HISTORY_LIMIT } from "../constants/storage";
import type { HistoryEntry } from "../types/history";
import type { RouteResponse } from "../types/ticket";

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_LIMIT)));
  } catch {
    // storage full or unavailable (e.g. private browsing) — history just won't persist
  }
}

export function useTicketHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => loadHistory());

  const addEntry = useCallback((message: string, result: RouteResponse) => {
    setEntries((prev) => {
      const next = [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          message,
          timestamp: Date.now(),
          result,
        },
        ...prev,
      ].slice(0, HISTORY_LIMIT);
      saveHistory(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // ignore
    }
    setEntries([]);
  }, []);

  return { entries, count: entries.length, addEntry, clear };
}
