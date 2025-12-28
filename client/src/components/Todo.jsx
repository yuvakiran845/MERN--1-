import { useState, useEffect } from "react";
import "./Todo.css";

function Todo() {
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("All");
  const [darkMode, setDarkMode] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  /* ---------- DARK MODE ---------- */
  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  /* ---------- FETCH TODOS ---------- */
  const fetchTodos = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTodos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch todos failed", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [API_URL]);

  const addTask = async () => {
    if (!task.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, priority, dueDate }), // ✅ use 'task' not 'text'
      });

      if (!res.ok) throw new Error("Failed to add task");

      await fetchTodos(); // refresh the list from MongoDB

      // reset input fields
      setTask("");
      setPriority("Medium");
      setDueDate("");
    } catch (err) {
      console.error(err);
      alert("Error adding task");
    }
  };

  /* ---------- DELETE TASK ---------- */
  const deleteTask = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t._id !== id));
  };

  /* ---------- TOGGLE TASK ---------- */
  const toggleTask = async (id, completed) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });

    const updatedTodo = await res.json();

    setTodos((prev) => prev.map((t) => (t._id === id ? updatedTodo : t)));
  };

  /* ---------- MOVE ---------- */
  const moveUp = (index) => {
    if (index === 0) return;
    const newTodos = [...todos];
    [newTodos[index - 1], newTodos[index]] = [
      newTodos[index],
      newTodos[index - 1],
    ];
    setTodos(newTodos);
  };

  const moveDown = (index) => {
    if (index === todos.length - 1) return;
    const newTodos = [...todos];
    [newTodos[index + 1], newTodos[index]] = [
      newTodos[index],
      newTodos[index + 1],
    ];
    setTodos(newTodos);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addTask();
  };

  /* ---------- FILTER ---------- */
  const filteredTodos = todos.filter((t) => {
    if (filter === "Completed") return t.completed;
    if (filter === "Pending") return !t.completed;
    return true;
  });

  /* ---------- UI ---------- */
  return (
    <div className={darkMode ? "todo-container dark" : "todo-container"}>
      <h2>To-Do App</h2>

      <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      <div className="task-inputs">
        <input
          type="text"
          placeholder="Enter task..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <button onClick={addTask}>Add</button>
      </div>

      <div className="filters">
        <button onClick={() => setFilter("All")}>All</button>
        <button onClick={() => setFilter("Completed")}>Completed</button>
        <button onClick={() => setFilter("Pending")}>Pending</button>
      </div>

      <ol>
        {filteredTodos.map((t, index) => (
          <li key={t._id} className={t.completed ? "completed" : ""}>
            <div className="task-details">
              <span>{t.task}</span> {/* ✅ fixed */}
              <span className={`priority ${t.priority.toLowerCase()}`}>
                {t.priority}
              </span>
              {t.dueDate && <span className="due-date">{t.dueDate}</span>}
            </div>

            <div className="task-buttons">
              <button onClick={() => moveUp(index)}>⬆</button>
              <button onClick={() => moveDown(index)}>⬇</button>
              <button onClick={() => toggleTask(t._id, t.completed)}>
                {t.completed ? "↺" : "✔"}
              </button>
              <button onClick={() => deleteTask(t._id)}>❌</button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Todo;
