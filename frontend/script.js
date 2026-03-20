// ─────────────────────────────────────────
//  Configuration
// ─────────────────────────────────────────

const API_BASE = "https://vidyut-task-manager-app.onrender.com";  // Flask backend URL

// ─────────────────────────────────────────
//  State
// ─────────────────────────────────────────

let allTasks   = [];          // Master list fetched from the API
let activeFilter = "all";     // "all" | "pending" | "done"

// ─────────────────────────────────────────
//  API Helpers
// ─────────────────────────────────────────

/**
 * Fetch all tasks from the backend and refresh the UI.
 */
async function loadTasks() {
  showLoading(true);
  try {
    const res  = await fetch(`${API_BASE}/tasks`);
    allTasks   = await res.json();
    renderTasks();
    updateStats();
  } catch (err) {
    showToast("⚠ Could not connect to backend. Is Flask running?", "error");
  } finally {
    showLoading(false);
  }
}

/**
 * Create a new task via POST /tasks.
 * Called by the "Add Task" button in the HTML.
 */
async function addTask() {
  const titleEl = document.getElementById("task-title");
  const descEl  = document.getElementById("task-desc");

  const title       = titleEl.value.trim();
  const description = descEl.value.trim();

  // Client-side validation (mirrors backend validation)
  if (!title) {
    showError("Title is required");
    titleEl.focus();
    return;
  }
  hideError();

  try {
    const res  = await fetch(`${API_BASE}/tasks`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ title, description }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Show error returned by the backend (e.g. "Title is required")
      showError(data.error || "Failed to create task");
      return;
    }

    // Success: clear inputs, reload tasks, show toast
    titleEl.value = "";
    descEl.value  = "";
    allTasks.unshift(data);   // Add to top of local list
    renderTasks();
    updateStats();
    showToast("✦ Task added!", "success");
  } catch (err) {
    showError("Could not reach the server.");
  }
}

/**
 * Toggle a task's status (pending ↔ completed).
 * @param {number} id     - Task ID
 * @param {boolean} current - Current status value
 */
async function toggleTask(id, current) {
  try {
    const res  = await fetch(`${API_BASE}/tasks/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: !current }),
    });

    if (!res.ok) {
      showToast("Failed to update task", "error");
      return;
    }

    const updated = await res.json();

    // Update the task in the local list without a full re-fetch
    const idx = allTasks.findIndex(t => t.id === id);
    if (idx !== -1) allTasks[idx] = updated;

    renderTasks();
    updateStats();
    showToast(updated.status ? "✓ Marked complete!" : "↺ Marked pending", "success");
  } catch (err) {
    showToast("Could not reach the server.", "error");
  }
}

/**
 * Delete a task permanently.
 * @param {number} id - Task ID
 */
async function deleteTask(id) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });

    if (!res.ok) {
      showToast("Failed to delete task", "error");
      return;
    }

    // Remove from local list
    allTasks = allTasks.filter(t => t.id !== id);
    renderTasks();
    updateStats();
    showToast("🗑 Task deleted", "success");
  } catch (err) {
    showToast("Could not reach the server.", "error");
  }
}

// ─────────────────────────────────────────
//  Filter
// ─────────────────────────────────────────

/**
 * Set the active filter tab and re-render.
 * @param {"all"|"pending"|"done"} filter
 */
function setFilter(filter) {
  activeFilter = filter;

  // Update tab styles
  document.querySelectorAll(".tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });

  renderTasks();
}

/**
 * Return the subset of tasks that match the active filter.
 */
function filteredTasks() {
  if (activeFilter === "pending") return allTasks.filter(t => !t.status);
  if (activeFilter === "done")    return allTasks.filter(t =>  t.status);
  return allTasks;
}

// ─────────────────────────────────────────
//  Rendering
// ─────────────────────────────────────────

/**
 * Re-render the task list from the current local state.
 */
function renderTasks() {
  const list   = document.getElementById("task-list");
  const empty  = document.getElementById("empty-state");
  const tasks  = filteredTasks();

  list.innerHTML = "";

  if (tasks.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  tasks.forEach((task, i) => {
    const card = buildCard(task, i);
    list.appendChild(card);
  });
}

/**
 * Build a task card DOM element.
 * @param {Object} task
 * @param {number} index - Used for staggered animation delay
 * @returns {HTMLElement}
 */
function buildCard(task, index) {
  const card = document.createElement("div");
  card.className = `task-card ${task.status ? "done" : ""}`;
  card.style.animationDelay = `${index * 0.04}s`;

  const date = new Date(task.created_at + "Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });

  const statusLabel = task.status ? "Complete" : "Pending";
  const statusClass = task.status ? "complete" : "pending";
  const toggleLabel = task.status ? "↺ Undo"   : "✓ Done";

  // Description block (only shown if there's a description)
  const descHTML = task.description
    ? `<p class="task-desc">${escapeHTML(task.description)}</p>`
    : "";

  card.innerHTML = `
    <div class="card-body">
      <div class="task-title">${escapeHTML(task.title)}</div>
      ${descHTML}
      <div class="task-meta">
        <span class="status-badge ${statusClass}">${statusLabel}</span>
        <span>· ${date}</span>
      </div>
    </div>
    <div class="card-actions">
      <button class="btn-toggle" onclick="toggleTask(${task.id}, ${task.status})">
        ${toggleLabel}
      </button>
      <button class="btn-delete" onclick="deleteTask(${task.id})">
        🗑 Delete
      </button>
    </div>
  `;

  return card;
}

// ─────────────────────────────────────────
//  Stats Bar
// ─────────────────────────────────────────

function updateStats() {
  const total = allTasks.length;
  const done  = allTasks.filter(t => t.status).length;
  document.getElementById("stat-total").textContent = `${total} task${total !== 1 ? "s" : ""}`;
  document.getElementById("stat-done").textContent  = `${done} done`;
}

// ─────────────────────────────────────────
//  UI Utilities
// ─────────────────────────────────────────

function showLoading(visible) {
  document.getElementById("loading").classList.toggle("hidden", !visible);
}

function showError(msg) {
  const box  = document.getElementById("error-msg");
  const text = document.getElementById("error-text");
  text.textContent = msg;
  box.classList.remove("hidden");
}

function hideError() {
  document.getElementById("error-msg").classList.add("hidden");
}

/** Display a temporary toast notification. */
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className   = `toast ${type}`;
  toast.classList.remove("hidden");

  // Auto-hide after 2.5 s
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add("hidden"), 2500);
}

/** Prevent XSS by escaping HTML special characters. */
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─────────────────────────────────────────
//  Keyboard Shortcut — press Enter in title field to add
// ─────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("task-title").addEventListener("keydown", e => {
    if (e.key === "Enter") addTask();
  });

  // Load tasks on page start
  loadTasks();
});
