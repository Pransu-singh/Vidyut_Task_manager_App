# ✦ TaskFlow — Simple Task Manager

> A clean, full-stack task management application built with **Python (Flask)** on the backend and **vanilla HTML/CSS/JavaScript** on the frontend. Supports full CRUD operations with a polished, responsive UI.

---

 <img width="1919" height="807" alt="image" src="https://github.com/user-attachments/assets/3977494f-623e-485a-9565-814ebc459745" />

---

## ✨ Features

| Feature | Details |
|---|---|
| **Create Tasks** | Add tasks with a title and optional description |
| **View All Tasks** | See all tasks, sorted newest-first |
| **Toggle Complete** | Mark any task as done or undo it with one click |
| **Delete Tasks** | Remove tasks permanently |
| **Input Validation** | Title is required — clear error messages shown |
| **Filter View** | Filter tasks by All / Pending / Done |
| **Live Stats** | Header shows total tasks and completed count |
| **Toast Notifications** | Instant feedback for every action |
| **Keyboard Shortcut** | Press `Enter` in the title field to add a task |
| **Responsive Design** | Works on desktop and mobile |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.x, Flask, Flask-CORS |
| **Storage** | In-memory Python list (no database required) |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Fonts** | Google Fonts — Syne + DM Sans |
| **HTTP Client** | Native `fetch` API |

---

## 📁 Folder Structure

```
task-manager/
│
├── backend/
│   ├── app.py              # Flask REST API
│   └── requirements.txt    # Python dependencies
│
├── frontend/
│   ├── index.html          # Main HTML page
│   ├── style.css           # All styles
│   └── script.js           # API calls & DOM logic
│
└── README.md               # This file
```

---

## ⚙️ Setup Instructions

Follow these steps to get the project running on your machine.

### Prerequisites

- **Python 3.8+** — [Download here](https://www.python.org/downloads/)
- A modern web browser (Chrome, Firefox, Edge, Safari)

---

### Step 1 — Clone or Download the Project

```bash
# If using Git:
git clone https://github.com/your-username/task-manager.git
cd task-manager

# Or simply download and unzip the project folder.
```

---

### Step 2 — Set Up the Backend

```bash
# Navigate to the backend folder
cd backend

# (Recommended) Create a virtual environment
python -m venv venv

# Activate it:
# On macOS / Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

### Step 3 — Run the Backend Server

```bash
# From the backend/ folder:
python app.py
```

You should see:

```
🚀  Task Manager API running at http://127.0.0.1:5000
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

> **Keep this terminal open.** The API must be running for the frontend to work.

---

### Step 4 — Open the Frontend

Open a **new terminal** (or your file explorer), navigate to the `frontend/` folder, and open `index.html` in your browser.

```bash
# macOS
open frontend/index.html

# Linux
xdg-open frontend/index.html

# Windows
start frontend/index.html
```

Or simply double-click `index.html` in your file explorer.

> The frontend will automatically connect to `http://127.0.0.1:5000` and load your tasks.

---

## 📡 API Documentation

Base URL: `http://127.0.0.1:5000`

All request and response bodies use **JSON**.

---

### 1. Get All Tasks

| | |
|---|---|
| **Endpoint** | `/tasks` |
| **Method** | `GET` |
| **Description** | Returns a list of all tasks, sorted newest-first. |

**Request:** No body required.

**Response — 200 OK:**
```json
[
  {
    "id": 2,
    "title": "Write README",
    "description": "Document the project thoroughly",
    "status": true,
    "created_at": "2024-01-15T10:30:00.123456"
  },
  {
    "id": 1,
    "title": "Set up Flask",
    "description": "",
    "status": false,
    "created_at": "2024-01-15T09:00:00.000000"
  }
]
```

---

### 2. Create a Task

| | |
|---|---|
| **Endpoint** | `/tasks` |
| **Method** | `POST` |
| **Description** | Creates a new task. `title` is required. `description` is optional. |

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Response — 201 Created:**
```json
{
  "id": 3,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": false,
  "created_at": "2024-01-15T11:00:00.000000"
}
```

**Response — 400 Bad Request (empty title):**
```json
{
  "error": "Title is required"
}
```

---

### 3. Update a Task

| | |
|---|---|
| **Endpoint** | `/tasks/<id>` |
| **Method** | `PUT` |
| **Description** | Updates one or more fields of an existing task. All body fields are optional. |

**Example — Toggle completion:**
```json
{
  "status": true
}
```

**Example — Update title and description:**
```json
{
  "title": "Buy groceries (updated)",
  "description": "Also need orange juice"
}
```

**Response — 200 OK:**
```json
{
  "id": 3,
  "title": "Buy groceries (updated)",
  "description": "Also need orange juice",
  "status": true,
  "created_at": "2024-01-15T11:00:00.000000"
}
```

**Response — 404 Not Found:**
```json
{
  "error": "Task not found"
}
```

---

### 4. Delete a Task

| | |
|---|---|
| **Endpoint** | `/tasks/<id>` |
| **Method** | `DELETE` |
| **Description** | Permanently removes the task with the given ID. |

**Request:** No body required.

**Response — 200 OK:**
```json
{
  "message": "Task 3 deleted successfully"
}
```

**Response — 404 Not Found:**
```json
{
  "error": "Task not found"
}
```

---

### HTTP Status Codes Summary

| Code | Meaning |
|---|---|
| `200 OK` | Request succeeded |
| `201 Created` | Task successfully created |
| `400 Bad Request` | Validation failed (e.g. missing title) |
| `404 Not Found` | No task with that ID exists |

---

## ✅ Validation Rules

| Field | Rule |
|---|---|
| `title` | **Required.** Cannot be empty or whitespace only. Returns `{"error": "Title is required"}` with HTTP 400 if violated. |
| `description` | Optional. Defaults to an empty string if not provided. |
| `status` | Must be a boolean (`true` / `false`). Defaults to `false` on creation. |

Validation is enforced on **both** the frontend (instant feedback) and the **backend** (authoritative source of truth).

---

## 🔧 Common Issues & Fixes

| Problem | Fix |
|---|---|
| _"Could not connect to backend"_ toast | Make sure `python app.py` is running in the `backend/` folder |
| CORS error in browser console | Ensure `flask-cors` is installed (`pip install flask-cors`) |
| Port 5000 already in use | Change `port=5000` in `app.py` to another port (e.g. `5001`), and update `API_BASE` in `script.js` |
| Tasks reset on server restart | This project uses in-memory storage. Tasks are cleared when Flask restarts — by design. |

---

## 🚀 Possible Extensions

- Add a SQLite or PostgreSQL database for persistent storage
- Add user authentication (login / register)
- Add due dates and priority levels
- Add drag-and-drop reordering
- Deploy backend to Render / Railway and frontend to Netlify / Vercel

---

## 📄 License

MIT — free to use, modify, and distribute.
