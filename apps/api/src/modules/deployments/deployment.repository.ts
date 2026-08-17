import type { Deployment, Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import type {
  CreateDeploymentInput,
  DeploymentListFilters,
  TerminateDeploymentInput,
  UpdateDeploymentInput,
} from './deployment.types.js';
import { parseSortParam } from './deployment.mapper.js';

const deploymentInclude = {
  candidate: { select: { id: true, firstName: true, lastName: true } },
  client: { select: { id: true, name: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true } },
  requestedBy: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.DeploymentInclude;

export type DeploymentRecord = Prisma.DeploymentGetPayload<{
  include: typeof deploymentInclude;
}>;

export class DeploymentRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  create(
    organizationId: number,
    createdById: number,
    data: CreateDeploymentInput,
  ): Promise<DeploymentRecord> {
    const activateNow =
      data.activateNow === true ||
      (data.billingRate != null && data.billingRate > 0 && Boolean(data.startDate));
    const status = data.status ?? (activateNow ? 'ACTIVE' : 'PENDING');

    return this.prisma.deployment.create({
      data: {
        organizationId: BigInt(organizationId),
        candidateId: BigInt(data.candidateId),
        clientId: BigInt(data.clientId),
        createdById: BigInt(createdById),
        requestedById:
          data.requestedById != null ? BigInt(data.requestedById) : undefined,
        status,
        placementType: data.placementType,
        roleTitle: data.roleTitle,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        billingRate: data.billingRate,
        candidatePayRate: data.candidatePayRate,
        grossMarginPerHour: data.grossMarginPerHour,
        expectedHoursPerWeek: data.expectedHoursPerWeek,
        currency: data.currency,
        workLocation: data.workLocation,
        timezone: data.timezone,
        reportingManagerName: data.reportingManagerName,
        reportingManagerEmail: data.reportingManagerEmail,
        notes: data.notes,
      },
      include: deploymentInclude,
    });
  }

  findById(organizationId: number, id: number): Promise<DeploymentRecord | null> {
    return this.prisma.deployment.findFirst({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      include: deploymentInclude,
    });
  }

  update(
    organizationId: number,
    id: number,
    data: UpdateDeploymentInput,
  ): Promise<DeploymentRecord> {
    return this.prisma.deployment.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        ...(data.candidateId !== undefined && {
          candidateId: BigInt(data.candidateId),
        }),
        ...(data.clientId !== undefined && { clientId: BigInt(data.clientId) }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.placementType !== undefined && {
          placementType: data.placementType,
        }),
        ...(data.roleTitle !== undefined && { roleTitle: data.roleTitle }),
        ...(data.startDate !== undefined && {
          startDate: data.startDate ? new Date(data.startDate) : null,
        }),
        ...(data.endDate !== undefined && {
          endDate: data.endDate ? new Date(data.endDate) : null,
        }),
        ...(data.billingRate !== undefined && { billingRate: data.billingRate }),
        ...(data.candidatePayRate !== undefined && {
          candidatePayRate: data.candidatePayRate,
        }),
        ...(data.grossMarginPerHour !== undefined && {
          grossMarginPerHour: data.grossMarginPerHour,
        }),
        ...(data.expectedHoursPerWeek !== undefined && {
          expectedHoursPerWeek: data.expectedHoursPerWeek,
        }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.workLocation !== undefined && { workLocation: data.workLocation }),
        ...(data.timezone !== undefined && { timezone: data.timezone }),
        ...(data.reportingManagerName !== undefined && {
          reportingManagerName: data.reportingManagerName,
        }),
        ...(data.reportingManagerEmail !== undefined && {
          reportingManagerEmail: data.reportingManagerEmail,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: deploymentInclude,
    });
  }

  findByCandidateClientAndStatuses(
    organizationId: number,
    candidateId: number,
    clientId: number,
    statuses: Deployment['status'][],
  ): Promise<DeploymentRecord | null> {
    return this.prisma.deployment.findFirst({
      where: {
        organizationId: BigInt(organizationId),
        candidateId: BigInt(candidateId),
        clientId: BigInt(clientId),
        deletedAt: null,
        status: { in: statuses },
      },
      include: deploymentInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  activate(organizationId: number, id: number): Promise<DeploymentRecord> {
    return this.prisma.deployment.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        status: 'ACTIVE',
        startDate: new Date(),
        terminatedAt: null,
        terminateReason: null,
      },
      include: deploymentInclude,
    });
  }

  terminate(
    organizationId: number,
    id: number,
    input: TerminateDeploymentInput,
  ): Promise<DeploymentRecord> {
    return this.prisma.deployment.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        status: 'TERMINATED',
        terminatedAt: new Date(),
        terminateReason: input.reason ?? null,
      },
      include: deploymentInclude,
    });
  }

  softDelete(organizationId: number, id: number): Promise<Deployment> {
    return this.prisma.deployment.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: { deletedAt: new Date() },
    });
  }

  async findMany(filters: DeploymentListFilters): Promise<{
    items: DeploymentRecord[];
    total: number;
  }> {
    const where = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.prisma.deployment.findMany({
        where,
        include: deploymentInclude,
        orderBy: parseSortParam(filters.sort),
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.deployment.count({ where }),
    ]);

    return { items, total };
  }

  candidateExists(organizationId: number, candidateId: number): Promise<boolean> {
    return this.prisma.candidate
      .findFirst({
        where: {
          id: BigInt(candidateId),
          organizationId: BigInt(organizationId),
          deletedAt: null,
        },
        select: { id: true },
      })
      .then(Boolean);
  }

  clientExists(organizationId: number, clientId: number): Promise<boolean> {
    return this.prisma.client
      .findFirst({
        where: {
          id: BigInt(clientId),
          organizationId: BigInt(organizationId),
          deletedAt: null,
        },
        select: { id: true },
      })
      .then(Boolean);
  }

  private buildWhereClause(
    filters: DeploymentListFilters,
  ): Prisma.DeploymentWhereInput {
    const where: Prisma.DeploymentWhereInput = {
      organizationId: BigInt(filters.organizationId),
      deletedAt: null,
    };

    if (filters.candidateId) {
      where.candidateId = BigInt(filters.candidateId);
    }

    if (filters.clientId) {
      where.clientId = BigInt(filters.clientId);
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.placementType) {
      where.placementType = filters.placementType;
    }

    const search = filters.search?.trim();
    if (search) {
      where.OR = [
        { roleTitle: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { candidate: { firstName: { contains: search, mode: 'insensitive' } } },
        { candidate: { lastName: { contains: search, mode: 'insensitive' } } },
        { candidate: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }
}
