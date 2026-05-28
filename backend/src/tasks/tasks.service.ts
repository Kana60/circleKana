import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksGateway } from './tasks.gateway';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: TasksGateway,
  ) {}

  async findAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: { ...dto, userId },
    });
    this.gateway.emitTaskCreated(task);
    return task;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.findOneOrFail(userId, taskId);

    const updated = await this.prisma.task.update({
      where: { id: task.id },
      data: dto,
    });

    if (dto.status && dto.status !== task.status) {
      this.gateway.emitTaskStatusChanged({
        id: updated.id,
        status: updated.status,
        timestamp: new Date().toISOString(),
      });
    } else {
      this.gateway.emitTaskUpdated(updated);
    }

    return updated;
  }

  async remove(userId: string, taskId: string) {
    const task = await this.findOneOrFail(userId, taskId);
    await this.prisma.task.delete({ where: { id: task.id } });
    this.gateway.emitTaskDeleted(task.id);
    return { message: 'Task deleted' };
  }

  private async findOneOrFail(userId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException('Access denied');
    return task;
  }
}
