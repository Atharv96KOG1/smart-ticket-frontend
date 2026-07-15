import type { Theme } from "../../types/theme";
import { ApiStatusIndicator } from "./ApiStatusIndicator";
import { BrandMark } from "./BrandMark";
import { HistoryButton } from "./HistoryButton";
import { ThemeToggleButton } from "./ThemeToggleButton";

interface TopBarProps {
  theme: Theme;
  onToggleTheme: () => void;
  historyCount: number;
  onOpenHistory: () => void;
}

export function TopBar({ theme, onToggleTheme, historyCount, onOpenHistory }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <BrandMark />
        <span className="brand-name">Smart Ticket Router</span>
      </div>
      <div className="topbar-right">
        <ApiStatusIndicator />
        <HistoryButton count={historyCount} onClick={onOpenHistory} />
        <ThemeToggleButton theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
