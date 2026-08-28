import 'dotenv/config';
import argon2 from 'argon2';
import {
  PrismaClient,
  Role,
  ClientStatus,
  CandidateStatus,
  CandidateVisibility,
  CandidateApprovalStatus,
  CandidateProfileStatus,
  AiScreeningStatus,
  CandidateSource,
  TrialRequestStatus,
} from '@prisma/client';
import { PERMISSIONS } from '../src/modules/auth/auth.permissions.js';

const prisma = new PrismaClient();

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

const PLATFORM_ROLE_SEED = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Full platform access including platform settings and user provisioning.',
    portal: 'ADMIN',
    baseRole: Role.SUPER_ADMIN,
    permissions: [...ALL_PERMISSIONS],
    isProtected: true,
  },
  {
    code: 'ADMIN',
    name: 'Admin',
    description: 'Daily platform operations: candidates, evaluations, BGV, clients, trials.',
    portal: 'ADMIN',
    baseRole: Role.ADMIN,
    permissions: ALL_PERMISSIONS.filter((p) => p !== PERMISSIONS.ADMIN_PLATFORM),
    isProtected: false,
  },
  {
    code: 'RECRUITER',
    name: 'Recruiter',
    description: 'Candidate pipeline, evaluations, and BGV.',
    portal: 'RECRUITER',
    baseRole: Role.RECRUITER,
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
    baseRole: Role.SALES,
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
      PERMISSIONS.JOB_REQUESTS_READ,
      PERMISSIONS.JOB_REQUESTS_WRITE,
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
    baseRole: Role.CLIENT,
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
] as const;

function isSchemaMissingError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2021'
  );
}

async function assertSchemaReady(): Promise<void> {
  try {
    await prisma.organization.findFirst({ select: { id: true } });
  } catch (error) {
    if (isSchemaMissingError(error)) {
      console.error(
        [
          'Database schema is not initialized (missing tables).',
          'Run migrations first, then seed again:',
          '',
          '  npm run db:migrate:deploy -w @bestal/api',
          '  npm run db:seed -w @bestal/api',
          '',
          'Or in one step:',
          '  npm run db:setup -w @bestal/api',
        ].join('\n'),
      );
      process.exit(1);
    }
    throw error;
  }
}

async function seedPlatformRoles(): Promise<Map<string, bigint>> {
  const roleIds = new Map<string, bigint>();

  for (const seed of PLATFORM_ROLE_SEED) {
    const role = await prisma.platformRole.upsert({
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
        name: seed.name,
        description: seed.description,
        portal: seed.portal,
        baseRole: seed.baseRole,
        isSystem: true,
        isProtected: seed.isProtected,
        deletedAt: null,
        permissions: seed.permissions,
      },
    });
    roleIds.set(seed.code, role.id);
  }

  console.log(`Seeded ${PLATFORM_ROLE_SEED.length} platform roles.`);
  return roleIds;
}

const BESTAL_ORG_NAME = 'BesTal';
const BESTAL_ORG_SLUG = 'bestal';
const LEGACY_ORG_SLUGS = ['amnet-digital', 'bestal-demo'] as const;

async function ensureBestalOrganization() {
  const bestal = await prisma.organization.findFirst({
    where: { slug: BESTAL_ORG_SLUG },
  });

  if (bestal) {
    const organization = await prisma.organization.update({
      where: { id: bestal.id },
      data: { name: BESTAL_ORG_NAME, slug: BESTAL_ORG_SLUG, isActive: true, deletedAt: null },
    });
    await prisma.organization.updateMany({
      where: {
        slug: { in: [...LEGACY_ORG_SLUGS] },
        id: { not: organization.id },
      },
      data: { isActive: false, deletedAt: new Date() },
    });
    return organization;
  }

  const legacy = await prisma.organization.findFirst({
    where: { slug: { in: [...LEGACY_ORG_SLUGS] } },
    orderBy: { id: 'asc' },
  });

  if (legacy) {
    const organization = await prisma.organization.update({
      where: { id: legacy.id },
      data: { name: BESTAL_ORG_NAME, slug: BESTAL_ORG_SLUG, isActive: true, deletedAt: null },
    });
    await prisma.organization.updateMany({
      where: {
        slug: { in: [...LEGACY_ORG_SLUGS] },
        id: { not: organization.id },
      },
      data: { isActive: false, deletedAt: new Date() },
    });
    return organization;
  }

  return prisma.organization.create({
    data: { name: BESTAL_ORG_NAME, slug: BESTAL_ORG_SLUG },
  });
}

