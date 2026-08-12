export const DEFAULT_TITLE = 'BesTal — Proven Talent. Ready to Perform.';

export const DEFAULT_DESCRIPTION =
  "See the external evaluator's scorecard, background verification status, hourly rate and US time-zone overlap before you interview. Data & AI, Cloud, SAP, ServiceNow, Salesforce and security specialists.";

export const PAGE_SEO = {
  home: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  howItWorks: {
    title: 'How It Works | BesTal',
    description:
      'From role brief to pilot in four steps. Review evaluation scorecards, BGV status, and bill rates before you interview — then start a 20-hour pilot with no long-term obligation.',
  },
  talent: {
    title: 'Find Proven Talent | BesTal',
    description:
      'Browse vetted specialists with external evaluator scorecards, background verification status, hourly rates, and US time-zone overlap — before you interview.',
  },
  jobs: {
    title: 'Open Roles | BesTal',
    description:
      'Explore contract and permanent opportunities with BesTal enterprise clients across Data & AI, Cloud, SAP, ServiceNow, Salesforce, and security.',
  },
  communities: {
    title: 'Skill Communities | BesTal',
    description:
      'Specialist talent pools across Data & AI, Cloud, SAP, ServiceNow, Salesforce, Full Stack, and QA Automation — each profile includes evaluation and BGV evidence.',
  },
  enterprise: {
    title: 'Enterprise | BesTal',
    description:
      'Enterprise-grade talent acquisition with dedicated strategists, MSAs, background verification, and transparent scorecards for every shortlisted profile.',
  },
  about: {
    title: 'About BesTal',
    description:
      'BesTal connects enterprises with proven technology specialists. Every profile includes external evaluation scorecards, BGV status, and transparent pricing before you interview.',
  },
  contact: {
    title: 'Contact BesTal',
    description:
      'Tell us about your hiring needs. A BesTal talent strategist responds within one business day with matched profiles and evidence you can review before interviewing.',
  },
} as const;

export const MARKETING_ROUTES = [
  '/',
  '/how-it-works',
  '/talent',
  '/jobs',
  '/communities',
  '/enterprise',
  '/about',
  '/contact',
] as const;
