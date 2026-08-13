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
      },
    });
    roleIds.set(seed.code, role.id);
  }

  console.log(`Seeded ${PLATFORM_ROLE_SEED.length} platform roles.`);
  return roleIds;
}

async function main() {
  await assertSchemaReady();

  const passwordHash = await argon2.hash('Password123!');
  const platformRoleIds = await seedPlatformRoles();

  let organization = await prisma.organization.findFirst({
    where: { slug: { in: ['amnet-digital', 'bestal-demo'] } },
  });

  if (organization) {
    organization = await prisma.organization.update({
      where: { id: organization.id },
      data: { name: 'Amnet Digital', slug: 'amnet-digital', isActive: true },
    });
  } else {
    organization = await prisma.organization.create({
      data: { name: 'Amnet Digital', slug: 'amnet-digital' },
    });
  }

  const orgId = organization.id;

  const skillCommunitySeed = [
    { name: 'Data Engineering', slug: 'data-engineering', description: 'Spark, Kafka, Snowflake, dbt, and real-time pipeline architects.' },
    { name: 'AI / GenAI', slug: 'ai-genai', description: 'LLM, GenAI, MLOps, and applied AI specialists.' },
    { name: 'Cloud / DevOps', slug: 'cloud-devops', description: 'Kubernetes, Terraform, AWS, GCP, and site reliability engineering experts.' },
    { name: 'QA Automation', slug: 'qa-automation', description: 'Cypress, Playwright, Selenium, and quality engineering leaders.' },
    { name: 'Frontend', slug: 'frontend', description: 'React, Angular, Vue, and modern UI engineers.' },
    { name: 'Backend', slug: 'backend', description: 'Node.js, Java, .NET, Python, and API platform engineers.' },
    { name: 'Full Stack', slug: 'full-stack', description: 'End-to-end product engineers spanning frontend and backend.' },
    { name: 'Mobile', slug: 'mobile', description: 'React Native, Flutter, Swift, and Kotlin mobile engineers.' },
    { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Security architects, penetration testers, and compliance specialists.' },
    { name: 'SAP', slug: 'sap', description: 'SAP functional and technical consultants.' },
    { name: 'Salesforce', slug: 'salesforce', description: 'Salesforce admins, developers, and architects.' },
    { name: 'ServiceNow', slug: 'servicenow', description: 'ServiceNow developers and platform consultants.' },
  ] as const;

  for (const community of skillCommunitySeed) {
    await prisma.skillCommunity.upsert({
      where: { slug: community.slug },
      update: {
        name: community.name,
        description: community.description,
        isActive: true,
        deletedAt: null,
      },
      create: {
        name: community.name,
        slug: community.slug,
        description: community.description,
      },
    });
  }

  console.log(`Seeded ${skillCommunitySeed.length} skill communities.`);

  const users = [
    { email: 'superadmin@bestal.com', firstName: 'Super', lastName: 'Admin', role: Role.SUPER_ADMIN },
    { email: 'admin@bestal.com', firstName: 'Platform', lastName: 'Admin', role: Role.ADMIN },
    { email: 'recruiter@bestal.com', firstName: 'Demo', lastName: 'Recruiter', role: Role.RECRUITER },
    { email: 'sales@bestal.com', firstName: 'Demo', lastName: 'Sales', role: Role.SALES },
    { email: 'client@bestal.com', firstName: 'Jennifer', lastName: 'Walsh', role: Role.CLIENT },
  ] as const;

  const userIds: Record<string, bigint> = {};

  for (const entry of users) {
    const user = await prisma.user.upsert({
      where: { email: entry.email },
      update: { firstName: entry.firstName, lastName: entry.lastName },
      create: {
        email: entry.email,
        passwordHash,
        firstName: entry.firstName,
        lastName: entry.lastName,
      },
    });

    userIds[entry.email] = user.id;

    const platformRoleId = platformRoleIds.get(entry.role);

    await prisma.membership.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: orgId,
        },
      },
      update: {
        role: entry.role,
        platformRoleId: platformRoleId ?? null,
        isActive: true,
      },
      create: {
        userId: user.id,
        organizationId: orgId,
        role: entry.role,
        platformRoleId: platformRoleId ?? null,
      },
    });

    console.log(`${entry.role}: ${entry.email} / Password123!`);
  }

  const salesUserId = userIds['sales@bestal.com'];
  const recruiterUserId = userIds['recruiter@bestal.com'];

  const client = await prisma.client.upsert({
    where: {
      organizationId_slug: { organizationId: orgId, slug: 'jpmorgan-chase' },
    },
    update: {
      contactEmail: 'client@bestal.com',
      accountManagerId: salesUserId,
    },
    create: {
      organizationId: orgId,
      accountManagerId: salesUserId,
      name: 'JPMorgan Chase',
      slug: 'jpmorgan-chase',
      status: ClientStatus.ACTIVE,
      industry: 'Financial Services',
      contactEmail: 'client@bestal.com',
      contactPhone: '+1 (212) 555-0100',
      city: 'New York',
      state: 'NY',
      country: 'US',
    },
  });

  const clientUserId = userIds['client@bestal.com'];
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

  const candidate = await prisma.candidate.upsert({
    where: {
      organizationId_email: { organizationId: orgId, email: 'alexandra.petrov@demo.bestal.com' },
    },
    update: {
      displayName: 'Alexandra Petrov',
      profileStatus: CandidateProfileStatus.ADMIN_APPROVED,
      aiScreeningStatus: AiScreeningStatus.COMPLETED,
      evaluationStatus: 'COMPLETE',
      bgvStatus: 'CLEAR',
    },
    create: {
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
      approvedById: userIds['admin@bestal.com'],
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
    requestedById: userIds['client@bestal.com'],
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
