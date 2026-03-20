from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

# ─────────────────────────────────────────
#  App Initialization
# ─────────────────────────────────────────
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the frontend

# ─────────────────────────────────────────
#  In-Memory Storage
# ─────────────────────────────────────────
tasks = []          # List to store all task dictionaries
next_id = 1         # Auto-incrementing ID counter


def find_task(task_id):
    """Helper: Return (index, task) if found, else (None, None)."""
    for i, task in enumerate(tasks):
        if task["id"] == task_id:
            return i, task
    return None, None


# ─────────────────────────────────────────
#  Routes
# ─────────────────────────────────────────
# ─────────────────────────────────────────
#  Routes
# ─────────────────────────────────────────

@app.route("/")
def home():
    return {
        "message": "Task Manager API is running 🚀",
        "usage": {
            "GET all tasks": "/tasks",
            "POST create task": "/tasks",
            "PUT update task": "/tasks/<id>",
            "DELETE task": "/tasks/<id>"
        }
    }


@app.route("/tasks", methods=["GET"])
def get_tasks():
    """
    GET /tasks
    Returns all tasks sorted by creation time (newest first).
    """
    sorted_tasks = sorted(tasks, key=lambda t: t["created_at"], reverse=True)
    return jsonify(sorted_tasks), 200


@app.route("/tasks", methods=["POST"])
def create_task():
    """
    POST /tasks
    Body: { "title": "...", "description": "..." }
    Creates a new task. Title is required.
    """
    global next_id
    data = request.get_json()

    # ── Validation ──────────────────────────
    if not data or not data.get("title", "").strip():
        return jsonify({"error": "Title is required"}), 400

    # ── Build task object ───────────────────
    task = {
        "id":          next_id,
        "title":       data["title"].strip(),
        "description": data.get("description", "").strip(),
        "status":      False,                          # False = pending, True = completed
        "created_at":  datetime.utcnow().isoformat()   # ISO-8601 UTC timestamp
    }

    tasks.append(task)
    next_id += 1

    return jsonify(task), 201


@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    """
    PUT /tasks/<id>
    Body: { "title": "...", "description": "...", "status": true/false }
    Updates one or more fields of an existing task.
    """
    index, task = find_task(task_id)

    if task is None:
        return jsonify({"error": "Task not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # ── Apply updates (only fields that are present) ──
    if "title" in data:
        if not data["title"].strip():
            return jsonify({"error": "Title is required"}), 400
        task["title"] = data["title"].strip()

    if "description" in data:
        task["description"] = data["description"].strip()

    if "status" in data:
        task["status"] = bool(data["status"])

    tasks[index] = task
    return jsonify(task), 200


@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    """
    DELETE /tasks/<id>
    Removes the task with the given ID.
    """
    index, task = find_task(task_id)

    if task is None:
        return jsonify({"error": "Task not found"}), 404

    tasks.pop(index)
    return jsonify({"message": f"Task {task_id} deleted successfully"}), 200


# ─────────────────────────────────────────
#  Entry Point
# ─────────────────────────────────────────
if __name__ == "__main__":
    import os

    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Task Manager API running on port {port}")

    app.run(host="0.0.0.0", port=port)
