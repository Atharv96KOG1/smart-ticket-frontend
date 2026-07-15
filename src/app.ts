declare global {
  interface Window {
    API_BASE?: string;
  }
}

type Priority = "High" | "Medium" | "Low";
type Confidence = "High" | "Medium" | "Low";
type Theme = "dark" | "light";

interface Issue {
  id: number;
  category: string;
  priority: Priority;
  assigned_team: string;
  reasoning: string;
  confidence?: Confidence;
}

interface RouteResponse {
  issues: Issue[];
  processing_time_ms: number;
}

interface ErrorResponse {
  detail?: string;
}

interface SampleTicket {
  text: string;
}

interface HistoryEntry {
  id: string;
  message: string;
  timestamp: number;
  result: RouteResponse;
}

// Backend origin. Override at runtime via `window.API_BASE = "https://your-api"`
// in a small inline <script> before app.js, or edit the default below.
const API_BASE = window.API_BASE || "http://localhost:8000";
const THEME_KEY = "stk-theme";
const HISTORY_KEY = "stk-history";
const HISTORY_LIMIT = 50;

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id} element`);
  return el as T;
}

const els = {
  textarea: getEl<HTMLTextAreaElement>("ticketText"),
  charCount: getEl<HTMLSpanElement>("charCount"),
  routeBtn: getEl<HTMLButtonElement>("routeBtn"),
  clearBtn: getEl<HTMLButtonElement>("clearBtn"),
  sampleSelect: getEl<HTMLSelectElement>("sampleSelect"),
  errorMsg: getEl<HTMLParagraphElement>("errorMsg"),
  emptyState: getEl<HTMLDivElement>("emptyState"),
  loadingState: getEl<HTMLDivElement>("loadingState"),
  resultCard: getEl<HTMLDivElement>("resultCard"),
  apiDot: getEl<HTMLSpanElement>("apiDot"),
  apiStatusText: getEl<HTMLSpanElement>("apiStatusText"),
  themeToggle: getEl<HTMLButtonElement>("themeToggle"),
  issueCountChip: getEl<HTMLSpanElement>("issueCountChip"),
  timeChip: getEl<HTMLSpanElement>("timeChip"),
  issuesList: getEl<HTMLOListElement>("issuesList"),
  rawToggle: getEl<HTMLButtonElement>("rawToggle"),
  rawJsonBody: getEl<HTMLDivElement>("rawJsonBody"),
  copyBtn: getEl<HTMLButtonElement>("copyBtn"),
  rRaw: getEl<HTMLPreElement>("rRaw"),
  historyBtn: getEl<HTMLButtonElement>("historyBtn"),
  historyCount: getEl<HTMLSpanElement>("historyCount"),
  historyOverlay: getEl<HTMLDivElement>("historyOverlay"),
  historyDrawer: getEl<HTMLElement>("historyDrawer"),
  historyList: getEl<HTMLDivElement>("historyList"),
  historyEmpty: getEl<HTMLDivElement>("historyEmpty"),
  historyClearBtn: getEl<HTMLButtonElement>("historyClearBtn"),
  historyCloseBtn: getEl<HTMLButtonElement>("historyCloseBtn"),
};

function setLoading(isLoading: boolean): void {
  els.routeBtn.disabled = isLoading;
  els.routeBtn.querySelector<HTMLSpanElement>(".spinner")!.hidden = !isLoading;
  els.routeBtn.querySelector<HTMLSpanElement>(".btn-label")!.textContent = isLoading
    ? "Routing…"
    : "Route ticket";

  if (isLoading) {
    els.emptyState.hidden = true;
    els.resultCard.hidden = true;
    els.loadingState.hidden = false;
  } else {
    els.loadingState.hidden = true;
  }
}

function showError(message: string): void {
  els.errorMsg.textContent = message;
  els.errorMsg.hidden = false;
  els.errorMsg.classList.remove("shake");
  // Force reflow so the animation replays on repeated errors.
  void els.errorMsg.offsetWidth;
  els.errorMsg.classList.add("shake");
}

function clearError(): void {
  els.errorMsg.hidden = true;
  els.errorMsg.textContent = "";
}

function priorityClass(priority: string | undefined): string {
  const key = (priority || "").toLowerCase();
  if (key === "high") return "priority-high";
  if (key === "medium") return "priority-medium";
  if (key === "low") return "priority-low";
  return "";
}

function buildIssueCard(issue: Issue, index: number, total: number): HTMLLIElement {
  const li = document.createElement("li");
  li.className = "issue-card" + (index === 0 ? " issue-card-primary" : "");
  li.style.animationDelay = `${index * 70}ms`;

  const head = document.createElement("div");
  head.className = "issue-card-head";

  const rank = document.createElement("span");
  rank.className = "rank-badge";
  rank.textContent = String(index + 1);

  const tag = document.createElement("span");
  tag.className = "issue-card-tag";
  tag.textContent = index === 0 ? "Primary issue" : `Other issue${total > 2 ? ` #${index + 1}` : ""}`;

  head.append(rank, tag);

  const badges = document.createElement("div");
  badges.className = "issue-card-badges";

  const categoryBadge = document.createElement("span");
  categoryBadge.className = "badge";
  categoryBadge.textContent = issue.category;
  badges.append(categoryBadge);

  // Out of Scope is a fixed, meaningless-input classification (always Low /
  // Tier-1 Support / High confidence) — those fields add noise, not signal,
  // so only the category itself is shown.
  if (issue.category !== "Out of Scope") {
    const priorityBadge = document.createElement("span");
    priorityBadge.className = "badge " + priorityClass(issue.priority);
    priorityBadge.textContent = issue.priority;

    const teamBadge = document.createElement("span");
    teamBadge.className = "badge badge-neutral";
    teamBadge.textContent = issue.assigned_team;

    badges.append(priorityBadge, teamBadge);

    if (issue.confidence) {
      const confidenceBadge = document.createElement("span");
      confidenceBadge.className = "badge badge-neutral badge-confidence";
      confidenceBadge.textContent = `Confidence: ${issue.confidence}`;
      badges.append(confidenceBadge);
    }
  }

  const reasoning = document.createElement("p");
  reasoning.className = "issue-card-reasoning";
  reasoning.textContent = issue.reasoning;

  li.append(head, badges, reasoning);
  return li;
}

function countUp(el: HTMLElement, target: number, prefix: string, suffix: string, durationMs = 500): void {
  const start = performance.now();
  const step = (now: number) => {
    const progress = Math.min((now - start) / durationMs, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function renderResult(data: RouteResponse): void {
  els.emptyState.hidden = true;
  els.loadingState.hidden = true;
  els.resultCard.hidden = false;

  const issues = data.issues || [];
  els.issueCountChip.textContent = `${issues.length} issue${issues.length === 1 ? "" : "s"} detected`;
  countUp(els.timeChip, data.processing_time_ms ?? 0, "⚡ ", "ms");

  els.issuesList.replaceChildren(...issues.map((issue, i) => buildIssueCard(issue, i, issues.length)));

  els.rRaw.textContent = JSON.stringify(data, null, 2);
}

async function routeTicket(): Promise<void> {
  const message = els.textarea.value;
  clearError();

  if (!message.trim()) {
    showError("Ticket message must not be blank.");
    return;
  }

  setLoading(true);
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
      return;
    }

    renderResult(body as RouteResponse);
    addHistoryEntry(message, body as RouteResponse);
  } catch {
    showError("Could not reach the API. Is the server running?");
  } finally {
    setLoading(false);
  }
}

function updateCharCount(): void {
  const len = els.textarea.value.length;
  els.charCount.textContent = `${len} / 8000`;
  els.charCount.classList.toggle("char-count-warn", len > 7000);
}

async function checkHealth(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) {
      els.apiDot.className = "dot ok";
      els.apiStatusText.textContent = "API online";
      return;
    }
    throw new Error("bad status");
  } catch {
    els.apiDot.className = "dot err";
    els.apiStatusText.textContent = "API unreachable";
  }
}

async function loadSamples(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/data/sample_tickets.json`);
    if (!res.ok) return;
    const samples: SampleTicket[] = await res.json();
    samples
      .filter((s) => s.text && s.text.trim())
      .forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.text;
        opt.textContent = s.text.length > 60 ? s.text.slice(0, 57) + "…" : s.text;
        els.sampleSelect.appendChild(opt);
      });
  } catch {
    // sample list is optional
  }
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  els.themeToggle.setAttribute("aria-pressed", String(theme === "light"));
  els.themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
}

