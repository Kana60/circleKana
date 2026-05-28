import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TasksGateway } from './tasks.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';

const mockTask = {
  id: 'task-1',
  title: 'Test Task',
  description: 'desc',
  status: TaskStatus.TODO,
  userId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrismaService = {
  task: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockGateway = {
  emitTaskCreated: jest.fn(),
  emitTaskStatusChanged: jest.fn(),
  emitTaskUpdated: jest.fn(),
  emitTaskDeleted: jest.fn(),
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TasksGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns tasks for the user', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);
      const result = await service.findAll('user-1');
      expect(result).toEqual([mockTask]);
      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('creates a task and emits event', async () => {
      mockPrismaService.task.create.mockResolvedValue(mockTask);
      const result = await service.create('user-1', { title: 'Test Task', description: 'desc' });
      expect(result).toEqual(mockTask);
      expect(mockGateway.emitTaskCreated).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('update', () => {
    it('updates task and emits statusChanged when status changes', async () => {
      const updated = { ...mockTask, status: TaskStatus.IN_PROGRESS };
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue(updated);

      const result = await service.update('user-1', 'task-1', { status: TaskStatus.IN_PROGRESS });
      expect(result).toEqual(updated);
      expect(mockGateway.emitTaskStatusChanged).toHaveBeenCalledWith({
        id: updated.id,
        status: updated.status,
        timestamp: expect.any(String),
      });
    });

    it('throws NotFoundException when task does not exist', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);
      await expect(service.update('user-1', 'nonexistent', { title: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when task belongs to another user', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({ ...mockTask, userId: 'other-user' });
      await expect(service.update('user-1', 'task-1', { title: 'x' })).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('deletes task and emits event', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.delete.mockResolvedValue(mockTask);

      const result = await service.remove('user-1', 'task-1');
      expect(result).toEqual({ message: 'Task deleted' });
      expect(mockGateway.emitTaskDeleted).toHaveBeenCalledWith('task-1');
    });
  });
});
