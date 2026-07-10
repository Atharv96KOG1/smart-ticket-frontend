declare global {
  interface Window {
    API_BASE?: string;
  }
}

type Priority = "High" | "Medium" | "Low";

interface OtherIssue {
  category: string;
  priority: Priority;
}

interface RouteResponse {
  category: string;
  priority: Priority;
  assigned_team: string;
  reasoning: string;
  other_issues?: OtherIssue[];
  confidence?: string;
}

interface ErrorResponse {
  detail?: string;
}

interface SampleTicket {
  text: string;
}

// Backend origin. Override at runtime via `window.API_BASE = "https://your-api"`
// in a small inline <script> before app.js, or edit the default below.
const API_BASE = window.API_BASE || "http://localhost:8000";

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
  resultCard: getEl<HTMLDivElement>("resultCard"),
  apiDot: getEl<HTMLSpanElement>("apiDot"),
  apiStatusText: getEl<HTMLSpanElement>("apiStatusText"),
  rCategory: getEl<HTMLSpanElement>("rCategory"),
  rPriority: getEl<HTMLSpanElement>("rPriority"),
  rTeam: getEl<HTMLSpanElement>("rTeam"),
  rConfidence: getEl<HTMLSpanElement>("rConfidence"),
  priorityList: getEl<HTMLOListElement>("priorityList"),
  rReasoning: getEl<HTMLParagraphElement>("rReasoning"),
  rRaw: getEl<HTMLPreElement>("rRaw"),
};

function setLoading(isLoading: boolean): void {
  els.routeBtn.disabled = isLoading;
  getEl<HTMLSpanElement>("routeBtn").querySelector<HTMLSpanElement>(".spinner")!.hidden = !isLoading;
  els.routeBtn.querySelector<HTMLSpanElement>(".btn-label")!.textContent = isLoading
    ? "Routing…"
    : "Route ticket";
}

function showError(message: string): void {
  els.errorMsg.textContent = message;
  els.errorMsg.hidden = false;
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

function buildOtherIssueItem(issue: OtherIssue, rank: number): HTMLLIElement {
  const li = document.createElement("li");
  li.className = "priority-item";

  const rankBadge = document.createElement("span");
  rankBadge.className = "rank-badge";
  rankBadge.textContent = String(rank);

  const body = document.createElement("div");
  body.className = "priority-item-body";

  const label = document.createElement("span");
  label.className = "priority-item-label";
  label.textContent = "Other priority";

  const tags = document.createElement("div");
  tags.className = "priority-item-tags";

  const categoryBadge = document.createElement("span");
  categoryBadge.className = "badge badge-neutral";
  categoryBadge.textContent = issue.category;

  const priorityBadge = document.createElement("span");
  priorityBadge.className = "badge " + priorityClass(issue.priority);
  priorityBadge.textContent = issue.priority;

  tags.append(categoryBadge, priorityBadge);
  body.append(label, tags);
  li.append(rankBadge, body);
  return li;
}

function renderResult(data: RouteResponse): void {
  els.emptyState.hidden = true;
  els.resultCard.hidden = false;

  els.rCategory.textContent = data.category;
  els.rPriority.textContent = data.priority;
  els.rPriority.className = "badge " + priorityClass(data.priority);
  els.rTeam.textContent = data.assigned_team;
  els.rConfidence.textContent = data.confidence || "—";

  els.priorityList
    .querySelectorAll(".priority-item:not(.priority-item-main)")
    .forEach((el) => el.remove());
  (data.other_issues || []).forEach((issue, i) => {
    els.priorityList.appendChild(buildOtherIssueItem(issue, i + 2));
  });

  els.rReasoning.textContent = data.reasoning;
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
  } catch {
    showError("Could not reach the API. Is the server running?");
  } finally {
    setLoading(false);
  }
}

function updateCharCount(): void {
  els.charCount.textContent = `${els.textarea.value.length} / 8000`;
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

updateCharCount();
checkHealth();
loadSamples();

export {};