function initTheme(): void {
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(stored ?? (systemDark ? "dark" : "light"));
}

function toggleTheme(): void {
  const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  const next: Theme = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
}

async function copyRawJson(): Promise<void> {
  try {
    await navigator.clipboard.writeText(els.rRaw.textContent || "");
    els.copyBtn.textContent = "Copied ✓";
    els.copyBtn.classList.add("btn-copied");
  } catch {
    els.copyBtn.textContent = "Copy failed";
  } finally {
    setTimeout(() => {
      els.copyBtn.textContent = "Copy";
      els.copyBtn.classList.remove("btn-copied");
    }, 1500);
  }
}

function toggleRawJson(): void {
  const expanded = els.rawToggle.getAttribute("aria-expanded") === "true";
  els.rawToggle.setAttribute("aria-expanded", String(!expanded));
  els.rawJsonBody.hidden = expanded;
}

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

function formatRelativeTime(timestamp: number): string {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function updateHistoryCount(count: number): void {
  els.historyCount.textContent = String(count);
  els.historyCount.hidden = count === 0;
}

function buildHistoryItem(entry: HistoryEntry): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = "history-item";
  btn.type = "button";

  const top = document.createElement("div");
  top.className = "history-item-top";

  const time = document.createElement("span");
  time.className = "history-item-time";
  time.textContent = formatRelativeTime(entry.timestamp);
  top.append(time);

  const primary = entry.result.issues && entry.result.issues[0];
  if (primary) {
    const badge = document.createElement("span");
    const isOutOfScope = primary.category === "Out of Scope";
    badge.className = "badge " + (isOutOfScope ? "" : priorityClass(primary.priority));
    badge.textContent = isOutOfScope ? primary.category : `${primary.category} · ${primary.priority}`;
    top.append(badge);
  }

  const msg = document.createElement("p");
  msg.className = "history-item-msg";
  msg.textContent = entry.message;

  btn.append(top, msg);
  btn.addEventListener("click", () => {
    els.textarea.value = entry.message;
    updateCharCount();
    clearError();
    renderResult(entry.result);
    closeHistory();
  });
  return btn;
}

