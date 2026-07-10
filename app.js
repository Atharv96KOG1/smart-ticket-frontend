// Backend origin. Override at runtime via `window.API_BASE = "https://your-api"`
// in a small inline <script> before app.js, or edit the default below.
const API_BASE = window.API_BASE || "http://localhost:8000";

const els = {
  textarea: document.getElementById("ticketText"),
  charCount: document.getElementById("charCount"),
  routeBtn: document.getElementById("routeBtn"),
  clearBtn: document.getElementById("clearBtn"),
  sampleSelect: document.getElementById("sampleSelect"),
  errorMsg: document.getElementById("errorMsg"),
  emptyState: document.getElementById("emptyState"),
  resultCard: document.getElementById("resultCard"),
  apiDot: document.getElementById("apiDot"),
  apiStatusText: document.getElementById("apiStatusText"),
  rCategory: document.getElementById("rCategory"),
  rPriority: document.getElementById("rPriority"),
  rTeam: document.getElementById("rTeam"),
  rConfidence: document.getElementById("rConfidence"),
  rSecondaryItem: document.getElementById("rSecondaryItem"),
  rSecondary: document.getElementById("rSecondary"),
  rSecondaryPriority: document.getElementById("rSecondaryPriority"),
  rReasoning: document.getElementById("rReasoning"),
  rRaw: document.getElementById("rRaw"),
};

function setLoading(isLoading) {
  els.routeBtn.disabled = isLoading;
  els.routeBtn.querySelector(".spinner").hidden = !isLoading;
  els.routeBtn.querySelector(".btn-label").textContent = isLoading ? "Routing…" : "Route ticket";
}

function showError(message) {
  els.errorMsg.textContent = message;
  els.errorMsg.hidden = false;
}

function clearError() {
  els.errorMsg.hidden = true;
  els.errorMsg.textContent = "";
}

function priorityClass(priority) {
  const key = (priority || "").toLowerCase();
  if (key === "high") return "priority-high";
  if (key === "medium") return "priority-medium";
  if (key === "low") return "priority-low";
  return "";
}

function renderResult(data) {
  els.emptyState.hidden = true;
  els.resultCard.hidden = false;

  els.rCategory.textContent = data.category;
  els.rPriority.textContent = data.priority;
  els.rPriority.className = "badge " + priorityClass(data.priority);
  els.rTeam.textContent = data.assigned_team;
  els.rConfidence.textContent = data.confidence || "—";

  if (data.secondary_category) {
    els.rSecondaryItem.hidden = false;
    els.rSecondary.textContent = data.secondary_category;
    els.rSecondaryPriority.textContent = data.secondary_priority || "—";
    els.rSecondaryPriority.className = "badge " + priorityClass(data.secondary_priority);
  } else {
    els.rSecondaryItem.hidden = true;
  }

  els.rReasoning.textContent = data.reasoning;
  els.rRaw.textContent = JSON.stringify(data, null, 2);
}

async function routeTicket() {
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

    let body;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    if (!res.ok) {
      const detail = body && body.detail ? body.detail : `Request failed (HTTP ${res.status}).`;
      showError(detail);
      return;
    }

    renderResult(body);
  } catch (err) {
    showError("Could not reach the API. Is the server running?");
  } finally {
    setLoading(false);
  }
}

function updateCharCount() {
  els.charCount.textContent = `${els.textarea.value.length} / 8000`;
}

async function checkHealth() {
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

async function loadSamples() {
  try {
    const res = await fetch(`${API_BASE}/data/sample_tickets.json`);
    if (!res.ok) return;
    const samples = await res.json();
    samples
      .filter((s) => s.text && s.text.trim())
      .forEach((s, i) => {
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
