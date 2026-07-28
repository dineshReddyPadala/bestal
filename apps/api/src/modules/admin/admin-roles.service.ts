import type { FastifyInstance } from 'fastify';
import type { Prisma, Role } from '@prisma/client';
import { ROLES, type Role as AppRole } from '../../constants/index.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
} from '../../utils/index.js';
import { AuditService } from './audit.service.js';

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

const SYSTEM_ROLE_SEED: Array<{
  code: string;
  name: string;
  description: string;
  portal: string;
  baseRole: Role;
  permissions: string[];
  isProtected: boolean;
}> = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Full platform access including platform settings and user provisioning.',
    portal: 'ADMIN',
    baseRole: 'SUPER_ADMIN',
    permissions: [...ALL_PERMISSIONS],
    isProtected: true,
  },
  {
    code: 'ADMIN',
    name: 'Admin',
    description: 'Daily platform operations: candidates, evaluations, BGV, clients, trials.',
    portal: 'ADMIN',
    baseRole: 'ADMIN',
    permissions: ALL_PERMISSIONS.filter((p) => p !== PERMISSIONS.ADMIN_PLATFORM),
    isProtected: false,
  },
  {
    code: 'RECRUITER',
    name: 'Recruiter',
    description: 'Candidate pipeline, evaluations, and BGV.',
    portal: 'RECRUITER',
    baseRole: 'RECRUITER',
    permissions: [
      PERMISSIONS.AUTH_ME,
      PERMISSIONS.AUTH_CHANGE_PASSWORD,
      PERMISSIONS.ORG_READ,
      PERMISSIONS.CLIENTS_READ,
      PERMISSIONS.CANDIDATES_READ,
      PERMISSIONS.CANDIDATES_WRITE,
      PERMISSIONS.CANDIDATES_DELETE,
      PERMISSIONS.SKILLS_READ,
      PERMISSIONS.SKILLS_WRITE,
      PERMISSIONS.EVALUATIONS_READ,
      PERMISSIONS.EVALUATIONS_WRITE,
      PERMISSIONS.BACKGROUND_CHECKS_READ,
      PERMISSIONS.BACKGROUND_CHECKS_WRITE,
      PERMISSIONS.TRIALS_READ,
      PERMISSIONS.TRIALS_WRITE,
      PERMISSIONS.DEPLOYMENTS_READ,
      PERMISSIONS.DEPLOYMENTS_WRITE,
      PERMISSIONS.DOCUMENTS_READ,
      PERMISSIONS.DOCUMENTS_WRITE,
      PERMISSIONS.NOTIFICATIONS_READ,
    ],
    isProtected: false,
  },
  {
    code: 'SALES',
    name: 'Sales',
    description: 'Client accounts, trials, deployments, and margin tracking.',
    portal: 'SALES',
    baseRole: 'SALES',
    permissions: [
      PERMISSIONS.AUTH_ME,
      PERMISSIONS.AUTH_CHANGE_PASSWORD,
      PERMISSIONS.ORG_READ,
      PERMISSIONS.CLIENTS_READ,
      PERMISSIONS.CLIENTS_WRITE,
      PERMISSIONS.CANDIDATES_READ,
      PERMISSIONS.CANDIDATES_EDIT_LIMITED,
      PERMISSIONS.CANDIDATES_VIEW_PAY_RATE,
      PERMISSIONS.SKILLS_READ,
      PERMISSIONS.SHORTLISTS_READ,
      PERMISSIONS.TRIALS_READ,
      PERMISSIONS.TRIALS_WRITE,
      PERMISSIONS.DEPLOYMENTS_READ,
      PERMISSIONS.DEPLOYMENTS_WRITE,
      PERMISSIONS.SALES_PIPELINE_READ,
      PERMISSIONS.SALES_PIPELINE_WRITE,
      PERMISSIONS.SALES_REPORTS_READ,
      PERMISSIONS.BACKGROUND_CHECKS_READ,
      PERMISSIONS.DOCUMENTS_READ,
      PERMISSIONS.DOCUMENTS_WRITE,
      PERMISSIONS.NOTIFICATIONS_READ,
    ],
    isProtected: false,
  },
  {
    code: 'CLIENT',
    name: 'Client',
    description: 'Browse candidates, request trials, and view deployments.',
    portal: 'CLIENT',
    baseRole: 'CLIENT',
    permissions: [
      PERMISSIONS.AUTH_ME,
      PERMISSIONS.AUTH_CHANGE_PASSWORD,
      PERMISSIONS.ORG_READ,
      PERMISSIONS.CANDIDATES_READ,
      PERMISSIONS.TRIALS_READ,
      PERMISSIONS.TRIALS_WRITE,
      PERMISSIONS.DEPLOYMENTS_READ,
      PERMISSIONS.DEPLOYMENTS_REQUEST,
      PERMISSIONS.DOCUMENTS_READ,
      PERMISSIONS.NOTIFICATIONS_READ,
    ],
    isProtected: false,
  },
  {
    code: 'VIEWER',
    name: 'Viewer',
    description: 'Read-only access across platform modules.',
    portal: 'ADMIN',
    baseRole: 'VIEWER',
    permissions: [
      PERMISSIONS.AUTH_ME,
      PERMISSIONS.AUTH_CHANGE_PASSWORD,
      PERMISSIONS.ORG_READ,
      PERMISSIONS.USERS_READ,
      PERMISSIONS.CLIENTS_READ,
      PERMISSIONS.CANDIDATES_READ,
      PERMISSIONS.SKILLS_READ,
      PERMISSIONS.EVALUATIONS_READ,
      PERMISSIONS.BACKGROUND_CHECKS_READ,
      PERMISSIONS.SHORTLISTS_READ,
      PERMISSIONS.TRIALS_READ,
      PERMISSIONS.DEPLOYMENTS_READ,
      PERMISSIONS.SALES_REPORTS_READ,
      PERMISSIONS.DOCUMENTS_READ,
      PERMISSIONS.NOTIFICATIONS_READ,
      PERMISSIONS.AUDIT_READ,
    ],
    isProtected: false,
  },
];

