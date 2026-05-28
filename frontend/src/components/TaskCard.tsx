import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';

const STATUS_NEXT: Record<TaskStatus, TaskStatus | null> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: null,
};

const STATUS_PREV: Record<TaskStatus, TaskStatus | null> = {
  TODO: null,
  IN_PROGRESS: 'TODO',
  DONE: 'IN_PROGRESS',
};

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

const TaskCard = ({ task, onStatusChange, onDelete }: TaskCardProps) => {
  const next = STATUS_NEXT[task.status];
  const prev = STATUS_PREV[task.status];

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>{task.title}</span>
        <button style={styles.deleteBtn} onClick={() => onDelete(task.id)} title="Delete">✕</button>
      </div>
      {task.description && <p style={styles.desc}>{task.description}</p>}
      <div style={styles.actions}>
        {prev && (
          <button style={styles.btnSecondary} onClick={() => onStatusChange(task.id, prev)}>
            ← {prev.replace('_', ' ')}
          </button>
        )}
        {next && (
          <button style={styles.btnPrimary} onClick={() => onStatusChange(task.id, next)}>
            {next.replace('_', ' ')} →
          </button>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' },
  title: { fontWeight: 600, fontSize: '0.95rem', flex: 1 },
  deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '0.9rem', padding: '0 4px' },
  desc: { fontSize: '0.82rem', color: '#6b7280', margin: '0.3rem 0 0.5rem' },
  actions: { display: 'flex', gap: '0.4rem', marginTop: '0.5rem' },
  btnPrimary: { padding: '0.3rem 0.6rem', fontSize: '0.78rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnSecondary: { padding: '0.3rem 0.6rem', fontSize: '0.78rem', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' },
};

export default TaskCard;