async function main() {
  await assertSchemaReady();

  const passwordHash = await argon2.hash('Password123!');
  const platformRoleIds = await seedPlatformRoles();

  const organization = await ensureBestalOrganization();
  const orgId = organization.id;

  const skillCommunitySeed = [
    { name: 'Data Engineering', slug: 'data-engineering', description: 'Spark, Kafka, Snowflake, dbt, and real-time pipeline architects.', displayOrder: 1 },
    { name: 'AI / GenAI', slug: 'ai-genai', description: 'LLM, GenAI, MLOps, and applied AI specialists.', displayOrder: 2 },
    { name: 'Cloud / DevOps', slug: 'cloud-devops', description: 'Kubernetes, Terraform, AWS, GCP, and site reliability engineering experts.', displayOrder: 3 },
    { name: 'QA Automation', slug: 'qa-automation', description: 'Cypress, Playwright, Selenium, and quality engineering leaders.', displayOrder: 4 },
    { name: 'Frontend Development', slug: 'frontend-development', description: 'React, Angular, Vue, and modern UI engineers.', displayOrder: 5, aliases: ['frontend', 'Frontend'] },
    { name: 'Backend Development', slug: 'backend-development', description: 'Node.js, Java, .NET, Python, and API platform engineers.', displayOrder: 6, aliases: ['backend', 'Backend'] },
    { name: 'Full Stack', slug: 'full-stack', description: 'End-to-end product engineers spanning frontend and backend.', displayOrder: 7 },
    { name: 'Mobile', slug: 'mobile', description: 'React Native, Flutter, Swift, and Kotlin mobile engineers.', displayOrder: 8 },
    { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Security architects, penetration testers, and compliance specialists.', displayOrder: 9 },
    { name: 'SAP', slug: 'sap', description: 'SAP functional and technical consultants.', displayOrder: 10 },
    { name: 'Salesforce', slug: 'salesforce', description: 'Salesforce admins, developers, and architects.', displayOrder: 11 },
    { name: 'ServiceNow', slug: 'servicenow', description: 'ServiceNow developers and platform consultants.', displayOrder: 12 },
    { name: 'Machine Learning', slug: 'machine-learning', description: 'Classical ML, deep learning, model training, and applied data science specialists.', displayOrder: 13 },
    { name: 'Scrum Master', slug: 'scrum-master', description: 'Agile delivery leads, Scrum Masters, and iteration coaches.', displayOrder: 14 },
    { name: 'Product Design', slug: 'product-design', description: 'Product designers, UX/UI, research, and design systems specialists.', displayOrder: 15 },
    { name: 'Others', slug: 'others', description: 'Roles and skills that do not fit another skill community.', displayOrder: 16, aliases: ['other', 'Other'] },
  ] as const;

  for (const community of skillCommunitySeed) {
    const existing = await prisma.skillCommunity.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { slug: community.slug },
          { name: community.name },
          ...('aliases' in community ? community.aliases.flatMap((alias) => [{ slug: alias }, { name: alias }]) : []),
        ],
      },
    });
    if (existing) {
      await prisma.skillCommunity.update({
        where: { id: existing.id },
        data: {
          name: community.name,
          slug: community.slug,
          description: community.description,
          displayOrder: community.displayOrder,
          isActive: true,
          deletedAt: null,
        },
      });
    } else {
      await prisma.skillCommunity.create({
        data: {
          name: community.name,
          slug: community.slug,
          description: community.description,
          displayOrder: community.displayOrder,
        },
      });
    }
  }

  console.log(`Seeded ${skillCommunitySeed.length} skill communities.`);

  const users = [
    { email: 'superadmin@bestal.co', firstName: 'Super', lastName: 'Admin', role: Role.SUPER_ADMIN },
    { email: 'admin@bestal.co', firstName: 'Platform', lastName: 'Admin', role: Role.ADMIN },
    { email: 'recruiter@bestal.co', firstName: 'Demo', lastName: 'Recruiter', role: Role.RECRUITER },
    { email: 'sales@bestal.co', firstName: 'Demo', lastName: 'Sales', role: Role.SALES },
    { email: 'client@bestal.co', firstName: 'Jennifer', lastName: 'Walsh', role: Role.CLIENT },
  ] as const;

  const userIds: Record<string, bigint> = {};

  for (const entry of users) {
    const legacyEmail = entry.email.replace(/@bestal\.co$/i, '@bestal.com');
    const existingUser = await prisma.user.findFirst({
      where: { email: { in: [entry.email, legacyEmail] } },
    });
    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            email: entry.email,
            firstName: entry.firstName,
            lastName: entry.lastName,
            deletedAt: null,
            ...(entry.role !== Role.CLIENT ? { mustChangePassword: true } : {}),
          },
        })
      : await prisma.user.create({
          data: {
            email: entry.email,
            passwordHash,
            firstName: entry.firstName,
            lastName: entry.lastName,
            mustChangePassword: entry.role !== Role.CLIENT,
          },
        });

    userIds[entry.email] = user.id;

    const platformRoleId = platformRoleIds.get(entry.role);

    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: orgId,
        },
      },
    });
    if (existingMembership) {
      await prisma.membership.update({
        where: { id: existingMembership.id },
        data: {
          role: entry.role,
          platformRoleId: platformRoleId ?? null,
          isActive: true,
        },
      });
    } else {
      await prisma.membership.create({
        data: {
          userId: user.id,
          organizationId: orgId,
          role: entry.role,
          platformRoleId: platformRoleId ?? null,
        },
      });
    }

    console.log(`${entry.role}: ${entry.email} / Password123!`);
  }

  const salesUserId = userIds['sales@bestal.co'];
  const recruiterUserId = userIds['recruiter@bestal.co'];

  const existingClient = await prisma.client.findFirst({
    where: {
      organizationId: orgId,
      OR: [
        { slug: 'jpmorgan-chase' },
        { contactEmail: 'client@bestal.co' },
        { contactEmail: 'client@bestal.com' },
      ],
      deletedAt: null,
    },
  });
  const client = existingClient
    ? await prisma.client.update({
        where: { id: existingClient.id },
        data: {
          contactEmail: 'client@bestal.co',
          accountManagerId: salesUserId,
          status: ClientStatus.ACTIVE,
          deletedAt: null,
        },
      })
    : await prisma.client.create({
        data: {
          organizationId: orgId,
          accountManagerId: salesUserId,
          name: 'AmnetDigital',
          slug: 'Amnet-digital',
          status: ClientStatus.ACTIVE,
          industry: 'Financial Services',
          contactEmail: 'client@bestal.co',
          contactPhone: '+1 (212) 555-0100',
          city: 'New York',
          state: 'NY',
          country: 'US',
        },
      });

  const clientUserId = userIds['client@bestal.co'];
  if (clientUserId) {
    await prisma.membership.updateMany({
      where: {
        userId: clientUserId,
        organizationId: orgId,
        role: Role.CLIENT,
      },
      data: { clientId: client.id },
    });
  }

  const fullStackCommunity = await prisma.skillCommunity.findUnique({
    where: { slug: 'full-stack' },
    select: { id: true },
  });

  const existingCandidate = await prisma.candidate.findFirst({
    where: {
      organizationId: orgId,
      email: 'alexandra.petrov@demo.bestal.com',
    },
  });
  const candidate = existingCandidate
    ? await prisma.candidate.update({
        where: { id: existingCandidate.id },
        data: {
          displayName: 'Alexandra Petrov',
          profileStatus: CandidateProfileStatus.ADMIN_APPROVED,
          aiScreeningStatus: AiScreeningStatus.COMPLETED,
          evaluationStatus: 'COMPLETE',
          bgvStatus: 'CLEAR',
          deletedAt: null,
        },
      })
    : await prisma.candidate.create({
        data: {
          organizationId: orgId,
          createdById: recruiterUserId,
          primarySkillCommunityId: fullStackCommunity?.id,
          firstName: 'Alexandra',
          lastName: 'Petrov',
          displayName: 'Alexandra Petrov',
          email: 'alexandra.petrov@demo.bestal.com',
          status: CandidateStatus.ACTIVE,
          visibility: CandidateVisibility.CLIENT_VISIBLE,
          approvalStatus: CandidateApprovalStatus.APPROVED,
          profileStatus: CandidateProfileStatus.ADMIN_APPROVED,
          aiScreeningStatus: AiScreeningStatus.COMPLETED,
          evaluationStatus: 'COMPLETE',
          bgvStatus: 'CLEAR',
          source: CandidateSource.LINKEDIN,
          headline: 'Senior Full-Stack Engineer',
          location: 'San Francisco, CA',
          yearsExperience: 8,
          publishedAt: new Date(),
          approvedAt: new Date(),
          approvedById: userIds['admin@bestal.co'],
        },
      });

  const existingTrial = await prisma.trialRequest.findFirst({
    where: {
      organizationId: orgId,
      candidateId: candidate.id,
      clientId: client.id,
      deletedAt: null,
    },
    select: { id: true },
  });

  const trialData = {
    organizationId: orgId,
    candidateId: candidate.id,
    clientId: client.id,
    requestedById: userIds['client@bestal.co'],
    assignedRecruiterId: recruiterUserId,
    status: TrialRequestStatus.REQUESTED,
    roleTitle: 'Senior Backend Engineer — Payments',
    startDate: new Date('2026-07-14'),
    endDate: new Date('2026-07-28'),
    durationDays: 15,
    maxTrialHours: 20,
  };

  if (existingTrial) {
    await prisma.trialRequest.update({
      where: { id: existingTrial.id },
      data: trialData,
    });
  } else {
    await prisma.trialRequest.create({ data: trialData });
  }

  console.log(`Organization: ${organization.name} (${organization.slug})`);
  console.log('Seed completed with demo client, candidate, and trial.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
