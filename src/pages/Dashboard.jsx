import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate:
      new Date()
        .toISOString()
        .split("T")[0],
  });

  const token =
    localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  // =========================
  // GET TASKS
  // =========================

  const fetchTasks = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:5001/api/tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks(response.data);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // ADD TASK
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.dueDate) {
      alert(
        "Task title and due date are required"
      );

      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5001/api/tasks",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks([
        response.data,
        ...tasks,
      ]);

      setForm({
        title: "",
        description: "",
        priority: "medium",
        dueDate:
          new Date()
            .toISOString()
            .split("T")[0],
      });

      setShowForm(false);

      alert("Task added successfully!");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to add task"
      );
    }
  };

  // =========================
  // TOGGLE TASK
  // =========================

  const toggleTask = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:5001/api/tasks/${id}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks(
        tasks.map((task) =>
          task._id === id
            ? response.data
            : task
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update task"
      );
    }
  };

  // =========================
  // DELETE TASK
  // =========================

  const deleteTask = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this task?"
      );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5001/api/tasks/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks(
        tasks.filter(
          (task) => task._id !== id
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete task"
      );
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =========================
  // STATISTICS
  // =========================

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = tasks.filter(
    (task) => !task.completed
  ).length;

  return (
    <div className="dashboard-container">

      {/* NAVBAR */}

      <nav className="dashboard-navbar">

        <h2>Task Manager</h2>

        <div className="navbar-right">

          <span>
            Hi, {user.name || "User"} 👋
          </span>

          <button onClick={logout}>
            Logout
          </button>

        </div>

      </nav>

      {/* MAIN */}

      <main className="dashboard-main">

        {/* HEADER */}

        <div className="dashboard-header">

          <div>
            <h1>My Tasks</h1>

            <p>
              Organize your work and stay productive.
            </p>
          </div>

          <button
            className="add-btn"
            onClick={() =>
              setShowForm(!showForm)
            }
          >
            {showForm
              ? "Close"
              : "+ Add Task"}
          </button>

        </div>

        {/* STATISTICS */}

        <div className="summary-cards">

          <div className="summary-card">
            <h3>Total Tasks</h3>
            <h2>{totalTasks}</h2>
          </div>

          <div className="summary-card completed-card">
            <h3>Completed</h3>
            <h2>{completedTasks}</h2>
          </div>

          <div className="summary-card pending-card">
            <h3>Pending</h3>
            <h2>{pendingTasks}</h2>
          </div>

        </div>

        {/* ADD TASK FORM */}

        {showForm && (
          <div className="task-form">

            <h2>Create New Task</h2>

            <form onSubmit={handleSubmit}>

              <input
                type="text"
                name="title"
                placeholder="Task title"
                value={form.title}
                onChange={handleChange}
              />

              <textarea
                name="description"
                placeholder="Task description"
                value={form.description}
                onChange={handleChange}
              />

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="low">
                  Low Priority
                </option>

                <option value="medium">
                  Medium Priority
                </option>

                <option value="high">
                  High Priority
                </option>
              </select>

              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
              />

              <button type="submit">
                Create Task
              </button>

            </form>

          </div>
        )}

        {/* TASK LIST */}

        <div className="tasks-section">

          <h2>Tasks</h2>

          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <div className="empty-state">

              <h3>
                No tasks yet
              </h3>

              <p>
                Create your first task to get started.
              </p>

            </div>
          ) : (
            <div className="task-list">

              {tasks.map((task) => (

                <div
                  className={`task-item ${
                    task.completed
                      ? "completed"
                      : ""
                  }`}
                  key={task._id}
                >

                  <div className="task-left">

                    <button
                      className="check-btn"
                      onClick={() =>
                        toggleTask(task._id)
                      }
                    >
                      {task.completed
                        ? "✓"
                        : ""}
                    </button>

                    <div className="task-info">

                      <h3>
                        {task.title}
                      </h3>

                      {task.description && (
                        <p>
                          {task.description}
                        </p>
                      )}

                      <div className="task-meta">

                        <span
                          className={`priority ${task.priority}`}
                        >
                          {task.priority}
                        </span>

                        <span>
                          Due:{" "}
                          {new Date(
                            task.dueDate
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteTask(task._id)
                    }
                  >
                    Delete
                  </button>

                </div>

              ))}

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;