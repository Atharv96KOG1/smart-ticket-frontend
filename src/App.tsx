import { useState } from "react";
import { Footer } from "./components/Footer";
import { HistoryDrawer } from "./components/HistoryDrawer/HistoryDrawer";
import { InputPanel } from "./components/InputPanel/InputPanel";
import { ResultPanel } from "./components/ResultPanel/ResultPanel";
import { TopBar } from "./components/TopBar/TopBar";
import { useSamples } from "./hooks/useSamples";
import { useTheme } from "./hooks/useTheme";
import { useTicketHistory } from "./hooks/useTicketHistory";
import { useTicketRouter } from "./hooks/useTicketRouter";
import type { HistoryEntry } from "./types/history";

function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const samples = useSamples();
  const history = useTicketHistory();
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const ticket = useTicketRouter(history.addEntry);

  const handleSelectHistory = (entry: HistoryEntry) => {
    ticket.restore(entry.message, entry.result);
    setHistoryOpen(false);
  };

  return (
    <>
      <div className="page">
        <TopBar
          theme={theme}
          onToggleTheme={toggleTheme}
          historyCount={history.count}
          onOpenHistory={() => setHistoryOpen(true)}
        />

        <main className="layout">
          <InputPanel ticket={ticket} samples={samples} />
          <ResultPanel status={ticket.status} result={ticket.result} />
        </main>

        <Footer />
      </div>

      <HistoryDrawer
        isOpen={isHistoryOpen}
        entries={history.entries}
        onClose={() => setHistoryOpen(false)}
        onClear={history.clear}
        onSelect={handleSelectHistory}
      />
    </>
  );
}

export default App;
