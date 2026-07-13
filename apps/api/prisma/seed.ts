import argon2 from 'argon2';
import {
  PrismaClient,
  Role,
  ClientStatus,
  CandidateStatus,
  CandidateVisibility,
  CandidateApprovalStatus,
  CandidateSource,
  TrialRequestStatus,
  InterviewType,
  InterviewRequestStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('Password123!');

  let organization = await prisma.organization.findFirst({
    where: { slug: { in: ['amnet-digital', 'bestal-demo'] } },
  });

  if (organization) {
    organization = await prisma.organization.update({
      where: { id: organization.id },
      data: { name: 'Amnet Digital', slug: 'amnet-digital' },
    });
  } else {
    organization = await prisma.organization.create({
      data: { name: 'Amnet Digital', slug: 'amnet-digital' },
    });
  }

  const orgId = organization.id;

  const skillCommunitySeed = [
    {
      name: 'Full-Stack Development',
      slug: 'full-stack-development',
      description: 'React, Node.js, TypeScript, and modern web architecture specialists.',
    },
    {
      name: 'DevOps & Cloud',
      slug: 'devops-cloud',
      description: 'Kubernetes, Terraform, AWS, GCP, and site reliability engineering experts.',
    },
    {
      name: 'Data Engineering',
      slug: 'data-engineering',
      description: 'Spark, Kafka, Snowflake, dbt, and real-time pipeline architects.',
    },
    {
      name: 'Machine Learning',
      slug: 'machine-learning',
      description: 'PyTorch, TensorFlow, NLP, computer vision, and MLOps practitioners.',
    },
    {
      name: 'Mobile Development',
      slug: 'mobile-development',
      description: 'React Native, Flutter, Swift, and Kotlin mobile engineers.',
    },
    {
      name: 'Cybersecurity',
      slug: 'cybersecurity',
      description: 'Security architects, penetration testers, and compliance specialists.',
    },
    {
      name: 'Product Design',
      slug: 'product-design',
      description: 'UX/UI designers, design system leads, and user research experts.',
    },
    {
      name: 'QA & Test Automation',
      slug: 'qa-test-automation',
      description: 'Cypress, Playwright, Selenium, and quality engineering leaders.',
    },
    {
      name: 'Blockchain',
      slug: 'blockchain',
      description: 'Solidity, Ethereum, smart contract auditing, and DeFi protocol developers.',
    },
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

    await prisma.membership.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: orgId,
        },
      },
      update: { role: entry.role },
      create: {
        userId: user.id,
        organizationId: orgId,
        role: entry.role,
      },
    });

    console.log(`${entry.role}: ${entry.email} / Password123!`);
  }

  const salesUserId = userIds['sales@bestal.com'];

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

  const candidate = await prisma.candidate.upsert({
    where: {
      organizationId_email: { organizationId: orgId, email: 'alexandra.petrov@demo.bestal.com' },
    },
    update: {},
    create: {
      organizationId: orgId,
      firstName: 'Alexandra',
      lastName: 'Petrov',
      email: 'alexandra.petrov@demo.bestal.com',
      status: CandidateStatus.ACTIVE,
      visibility: CandidateVisibility.CLIENT_VISIBLE,
      approvalStatus: CandidateApprovalStatus.APPROVED,
      source: CandidateSource.LINKEDIN,
      headline: 'Senior Full-Stack Engineer',
      location: 'San Francisco, CA',
      yearsExperience: 8,
      publishedAt: new Date(),
      approvedAt: new Date(),
      approvedById: userIds['admin@bestal.com'],
    },
  });

  await prisma.trialRequest.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      id: BigInt(1),
      organizationId: orgId,
      candidateId: candidate.id,
      clientId: client.id,
      requestedById: userIds['client@bestal.com'],
      status: TrialRequestStatus.REQUESTED,
      roleTitle: 'Senior Backend Engineer — Payments',
      startDate: new Date('2026-07-14'),
      endDate: new Date('2026-07-28'),
      durationDays: 15,
    },
  });

  await prisma.interviewRequest.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      id: BigInt(1),
      organizationId: orgId,
      candidateId: candidate.id,
      clientId: client.id,
      requestedById: userIds['client@bestal.com'],
      type: InterviewType.TECHNICAL,
      status: InterviewRequestStatus.REQUESTED,
      durationMinutes: 60,
      notes: 'Technical interview for payments platform role',
    },
  });

  console.log('Seed completed with demo client, candidate, trial, and interview.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
