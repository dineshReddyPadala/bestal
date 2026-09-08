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

const CAREER_OPENING_SEED = [
  {
    title: 'Senior Full-Stack Engineer (React/Node)',
    slug: 'senior-full-stack-engineer-react-node',
    skillCommunity: 'Full-Stack Development',
    location: 'San Francisco, CA',
    remote: true,
    jobLevel: 'Senior level',
    experience: '7+ years',
    aboutRole:
      'We are seeking a talented Senior Full-Stack Engineer to join our product engineering team. The ideal candidate will have deep experience building B2B SaaS platforms with React and Node.js, strong TypeScript skills, and a track record of shipping production features in cloud environments.',
    responsibilities: [
      'Lead development of customer-facing and internal web applications using React and Node.js.',
      'Design RESTful and event-driven APIs with PostgreSQL and modern caching patterns.',
      'Collaborate with product, design, and QA to deliver features from specification to production.',
      'Mentor mid-level engineers through code review, pairing, and architectural guidance.',
      'Improve CI/CD pipelines, observability, and deployment practices on AWS.',
    ],
    requirements: [
      '7+ years of full-stack development experience.',
      'Expert-level React, TypeScript, and Node.js.',
      'Experience with microservices and relational databases in production.',
      'AWS or GCP deployment and operations experience.',
      'Strong communication skills and ability to work across time zones.',
    ],
    publishedAt: new Date('2026-06-15T10:00:00Z'),
  },
  {
    title: 'Staff DevOps Engineer',
    slug: 'staff-devops-engineer',
    skillCommunity: 'DevOps & Cloud',
    location: 'New York, NY',
    remote: true,
    jobLevel: 'Staff level',
    experience: '8+ years',
    aboutRole:
      'We are looking for a Staff DevOps Engineer to own platform reliability and delivery for high-traffic client environments. You will design Kubernetes infrastructure, GitOps workflows, and observability stacks that keep engineering teams shipping safely at scale.',
    responsibilities: [
      'Design and operate Kubernetes-based infrastructure on AWS (EKS) or GCP (GKE).',
      'Build and maintain Terraform modules and Infrastructure as Code standards.',
      'Implement CI/CD pipelines with GitHub Actions, ArgoCD, or equivalent tooling.',
      'Define SLOs, alerting, and incident response practices for production systems.',
      'Partner with application teams to improve deploy frequency and mean time to recovery.',
    ],
    requirements: [
      '8+ years in DevOps, SRE, or platform engineering.',
      'Production Kubernetes experience at scale.',
      'Strong Terraform and IaC practices.',
      'CI/CD pipeline design and security hardening experience.',
      'Excellent troubleshooting skills and clear written communication.',
    ],
    publishedAt: new Date('2026-06-18T14:30:00Z'),
  },
  {
    title: 'Principal Data Engineer',
    slug: 'principal-data-engineer',
    skillCommunity: 'Data Engineering',
    location: 'Austin, TX',
    remote: false,
    jobLevel: 'Principal level',
    experience: '10+ years',
    aboutRole:
      'We are seeking a Principal Data Engineer to architect and deliver large-scale data platforms for enterprise clients. You will build real-time and batch pipelines, define data governance standards, and partner with analytics teams to turn raw events into trusted business insights.',
    responsibilities: [
      'Design data pipelines processing high-volume event streams with Spark, Kafka, and Snowflake.',
      'Establish data modeling, quality, and governance standards across client engagements.',
      'Lead technical decisions for modern data stack tooling (dbt, orchestration, lineage).',
      'Collaborate with stakeholders to translate business questions into reliable datasets.',
      'Mentor data engineers and review architecture for performance and cost efficiency.',
    ],
    requirements: [
      '10+ years in data engineering or analytics engineering.',
      'Deep experience with Spark, Kafka, and cloud warehouse platforms.',
      'Snowflake, BigQuery, or equivalent warehouse expertise.',
      'Strong data modeling and documentation practices.',
      'Ability to lead client-facing technical discussions independently.',
    ],
    publishedAt: new Date('2026-06-20T09:00:00Z'),
  },
  {
    title: 'Senior Machine Learning Engineer',
    slug: 'senior-machine-learning-engineer',
    skillCommunity: 'Machine Learning',
    location: 'Seattle, WA',
    remote: true,
    jobLevel: 'Senior level',
    experience: '6+ years',
    aboutRole:
      'We are seeking a talented and experienced Machine Learning Engineer to join our team. The ideal candidate will possess a strong foundation in machine learning fundamentals, with practical experience developing and implementing models across classification, regression, and ranking problems. Experience with production MLOps and language-model applications is highly desirable.',
    responsibilities: [
      'Develop and deploy machine learning models for personalization, search ranking, and forecasting.',
      'Build feature pipelines and model serving infrastructure with MLflow or equivalent MLOps tooling.',
      'Work on projects involving large-scale enterprise datasets to derive actionable insights.',
      'Collaborate with cross-functional teams to understand requirements and validate model performance.',
      'Stay current on ML research and evaluate techniques for production readiness.',
    ],
    requirements: [
      'Strong understanding of machine learning fundamentals and evaluation metrics.',
      '6+ years of ML engineering experience with production model deployment.',
      'Proficiency in Python, PyTorch or TensorFlow, and data wrangling libraries.',
      'Experience with MLOps tooling (MLflow, Kubeflow, or similar).',
      'Good understanding of language models and their practical applications.',
      'Self-motivated with excellent analytical and communication skills.',
    ],
    publishedAt: new Date('2026-06-22T11:00:00Z'),
  },
  {
    title: 'Lead Mobile Engineer (iOS/Android)',
    slug: 'lead-mobile-engineer',
    skillCommunity: 'Mobile Development',
    location: 'Chicago, IL',
    remote: true,
    jobLevel: 'Lead level',
    experience: '8+ years',
    aboutRole:
      'We are looking for a Lead Mobile Engineer to own mobile architecture for consumer and enterprise applications. You will define patterns for React Native (or Flutter) codebases, guide release processes, and ensure performance and accessibility across iOS and Android.',
    responsibilities: [
      'Own mobile application architecture, module boundaries, and release strategy.',
      'Ship features in React Native with native module integration where required.',
      'Establish performance profiling, crash monitoring, and App Store optimization practices.',
      'Lead code reviews and mentor mobile engineers on best practices.',
      'Partner with backend and design teams to deliver cohesive cross-platform experiences.',
    ],
    requirements: [
      '8+ years of mobile development experience.',
      'Expert-level React Native or Flutter with production app releases.',
      'App Store and Google Play submission and compliance experience.',
      'Performance optimization and mobile security awareness.',
      'Strong leadership skills and ability to work independently or in a team.',
    ],
    publishedAt: new Date('2026-06-25T16:00:00Z'),
  },
  {
    title: 'Security Architect',
    slug: 'security-architect',
    skillCommunity: 'Cybersecurity',
    location: 'Washington, DC',
    remote: true,
    jobLevel: 'Architect level',
    experience: '10+ years',
    aboutRole:
      'We are seeking a Security Architect to define security standards for cloud migrations and enterprise SaaS deployments. You will lead threat modeling, zero-trust design, and compliance initiatives including FedRAMP and SOC 2 aligned controls.',
    responsibilities: [
      'Define security architecture for AWS and Azure cloud environments.',
      'Lead threat modeling, penetration test coordination, and remediation planning.',
      'Develop security policies, standards, and engineering guardrails.',
      'Advise client and internal teams on identity, network, and data protection controls.',
      'Support audit readiness for FedRAMP, SOC 2, and related frameworks.',
    ],
    requirements: [
      'CISSP, CCSP, or equivalent security certification preferred.',
      '10+ years in cybersecurity with cloud security specialization.',
      'Hands-on experience with AWS or Azure security services.',
      'FedRAMP, SOC 2, or similar compliance program experience.',
      'Excellent communication skills with technical and executive stakeholders.',
    ],
    publishedAt: new Date('2026-06-28T08:00:00Z'),
  },
] as const;

async function ensureCareerOpenings(organizationId: bigint) {
  let created = 0;
  for (const opening of CAREER_OPENING_SEED) {
    const existing = await prisma.careerOpening.findFirst({
      where: { slug: opening.slug, deletedAt: null },
      select: { id: true },
    });
    if (existing) continue;
    await prisma.careerOpening.create({
      data: {
        organizationId,
        title: opening.title,
        slug: opening.slug,
        skillCommunity: opening.skillCommunity,
        location: opening.location,
        remote: opening.remote,
        jobLevel: opening.jobLevel,
        experience: opening.experience,
        aboutRole: opening.aboutRole,
        responsibilities: [...opening.responsibilities],
        requirements: [...opening.requirements],
        status: 'PUBLISHED',
        publishedAt: opening.publishedAt,
      },
    });
    created += 1;
  }
  console.log(`Seeded ${created} career openings (${CAREER_OPENING_SEED.length} defined).`);
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

  await ensureCareerOpenings(orgId);

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
