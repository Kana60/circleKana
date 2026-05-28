import React, { useState } from 'react';

interface CreateTaskModalProps {
  onClose: () => void;
  onCreate: (title: string, description?: string) => void;
}

const CreateTaskModal = ({ onClose, onCreate }: CreateTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    onCreate(title.trim(), description.trim() || undefined);
    onClose();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3 style={{ marginBottom: '1rem' }}>New Task</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <input
            style={input}
            placeholder="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <textarea
            style={{ ...input, resize: 'vertical', minHeight: '60px' }}
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {error && <p style={{ color: '#dc2626', fontSize: '0.82rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
            <button type="submit" style={btnPrimary}>Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modal: React.CSSProperties = { background: '#fff', padding: '1.5rem', borderRadius: '8px', width: '360px' };
const input: React.CSSProperties = { padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' };
const btnPrimary: React.CSSProperties = { padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const btnSecondary: React.CSSProperties = { padding: '0.5rem 1rem', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' };

export default CreateTaskModal;
