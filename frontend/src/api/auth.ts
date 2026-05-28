import api from './axios';
import { AuthResponse } from '../types';

export const register = async (email: string, password: string): Promise<{ message: string }> => {
  const res = await api.post('/auth/register', { email, password });
  return res.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};
