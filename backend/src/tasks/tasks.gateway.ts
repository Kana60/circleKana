import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';

export interface TaskStatusChangedPayload {
  id: string;
  status: TaskStatus;
  timestamp: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TasksGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TasksGateway.name);

  afterInit() {
    this.logger.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitTaskStatusChanged(payload: TaskStatusChangedPayload) {
    this.server.emit('task:statusChanged', payload);
  }

  emitTaskCreated(task: object) {
    this.server.emit('task:created', task);
  }

  emitTaskDeleted(taskId: string) {
    this.server.emit('task:deleted', { id: taskId, timestamp: new Date().toISOString() });
  }

  emitTaskUpdated(task: object) {
    this.server.emit('task:updated', task);
  }
}
