import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { Task, TaskStatus, TaskStatusChangedEvent } from '../types';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'TODO', label: 'To Do', color: '#f59e0b' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6' },
  { status: 'DONE', label: 'Done', color: '#10b981' },
];

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useSocket({
    onTaskStatusChanged: useCallback((payload: TaskStatusChangedEvent) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === payload.id ? { ...t, status: payload.status } : t)),
      );
    }, []),
    onTaskCreated: useCallback((task: Task) => {
      setTasks((prev) => {
        if (prev.find((t) => t.id === task.id)) return prev;
        return [task, ...prev];
      });
    }, []),
    onTaskUpdated: useCallback((task: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    }, []),
    onTaskDeleted: useCallback((payload: { id: string }) => {
      setTasks((prev) => prev.filter((t) => t.id !== payload.id));
    }, []),
  });

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      await updateTask(id, { status });
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
    } catch {}
  };

  const handleCreate = async (title: string, description?: string) => {
    try {
      await createTask(title, description);
    } catch {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tasksByStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.brand}>OpKit</span>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={styles.btnAdd} onClick={() => setShowModal(true)}>+ New Task</button>
          <button style={styles.btnLogout} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {loading ? (
        <p style={{ padding: '2rem', textAlign: 'center' }}>Loading tasks...</p>
      ) : (
        <div style={styles.board}>
          {COLUMNS.map(({ status, label, color }) => (
            <div key={status} style={styles.column}>
              <div style={{ ...styles.columnHeader, borderTop: `3px solid ${color}` }}>
                <span style={styles.columnTitle}>{label}</span>
                <span style={{ ...styles.badge, background: color }}>{tasksByStatus(status).length}</span>
              </div>
              <div style={styles.columnBody}>
                {tasksByStatus(status).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
                {tasksByStatus(status).length === 0 && (
                  <p style={styles.empty}>No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateTaskModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f3f4f6', fontFamily: 'system-ui, sans-serif' },
  header: { background: '#1e293b', color: '#fff', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.05em' },
  btnAdd: { padding: '0.45rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
  btnLogout: { padding: '0.45rem 1rem', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
  board: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' },
  column: { background: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', minHeight: '400px' },
  columnHeader: { padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px 8px 0 0' },
  columnTitle: { fontWeight: 600, fontSize: '0.95rem', color: '#374151' },
  badge: { color: '#fff', borderRadius: '12px', padding: '2px 10px', fontSize: '0.78rem', fontWeight: 600 },
  columnBody: { flex: 1, padding: '0.75rem' },
  empty: { color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', marginTop: '1.5rem' },
};

export default TasksPage;
