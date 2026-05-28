import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Task, TaskStatusChangedEvent } from '../types';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface UseSocketOptions {
  onTaskStatusChanged?: (payload: TaskStatusChangedEvent) => void;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (payload: { id: string }) => void;
}

export const useSocket = (options: UseSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('task:statusChanged', (payload: TaskStatusChangedEvent) => {
      options.onTaskStatusChanged?.(payload);
    });

    socket.on('task:created', (task: Task) => {
      options.onTaskCreated?.(task);
    });

    socket.on('task:updated', (task: Task) => {
      options.onTaskUpdated?.(task);
    });

    socket.on('task:deleted', (payload: { id: string }) => {
      options.onTaskDeleted?.(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
};
