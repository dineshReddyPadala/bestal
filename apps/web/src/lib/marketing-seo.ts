import { publicJobs } from '@bestal/mock-data';

/** Public marketing origin. Apex `bestal.co` should 301 here at the CDN. */
export const SITE_ORIGIN = 'https://www.bestal.co';

export const DEFAULT_OG_IMAGE_PATH = '/og-image.png';

export const DEFAULT_OG_IMAGE_URL = `${SITE_ORIGIN}${DEFAULT_OG_IMAGE_PATH}`;

export const DEFAULT_TITLE = 'BesTal — Proven Talent. Ready to Perform.';

export const DEFAULT_DESCRIPTION =
  'Pre-Vetted Talent who work your hours. See their test results, their rate and their start date up front — then try them free before you commit.';

export function canonicalUrlForPath(pathname: string): string {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (normalized === '/') return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${normalized.replace(/\/+$/, '')}`;
}

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
    title: 'How we assess — How BesTal Assesses Technology Talent',
    description:
      'Five assessed dimensions, independent external evaluators, published scorecards including reservations. How BesTal\'s technical evaluation works and what the scores mean.',
  },
  trust: {
    title: 'Trust & Verification — How BesTal Verifies Identity and Competence',
    description:
      'Trust at the core of every BesTal engagement — professional verification, structured assessment, and engagement protections before talent joins your team.',
  },
  rates: {
    title: 'How BesTal Pricing Works — Transparent Hourly Pricing',
    description:
      'Every profile shows the hourly client price before you shortlist. The seven factors that set it, what it includes, and why BesTal doesn\'t compete on being cheapest.',
  },
  tryForAWeek: {
    title: 'Free Trial — See Them Perform Before You Commit',
    description:
      'See test results, rate and start date up front, then try an engineer free. No recruiter calls, no sourcing cycle, no commitment for the free trial period.',
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
      'BesTal helps organizations build and scale their technology workforce with Pre-Vetted specialists, external evaluation scorecards, and transparent pricing before you interview.',
  },
  faq: {
    title: 'Frequently Asked Questions | BesTal',
    description:
      'Answers about BesTal — Pre-Vetted Talent, team collaboration, onboarding, free trials, and engagement models. Can\'t find what you need? Email connect@bestal.co.',
  },
  contact: {
    title: 'Talk to us | BesTal',
    description:
      'Contact BesTal for sales, support, partnerships, or investor inquiries. We reply within one business day.',
  },
  reachOut: {
    title: 'Reach out to us | BesTal',
    description:
      'Tell BesTal what role you need, required skills, and timeline. Our talent team will match you with vetted engineers — test results and rates on every profile.',
  },
  careers: {
    title: 'Careers | BesTal',
    description:
      'Explore opportunities at BesTal — innovation, excellence, and inclusive culture. View current openings and join our technology team.',
  },
  forEngineers: {
    title: 'For Engineers | BesTal',
    description:
      'Get tested once by AI-Assessed. BesTal-reviewed. Your results, rate, start date and US hours go on your profile — clients read the evidence before they contact you.',
  },
  privacyPolicy: {
    title: 'Privacy Policy | BesTal',
    description:
      'How BesTal collects, uses, discloses, and safeguards personal information when you visit our website or use our platform.',
  },
  termsOfService: {
    title: 'Terms of Service | BesTal',
    description:
      'Terms governing your access to and use of the BesTal website, platform, and related services.',
  },
  freeTrialTerms: {
    title: 'Free Trial Terms | BesTal',
    description:
      'Terms and conditions for the BesTal Free Trial Program — scope, evaluation purpose, work product, and engagement rules.',
  },
  cookiePolicy: {
    title: 'Cookie Policy | BesTal',
    description:
      'How BesTal uses cookies and similar technologies on our website, and how you can manage your cookie preferences.',
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
  '/faq',
  '/privacy-policy',
  '/terms-of-service',
  '/free-trial-terms',
  '/cookie-policy',
  '/contact',
  '/reach-out',
  '/careers',
  ...publicJobs.map((job) => `/careers/${job.slug}` as const),
] as const;
