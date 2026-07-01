import type { PrismaClient } from '@prisma/client';
import type { IBaseRepository } from '../interfaces/index.js';

export abstract class BaseRepository implements IBaseRepository {
  constructor(protected readonly prisma: PrismaClient) {}

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
