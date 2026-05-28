import api from './axios';
import { Task, TaskStatus } from '../types';

export const getTasks = async (): Promise<Task[]> => {
  const res = await api.get('/tasks');
  return res.data;
};

export const createTask = async (title: string, description?: string): Promise<Task> => {
  const res = await api.post('/tasks', { title, description });
  return res.data;
};

export const updateTask = async (
  id: string,
  data: { title?: string; description?: string; status?: TaskStatus },
): Promise<Task> => {
  const res = await api.patch(`/tasks/${id}`, data);
  return res.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};
