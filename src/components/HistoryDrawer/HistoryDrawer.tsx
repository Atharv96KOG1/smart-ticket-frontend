import { useEffect, useState } from "react";
import type { HistoryEntry } from "../../types/history";
import { HistoryItem } from "./HistoryItem";

interface HistoryDrawerProps {
  isOpen: boolean;
  entries: HistoryEntry[];
  onClose: () => void;
  onClear: () => void;
  onSelect: (entry: HistoryEntry) => void;
}

// The slide-in transition takes 250ms (see .history-drawer in styles.css).
// This component mirrors the original's DOM choreography: unhide before
// adding the "open" class (so the transition actually plays), and keep the
// elements mounted for the duration of the close transition before hiding.
const DRAWER_TRANSITION_MS = 250;

export function HistoryDrawer({ isOpen, entries, onClose, onClear, onSelect }: HistoryDrawerProps) {
  const [mounted, setMounted] = useState(isOpen);
  const [animOpen, setAnimOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const rafId = requestAnimationFrame(() => setAnimOpen(true));
      return () => cancelAnimationFrame(rafId);
    }

    setAnimOpen(false);
    const timeoutId = window.setTimeout(() => setMounted(false), DRAWER_TRANSITION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  useEffect(() => {
    if (!animOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [animOpen, onClose]);

  return (
    <>
      <div
        className={`history-overlay${animOpen ? " open" : ""}`}
        hidden={!mounted}
        onClick={onClose}
      />
      <aside
        className={`history-drawer${animOpen ? " open" : ""}`}
        hidden={!mounted}
        aria-hidden={!animOpen}
        aria-label="Ticket history"
      >
        <div className="history-head">
          <h2>Ticket history</h2>
          <button className="btn btn-ghost btn-small" type="button" onClick={onClear}>
            Clear all
          </button>
          <button className="drawer-close" type="button" aria-label="Close history" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="history-list" hidden={entries.length === 0}>
          {entries.map((entry) => (
            <HistoryItem key={entry.id} entry={entry} onClick={() => onSelect(entry)} />
          ))}
        </div>
        <div className="history-empty" hidden={entries.length > 0}>
          <p>No tickets routed yet. Route a ticket to see it show up here.</p>
        </div>
      </aside>
    </>
  );
}
