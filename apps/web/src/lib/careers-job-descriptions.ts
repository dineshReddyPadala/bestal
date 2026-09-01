import type { PublicJob } from '@bestal/mock-data';

export type CareersJobDescriptionDetail = {
  whoWeAre: string;
  jobLevel: string;
  experience: string;
  aboutRole: string;
  responsibilities: readonly string[];
  requirements: readonly string[];
};

export const CAREERS_WHO_WE_ARE =
  'BesTal is a technology talent platform that helps enterprises hire pre-vetted engineers with proven scorecards, transparent rates, and overlap in US time zones. Our teams design and deploy enterprise solutions that are robust, secure, and scalable — across cloud, data, full-stack, and security disciplines.';

const CAREERS_JOB_DETAILS: Record<string, CareersJobDescriptionDetail> = {
  'senior-full-stack-engineer-react-node': {
    whoWeAre: CAREERS_WHO_WE_ARE,
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
  },
  'staff-devops-engineer': {
    whoWeAre: CAREERS_WHO_WE_ARE,
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
  },
  'principal-data-engineer': {
    whoWeAre: CAREERS_WHO_WE_ARE,
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
  },
  'senior-machine-learning-engineer': {
    whoWeAre: CAREERS_WHO_WE_ARE,
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
  },
  'lead-mobile-engineer': {
    whoWeAre: CAREERS_WHO_WE_ARE,
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
  },
  'security-architect': {
    whoWeAre: CAREERS_WHO_WE_ARE,
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
  },
};

export type CareersJobDescription = CareersJobDescriptionDetail & {
  title: string;
  location: string;
};

export function formatCareersJobLocation(job: Pick<PublicJob, 'location' | 'remote'>): string {
  return job.remote ? `${job.location} · Remote` : job.location;
}

export function getCareersJobDescription(job: PublicJob): CareersJobDescription {
  const detail = CAREERS_JOB_DETAILS[job.slug];

  if (detail) {
    return {
      title: job.title,
      location: formatCareersJobLocation(job),
      ...detail,
    };
  }

  return {
    title: job.title,
    location: formatCareersJobLocation(job),
    whoWeAre: CAREERS_WHO_WE_ARE,
    jobLevel: 'Open level',
    experience: 'Relevant experience required',
    aboutRole: job.description,
    responsibilities: [
      'Deliver high-quality work aligned with team and client goals.',
      'Collaborate with cross-functional partners to ship on schedule.',
      'Contribute to code quality, documentation, and continuous improvement.',
    ],
    requirements: [...job.requirements],
  };
}