const PORTALS = new Set(['ADMIN', 'RECRUITER', 'SALES', 'CLIENT']);
const BASE_ROLES = new Set<string>(Object.values(ROLES));

function asPermissionList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((p) => String(p).trim()).filter(Boolean))];
}

function validatePermissions(permissions: string[]) {
  const invalid = permissions.filter((p) => !ALL_PERMISSIONS.includes(p as never));
  if (invalid.length > 0) {
    throw new BadRequestError(`Invalid permissions: ${invalid.slice(0, 5).join(', ')}`);
  }
}

function slugifyCode(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
}

function mapRole(row: {
  id: bigint;
  code: string;
  name: string;
  description: string | null;
  portal: string;
  baseRole: Role;
  permissions: Prisma.JsonValue;
  isSystem: boolean;
  isProtected: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: { memberships: number };
}) {
  return {
    id: Number(row.id),
    code: row.code,
    name: row.name,
    description: row.description,
    portal: row.portal,
    baseRole: row.baseRole,
    permissions: asPermissionList(row.permissions),
    isSystem: row.isSystem,
    isProtected: row.isProtected,
    isActive: row.isActive,
    userCount: row._count?.memberships ?? 0,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class AdminRolesService {
  private readonly audit: AuditService;

  constructor(private readonly fastify: FastifyInstance) {
    this.audit = new AuditService(fastify.prisma);
  }

  private get prisma() {
    return this.fastify.prisma;
  }

  private async auditWrite(
    authUser: AuthenticatedUser,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    resourceId: number,
    description: string,
    metadata?: Prisma.InputJsonValue,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    await this.audit.write({
      organizationId: authUser.organizationId,
      actorId: authUser.id,
      action,
      resourceType: 'PlatformRole',
      resourceId,
      description,
      metadata,
      ipAddress: ctx?.ipAddress,
      userAgent: ctx?.userAgent,
    });
  }

  async ensureSystemRolesSeeded() {
    const count = await this.prisma.platformRole.count({
      where: { isSystem: true, deletedAt: null },
    });
    if (count < SYSTEM_ROLE_SEED.length) {
      for (const seed of SYSTEM_ROLE_SEED) {
        await this.prisma.platformRole.upsert({
          where: { code: seed.code },
          create: {
            code: seed.code,
            name: seed.name,
            description: seed.description,
            portal: seed.portal,
            baseRole: seed.baseRole,
            permissions: seed.permissions,
            isSystem: true,
            isProtected: seed.isProtected,
            isActive: true,
          },
          update: {
            // Do not overwrite admin-edited permissions on reseed.
            name: seed.name,
            description: seed.description,
            portal: seed.portal,
            baseRole: seed.baseRole,
            isSystem: true,
            isProtected: seed.isProtected,
            deletedAt: null,
          },
        });
      }
    }

    // Additive permission patches for existing CLIENT roles (safe merge).
    const clientRole = await this.prisma.platformRole.findUnique({
      where: { code: 'CLIENT' },
    });
    if (clientRole) {
      const perms = asPermissionList(clientRole.permissions);
      if (!perms.includes(PERMISSIONS.DEPLOYMENTS_REQUEST)) {
        await this.prisma.platformRole.update({
          where: { code: 'CLIENT' },
          data: {
            permissions: [...perms, PERMISSIONS.DEPLOYMENTS_REQUEST],
          },
        });
      }
    }
  }

  async listRoles() {
    await this.ensureSystemRolesSeeded();
    const rows = await this.prisma.platformRole.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { memberships: true } } },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
    return { data: rows.map(mapRole) };
  }

  async getRole(codeOrId: string) {
    await this.ensureSystemRolesSeeded();
    const row = await this.findRole(codeOrId);
    if (!row) throw new NotFoundError('Role not found');
    return mapRole(row);
  }

  async createRole(
    authUser: AuthenticatedUser,
    input: {
      name: string;
      code?: string;
      description?: string;
      portal?: string;
      baseRole?: string;
      permissions?: string[];
    },
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const name = input.name?.trim();
    if (!name) throw new BadRequestError('Role name is required');

    const code = slugifyCode(input.code || name);
    if (!code) throw new BadRequestError('Role code is required');
    if (BASE_ROLES.has(code)) {
      throw new BadRequestError('Cannot create a role with a reserved system code');
    }

    const portal = (input.portal ?? 'ADMIN').toUpperCase();
    if (!PORTALS.has(portal)) throw new BadRequestError('Invalid portal');

    const baseRole = (input.baseRole ?? 'VIEWER').toUpperCase();
    if (!BASE_ROLES.has(baseRole) || baseRole === 'SUPER_ADMIN') {
      throw new BadRequestError('Invalid base role');
    }

    const permissions = asPermissionList(input.permissions ?? []);
    validatePermissions(permissions);
    if (permissions.includes(PERMISSIONS.ADMIN_PLATFORM)) {
      throw new BadRequestError('admin:platform cannot be granted to custom roles');
    }

    const existing = await this.prisma.platformRole.findFirst({
      where: { code, deletedAt: null },
    });
    if (existing) throw new BadRequestError('A role with this code already exists');

    const row = await this.prisma.platformRole.create({
      data: {
        code,
        name,
        description: input.description?.trim() || null,
        portal,
        baseRole: baseRole as Role,
        permissions,
        isSystem: false,
        isProtected: false,
        isActive: true,
        createdById: BigInt(authUser.id),
        updatedById: BigInt(authUser.id),
      },
      include: { _count: { select: { memberships: true } } },
    });

    await this.auditWrite(
      authUser,
      'CREATE',
      Number(row.id),
      `Created role ${code}`,
      { code, permissions },
      ctx,
    );

    return mapRole(row);
  }

  async updateRole(
    authUser: AuthenticatedUser,
    codeOrId: string,
    input: {
      name?: string;
      description?: string | null;
      portal?: string;
      baseRole?: string;
      isActive?: boolean;
      permissions?: string[];
    },
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const existing = await this.findRole(codeOrId);
    if (!existing) throw new NotFoundError('Role not found');
    if (existing.isProtected) {
      throw new BadRequestError('SUPER_ADMIN role cannot be modified');
    }

    const data: Prisma.PlatformRoleUpdateInput = {
      updatedBy: { connect: { id: BigInt(authUser.id) } },
    };

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new BadRequestError('Role name is required');
      data.name = name;
    }
    if (input.description !== undefined) {
      data.description = input.description?.trim() || null;
    }
    if (input.portal !== undefined) {
      const portal = input.portal.toUpperCase();
      if (!PORTALS.has(portal)) throw new BadRequestError('Invalid portal');
      if (existing.isSystem) {
        throw new BadRequestError('Cannot change portal for system roles');
      }
      data.portal = portal;
    }
    if (input.baseRole !== undefined) {
      const baseRole = input.baseRole.toUpperCase();
      if (!BASE_ROLES.has(baseRole) || baseRole === 'SUPER_ADMIN') {
        throw new BadRequestError('Invalid base role');
      }
      if (existing.isSystem) {
        throw new BadRequestError('Cannot change base role for system roles');
      }
      data.baseRole = baseRole as Role;
    }
    if (input.isActive !== undefined) {
      data.isActive = input.isActive;
    }
    if (input.permissions !== undefined) {
      const permissions = asPermissionList(input.permissions);
      validatePermissions(permissions);
      if (existing.code !== 'SUPER_ADMIN' && permissions.includes(PERMISSIONS.ADMIN_PLATFORM)) {
        throw new BadRequestError('admin:platform is reserved for SUPER_ADMIN');
      }
      data.permissions = permissions;
    }

    const row = await this.prisma.platformRole.update({
      where: { id: existing.id },
      data,
      include: { _count: { select: { memberships: true } } },
    });

    await this.auditWrite(
      authUser,
      'UPDATE',
      Number(row.id),
      `Updated role ${row.code}`,
      input as Prisma.InputJsonValue,
      ctx,
    );

    return mapRole(row);
  }

  async deleteRole(
    authUser: AuthenticatedUser,
    codeOrId: string,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const existing = await this.findRole(codeOrId);
    if (!existing) throw new NotFoundError('Role not found');
    if (existing.isSystem || existing.isProtected) {
      throw new BadRequestError('System roles cannot be deleted');
    }
    const assigned = await this.prisma.membership.count({
      where: { platformRoleId: existing.id, isActive: true },
    });
    if (assigned > 0) {
      throw new BadRequestError(
        'Cannot delete this role because users are currently assigned to it',
      );
    }

    await this.prisma.platformRole.update({
      where: { id: existing.id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedById: BigInt(authUser.id),
      },
    });

    await this.auditWrite(
      authUser,
      'DELETE',
      Number(existing.id),
      `Deleted role ${existing.code}`,
      undefined,
      ctx,
    );

    return { message: 'Role deleted' };
  }

  async listCatalog() {
    return {
      data: {
        permissions: ALL_PERMISSIONS,
        portals: [...PORTALS],
        baseRoles: [...BASE_ROLES].filter((r) => r !== 'SUPER_ADMIN'),
      },
    };
  }

  private async findRole(codeOrId: string) {
    const numeric = Number(codeOrId);
    if (Number.isFinite(numeric) && String(numeric) === codeOrId) {
      return this.prisma.platformRole.findFirst({
        where: { id: BigInt(numeric), deletedAt: null },
        include: { _count: { select: { memberships: true } } },
      });
    }
    return this.prisma.platformRole.findFirst({
      where: { code: codeOrId.toUpperCase(), deletedAt: null },
      include: { _count: { select: { memberships: true } } },
    });
  }
}