function renderHistoryList(): void {
  const entries = loadHistory();
  els.historyList.replaceChildren(...entries.map(buildHistoryItem));
  els.historyList.hidden = entries.length === 0;
  els.historyEmpty.hidden = entries.length > 0;
}

function addHistoryEntry(message: string, result: RouteResponse): void {
  const entries = loadHistory();
  entries.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    timestamp: Date.now(),
    result,
  });
  saveHistory(entries);
  updateHistoryCount(entries.length);
}

function openHistory(): void {
  renderHistoryList();
  els.historyOverlay.hidden = false;
  els.historyDrawer.hidden = false;
  els.historyDrawer.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    els.historyOverlay.classList.add("open");
    els.historyDrawer.classList.add("open");
  });
}

function closeHistory(): void {
  els.historyOverlay.classList.remove("open");
  els.historyDrawer.classList.remove("open");
  els.historyDrawer.setAttribute("aria-hidden", "true");
  setTimeout(() => {
    els.historyOverlay.hidden = true;
    els.historyDrawer.hidden = true;
  }, 250);
}

function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
  updateHistoryCount(0);
  renderHistoryList();
}

els.routeBtn.addEventListener("click", routeTicket);

els.textarea.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    routeTicket();
  }
});

els.textarea.addEventListener("input", updateCharCount);

els.clearBtn.addEventListener("click", () => {
  els.textarea.value = "";
  updateCharCount();
  clearError();
  els.sampleSelect.value = "";
  els.textarea.focus();
});

els.sampleSelect.addEventListener("change", () => {
  if (els.sampleSelect.value) {
    els.textarea.value = els.sampleSelect.value;
    updateCharCount();
    clearError();
  }
});

els.themeToggle.addEventListener("click", toggleTheme);
els.rawToggle.addEventListener("click", toggleRawJson);
els.copyBtn.addEventListener("click", copyRawJson);

els.historyBtn.addEventListener("click", openHistory);
els.historyCloseBtn.addEventListener("click", closeHistory);
els.historyOverlay.addEventListener("click", closeHistory);
els.historyClearBtn.addEventListener("click", clearHistory);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && els.historyDrawer.classList.contains("open")) {
    closeHistory();
  }
});

initTheme();
updateCharCount();
checkHealth();
loadSamples();
updateHistoryCount(loadHistory().length);

export {};
