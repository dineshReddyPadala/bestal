export const DEFAULT_TITLE = 'BesTal — Proven Talent. Ready to Perform.';

export const DEFAULT_DESCRIPTION =
  'Pre-vetted Talents who work your hours. See their test results, their rate and their start date up front — then try them free before you commit.';

export const PAGE_SEO = {
  home: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  howItWorks: {
    title: 'How BesTal Works — Screening, Evaluation, Verification, Engagement',
    description:
      'How a technology professional gets onto BesTal, and how you engage one: external evaluation, background verification, published rates, committed US time-zone overlap, and a one-week working engagement.',
  },
  sampleTalent: {
    title: 'Sample Talent Profiles — See a BesTal Evaluation Scorecard',
    description:
      'Complete example profiles in the production format: external evaluation scorecards, verification status, hourly rate, availability and US time-zone overlap. Fictional professionals, real structure.',
  },
  talent: {
    title: 'Sample Talent Profiles — See a BesTal Evaluation Scorecard',
    description:
      'Complete example profiles in the production format: external evaluation scorecards, verification status, hourly rate, availability and US time-zone overlap. Fictional professionals, real structure.',
  },
  evaluationStandard: {
    title: 'Our Evaluation Standard — How BesTal Assesses Technology Talent',
    description:
      'Five assessed dimensions, independent external evaluators, published scorecards including reservations. How BesTal\'s technical evaluation works and what the scores mean.',
  },
  trust: {
    title: 'Trust & Verification — How BesTal Verifies Identity and Competence',
    description:
      'Identity bound to assessment, independent education and employment checks, written exclusivity declarations, IP assigned at creation. What BesTal verifies and what it deliberately does not publish.',
  },
  rates: {
    title: 'How BesTal Pricing Works — Transparent Hourly Pricing',
    description:
      'Every profile shows the hourly client price before you shortlist. The seven factors that set it, what it includes, and why BesTal doesn\'t compete on being cheapest.',
  },
  tryForAWeek: {
    title: '20-Hour Trial — See Them Perform Before You Commit',
    description:
      'See test results, rate and start date up front, then try an engineer free. No recruiter calls, no sourcing cycle, no commitment for the first 10 hours.',
  },
  jobs: {
    title: 'Open Roles | BesTal',
    description:
      'Explore contract and permanent opportunities with BesTal enterprise clients across Data & AI, Cloud, SAP, ServiceNow, Salesforce, and security.',
  },
  communities: {
    title: 'Skill Communities | BesTal',
    description:
      'Specialist talent pools across Data & AI, Cloud, SAP, ServiceNow, Salesforce, Full Stack, and Cybersecurity — each profile includes evaluation and BGV evidence.',
  },
  enterprise: {
    title: 'Enterprise | BesTal',
    description:
      'Enterprise-grade talent acquisition with dedicated strategists, MSAs, background verification, and transparent scorecards for every shortlisted profile.',
  },
  about: {
    title: 'About Us | BesTal',
    description:
      'BesTal helps organizations build and scale their technology workforce with pre-vetted specialists, external evaluation scorecards, and transparent pricing before you interview.',
  },
  faq: {
    title: 'Frequently Asked Questions | BesTal',
    description:
      'Answers about BesTal — pre-vetted talent, team collaboration, onboarding, free trials, and engagement models. Can\'t find what you need? Email connect@bestal.co.',
  },
  contact: {
    title: 'Reach out to us | BesTal',
    description:
      'Tell BesTal what role you need, required skills, and timeline. Our talent team will match you with vetted engineers — test results and rates on every profile.',
  },
  forEngineers: {
    title: 'For Engineers | BesTal',
    description:
      'Get tested once by an outside specialist. Your results, rate, start date and US hours go on your profile — clients read the evidence before they contact you.',
  },
} as const;

export const MARKETING_ROUTES = [
  '/',
  '/how-it-works',
  '/sample-talent',
  '/talent',
  '/evaluation-standard',
  '/trust',
  '/rates',
  '/try-for-a-week',
  '/for-engineers',
  '/jobs',
  '/communities',
  '/enterprise',
  '/about',
  '/contact',
] as const;
