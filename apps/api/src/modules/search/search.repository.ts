import type { PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';

export type CandidateSearchRow = {
  id: bigint;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: Date;
};

export type ClientSearchRow = {
  id: bigint;
  name: string;
  industry: string | null;
  status: string;
  createdAt: Date;
};

export type DeploymentSearchRow = {
  id: bigint;
  roleTitle: string;
  status: string;
  createdAt: Date;
  candidate: { firstName: string; lastName: string };
  client: { name: string };
};

export type EvaluationSearchRow = {
  id: bigint;
  evaluatorName: string;
  evaluationType: string | null;
  recommendation: string | null;
  createdAt: Date;
  candidate: { firstName: string; lastName: string };
};

export class SearchRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  searchCandidates(
    organizationId: number,
    term: string,
  ): Promise<CandidateSearchRow[]> {
    return this.prisma.candidate.findMany({
      where: {
        organizationId: BigInt(organizationId),
        deletedAt: null,
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          { headline: { contains: term, mode: 'insensitive' } },
          { location: { contains: term, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  searchClients(organizationId: number, term: string): Promise<ClientSearchRow[]> {
    return this.prisma.client.findMany({
      where: {
        organizationId: BigInt(organizationId),
        deletedAt: null,
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { industry: { contains: term, mode: 'insensitive' } },
          { contactEmail: { contains: term, mode: 'insensitive' } },
          { city: { contains: term, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        industry: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  searchDeployments(
    organizationId: number,
    term: string,
  ): Promise<DeploymentSearchRow[]> {
    return this.prisma.deployment.findMany({
      where: {
        organizationId: BigInt(organizationId),
        deletedAt: null,
        OR: [
          { roleTitle: { contains: term, mode: 'insensitive' } },
          { workLocation: { contains: term, mode: 'insensitive' } },
          { notes: { contains: term, mode: 'insensitive' } },
          {
            candidate: {
              OR: [
                { firstName: { contains: term, mode: 'insensitive' } },
                { lastName: { contains: term, mode: 'insensitive' } },
              ],
            },
          },
          { client: { name: { contains: term, mode: 'insensitive' } } },
        ],
      },
      select: {
        id: true,
        roleTitle: true,
        status: true,
        createdAt: true,
        candidate: { select: { firstName: true, lastName: true } },
        client: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  searchEvaluations(
    organizationId: number,
    term: string,
  ): Promise<EvaluationSearchRow[]> {
    return this.prisma.evaluation.findMany({
      where: {
        organizationId: BigInt(organizationId),
        deletedAt: null,
        OR: [
          { evaluatorName: { contains: term, mode: 'insensitive' } },
          { evaluatorCompany: { contains: term, mode: 'insensitive' } },
          { evaluationType: { contains: term, mode: 'insensitive' } },
          { recommendation: { contains: term, mode: 'insensitive' } },
          { evaluatorComments: { contains: term, mode: 'insensitive' } },
          { aiEvaluationSummary: { contains: term, mode: 'insensitive' } },
          {
            candidate: {
              OR: [
                { firstName: { contains: term, mode: 'insensitive' } },
                { lastName: { contains: term, mode: 'insensitive' } },
              ],
            },
          },
        ],
      },
      select: {
        id: true,
        evaluatorName: true,
        evaluationType: true,
        recommendation: true,
        createdAt: true,
        candidate: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
