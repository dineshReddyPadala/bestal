import type { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import { parseSortParam, type CareerOpeningRecord } from './career-opening.mapper.js';
import type {
  CareerOpeningListFilters,
  CreateCareerOpeningInput,
  UpdateCareerOpeningInput,
} from './career-opening.types.js';

export class CareerOpeningRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  create(organizationId: number, data: CreateCareerOpeningInput): Promise<CareerOpeningRecord> {
    return this.prisma.careerOpening.create({
      data: {
        organizationId: BigInt(organizationId),
        title: data.title,
        slug: data.slug,
        skillCommunity: data.skillCommunity,
        location: data.location,
        remote: data.remote,
        jobLevel: data.jobLevel,
        experience: data.experience,
        aboutRole: data.aboutRole,
        responsibilities: data.responsibilities,
        requirements: data.requirements,
        status: data.status,
        publishedAt: data.publishedAt,
      },
    });
  }

  findById(organizationId: number, id: number): Promise<CareerOpeningRecord | null> {
    return this.prisma.careerOpening.findFirst({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
    });
  }

  findBySlug(slug: string, excludeId?: number): Promise<{ id: bigint } | null> {
    return this.prisma.careerOpening.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: BigInt(excludeId) } } : {}),
      },
      select: { id: true },
    });
  }

  findPublished(organizationId: number): Promise<CareerOpeningRecord[]> {
    return this.prisma.careerOpening.findMany({
      where: {
        organizationId: BigInt(organizationId),
        status: 'PUBLISHED',
        deletedAt: null,
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findMany(filters: CareerOpeningListFilters): Promise<{ items: CareerOpeningRecord[]; total: number }> {
    const where: Prisma.CareerOpeningWhereInput = {
      organizationId: BigInt(filters.organizationId),
      deletedAt: null,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { skillCommunity: { contains: filters.search, mode: 'insensitive' } },
              { location: { contains: filters.search, mode: 'insensitive' } },
              { jobLevel: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy = parseSortParam(filters.sort).map(({ field, direction }) => ({
      [field]: direction,
    })) as Prisma.CareerOpeningOrderByWithRelationInput[];

    const skip = (filters.page - 1) * filters.limit;

    return Promise.all([
      this.prisma.careerOpening.findMany({
        where,
        orderBy,
        skip,
        take: filters.limit,
      }),
      this.prisma.careerOpening.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  update(
    organizationId: number,
    id: number,
    data: UpdateCareerOpeningInput,
  ): Promise<CareerOpeningRecord> {
    return this.prisma.careerOpening.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.skillCommunity !== undefined ? { skillCommunity: data.skillCommunity } : {}),
        ...(data.location !== undefined ? { location: data.location } : {}),
        ...(data.remote !== undefined ? { remote: data.remote } : {}),
        ...(data.jobLevel !== undefined ? { jobLevel: data.jobLevel } : {}),
        ...(data.experience !== undefined ? { experience: data.experience } : {}),
        ...(data.aboutRole !== undefined ? { aboutRole: data.aboutRole } : {}),
        ...(data.responsibilities !== undefined ? { responsibilities: data.responsibilities } : {}),
        ...(data.requirements !== undefined ? { requirements: data.requirements } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.publishedAt !== undefined ? { publishedAt: data.publishedAt } : {}),
      },
    });
  }

  softDelete(organizationId: number, id: number): Promise<CareerOpeningRecord> {
    return this.prisma.careerOpening.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: { deletedAt: new Date() },
    });
  }
}