function withClientDeployRequestPermission(
  role: AppRole,
  permissions: string[],
): string[] {
  if (role !== 'CLIENT') return permissions;
  if (permissions.includes(PERMISSIONS.DEPLOYMENTS_REQUEST)) return permissions;
  return [...permissions, PERMISSIONS.DEPLOYMENTS_REQUEST];
}

/** Resolve effective permissions for a membership role / platform role override. */
export async function resolvePermissionsForMembership(
  prisma: FastifyInstance['prisma'],
  role: AppRole,
  platformRoleId?: number | null,
): Promise<string[]> {
  if (platformRoleId) {
    const custom = await prisma.platformRole.findFirst({
      where: { id: BigInt(platformRoleId), deletedAt: null, isActive: true },
    });
    if (custom) {
      return withClientDeployRequestPermission(role, asPermissionList(custom.permissions));
    }
  }

  const byCode = await prisma.platformRole.findFirst({
    where: { code: role, deletedAt: null, isActive: true },
  });
  if (byCode) {
    return withClientDeployRequestPermission(role, asPermissionList(byCode.permissions));
  }

  // Fallback to static map until seed runs
  const { getPermissionsForRole } = await import('../auth/auth.permissions.js');
  return withClientDeployRequestPermission(role, [...getPermissionsForRole(role)]);
}
