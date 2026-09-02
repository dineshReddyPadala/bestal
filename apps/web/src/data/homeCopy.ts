/**
 * SECTION A — CEO-APPROVED COPY DECK. VERBATIM. DO NOT EDIT.
 * SECTION B — NEW / SUGGESTED CONTENT. DRAFT, PENDING CEO APPROVAL.
 * Written only where the Copy Deck left a gap. Nothing in Section B overwrites Section A.
 * [FACT: ...] marks a claim that must be confirmed before publish.
 */

export type EvidencePoint = { title: string; body: string };
export type Community = { name: string };
export type Block = { title: string };
export type Step = { number: string; title: string };

// ============================================================================
// SECTION A — CEO-APPROVED COPY DECK. VERBATIM. DO NOT EDIT.
// ============================================================================

export const hero = {
  h1: 'Proven Talent. Ready to Perform.',
  sub: 'Pre-Vetted Technology Professionals, assessed by external specialists and background verified. See the scorecard, the hourly rate, the availability and the hours they overlap with your team — before you schedule a single interview.',
  primaryCta: 'Find Talent',
  secondaryCta: 'See a sample scorecard',
  micro: 'No recruiter call required to see any of it.',
};

export const evidence: EvidencePoint[] = [
  {
    title: 'Expert Evaluated',
    body: 'A qualified external specialist tested them against role-specific criteria. You read the scorecard.',
  },
  {
    title: 'Background Verified',
    body: 'Identity, education and employment checked before the profile goes live. Status shown; documents never shared.',
  },
  {
    title: 'Your Working Hours',
    body: 'Overlap hours shown per US zone and committed in writing. Filterable.',
  },
  {
    title: 'Transparent Rate',
    body: 'The hourly rate is on the profile. Before you shortlist — not after a call.',
  },
  {
    title: 'Availability, Stated',
    body: "Immediate, one week, two weeks or 30 days. It's a filter, not a promise.",
  },
  {
    title: 'One-Week Proof',
    body: 'Engage for a week on real work before committing to anything longer.',
  },
];

export const differentiation = {
  h2: 'Everyone claims the top 3%. We show you the test.',
  link: 'How we assess',
};

export const skillCommunities = {
  h2: 'Specialists, organised by discipline',
  intro:
    'BesTal is not a general resume database. Every professional belongs to a Skill Community with its own assessment criteria and its own external evaluators.',
  button: 'Browse all Skill Communities',
  items: [
    { name: 'Data & AI' },
    { name: 'Cloud & Platform' },
    { name: 'Full Stack & Engineering' },
    { name: 'SAP' },
    { name: 'ServiceNow' },
    { name: 'Salesforce' },
    { name: 'Cybersecurity' },
  ] as Community[],
};

export const timeZone = {
  h2: '"Flexible hours" is not an answer.',
  button: 'Browse by time-zone overlap',
  blocks: [
    { title: 'Filter by the overlap you need' },
    { title: 'Committed, not estimated' },
    { title: 'Every US zone, shown separately' },
  ] as Block[],
};

export const liveProfile = {
  h2: 'This is what a profile looks like',
  sub: 'Not a summary of a profile. The profile.',
  caption: 'Sample Profile',
  button: 'See more sample talent',
};

export const howItWorks = {
  h2: 'Five steps. No sourcing cycle.',
  link: 'How it works in detail',
  steps: [
    { number: '01', title: 'Describe the requirement' },
    { number: '02', title: 'Review the evidence' },
    { number: '03', title: 'Interview whoever you want' },
    { number: '04', title: 'Run a one-week working engagement' },
    { number: '05', title: 'Continue, scale, or stop' },
  ] as Step[],
};

export const trial = {
  h2: "Don't hire from a resume. See them perform.",
  link: 'How the one-week engagement works',
};

export const scale = {
  h2: 'Scale without carrying bench',
};

export const buyerQuestions = {
  h2: 'The questions we built this platform to answer',
  closing: 'Every one of these is answerable on a profile page, without a call.',
};

export const finalCta = {
  h2: 'Start with the evidence.',
  body: "Browse the Skill Communities, or describe your requirement and we'll match against it.",
  primaryCta: 'Find Talent',
  secondaryCta: 'Describe Your Requirement',
};

export const footer = {
  tagline:
    'Evaluated, verified and priced before you interview — with a committed working window in your time zone.',
  legalLine: `© ${new Date().getFullYear()} BesTal. All rights reserved.`,
};

// ============================================================================
// SECTION B — NEW / SUGGESTED CONTENT. DRAFT, PENDING CEO APPROVAL.
// Written only where the Copy Deck left a gap. Nothing here overwrites
// Section A. [FACT: ...] marks a claim that must be confirmed before publish.
// ============================================================================

export const navDraft = {
  links: [
    { label: 'Home', href: '#top' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Find Talent', href: '#live-profile' },
    { label: 'Skill Communities', href: '#skill-communities' },
    { label: 'Time-Zone Overlap', href: '#time-zone' },
    { label: 'Enterprise', href: '#enterprise' },
    { label: 'About', href: '#differentiation' },
  ],
  signIn: 'Sign In',
  postAJob: 'Post a Job',
};

export const differentiationDraft = {
  body: 'Percentile claims are unverifiable by design. BesTal replaces them with an evaluation record you can read: who assessed the professional, what they were assessed against, how they scored on each criterion, and when the assessment took place. Evaluators are external specialists working in the same discipline, and they are not compensated on placement outcomes. If the evidence does not convince you, the profile has done its job.',
};

export const skillCommunitiesDraft: Record<string, string> = {
  'Data & AI':
    'Data engineering, analytics, machine learning and applied AI. Assessed on pipeline design, model evaluation and production data quality.',
  'Cloud & Platform':
    'Cloud architecture, platform engineering, DevOps and SRE. Assessed on infrastructure design, automation and operational reliability.',
  'Full Stack & Engineering':
    'Front-end, back-end and full stack product engineering. Assessed on system design, code quality and delivery inside existing codebases.',
  SAP: 'Functional and technical capability across core modules and S/4HANA programmes. Assessed on configuration, integration and migration work.',
  ServiceNow:
    'Implementation, development and administration across ITSM and adjacent workflows. Assessed on configuration, scripting and platform governance.',
  Salesforce:
    'Administration, development and solution architecture on the Salesforce platform. Assessed on data model design, automation and release practice.',
  Cybersecurity:
    'Security engineering, cloud security, identity and governance. Assessed on threat modelling, control design and incident readiness.',
};

export const timeZoneDraft = {
  body: 'Distributed delivery fails on the hours, not the skills. Every BesTal profile states the hours the professional will be online against your team’s zone, so overlap is something you filter for and hold people to — not something you discover in week three.',
  blocks: {
    'Filter by the overlap you need':
      'Set the minimum number of overlapping hours your team needs and see only the professionals who meet it.',
    'Committed, not estimated':
      'The stated working window forms part of the engagement terms, not an informal preference.',
    'Every US zone, shown separately':
      'Overlap is shown for Eastern, Central, Mountain and Pacific individually, so you are never reading an average.',
  } as Record<string, string>,
};

export const howItWorksDraft: Record<string, string> = {
  '01': 'Tell us the skills, seniority, overlap hours and start date you need. No intake call is required to begin.',
  '02': 'Open the matching profiles and read the evaluation scorecard, verification status, hourly rate and availability side by side.',
  '03': 'Shortlist from evidence rather than volume, then interview as many or as few people as you want. Scheduling is handled for you.',
  '04': 'Bring the professional onto a defined piece of real work, inside your tools and your delivery process, with scope agreed in advance.',
  '05': 'Extend the engagement, add capacity from the same Skill Community, or close it out at the end of the week.',
};

export const trialDraft = {
  body: 'A resume describes work you cannot inspect, and an interview tests how someone talks about work rather than how they do it. The one-week engagement puts the professional on a defined piece of your real backlog, inside your tools and your process, with scope and rate agreed before day one. At the end of the week you have something better than a hiring opinion: delivered work, reviewed by your own team.',
};

export const scaleDraft = {
  body: 'Capacity is drawn from the Skill Community when the work requires it and released when it does not. There is no bench to underwrite, no minimum headcount to maintain and no annual platform commitment. Rates are hourly and visible before you engage, so a second or third professional costs exactly what the profile said it would.',
};

export const enterpriseDraft = {
  eyebrow: 'Enterprise',
  h2: 'Built for how enterprises actually buy',
  intro:
    'Evidence gets a professional onto your shortlist. Procurement, security and delivery governance are what get them onto your programme.',
  items: [
    {
      title: 'Security and data handling',
      body: 'Verification documentation stays inside BesTal. Clients see the verification status on the profile, never the underlying personal documents. [FACT: confirm hosting region, encryption standards and any certifications — e.g. ISO 27001, SOC 2 — before publishing.]',
    },
    {
      title: 'Confidentiality and IP',
      body: 'Every engagement, including the one-week engagement, runs under written confidentiality and intellectual property assignment terms. [FACT: confirm the contracting mechanism and whether client paper can be used.]',
    },
    {
      title: 'Governance and visibility',
      body: 'The committed working window, the agreed scope and approved timesheets give delivery and procurement leads one record of what was agreed and what was worked.',
    },
    {
      title: 'Continuity and replacement',
      body: 'If an engagement ends early, replacement capacity is drawn from the same Skill Community, assessed against the same criteria. [FACT: confirm the replacement window and associated commercial terms.]',
    },
  ],
};

export const buyerQuestionsDraft = [
  {
    question: 'Who evaluated this person, and against what criteria?',
    answer:
      'The scorecard names the external specialist, the discipline they assessed, the criteria used and the date of the assessment.',
  },
  {
    question: 'What was actually verified — identity, education, employment?',
    answer:
      'All three are checked before a profile goes live. The profile shows what was verified and when; the underlying documents are never shared.',
  },
  {
    question: 'What will this cost per hour, before I speak to anyone?',
    answer: 'The hourly rate is published on the profile and does not change after an interview.',
  },
  {
    question: 'How many hours will they overlap with my team, and is that committed?',
    answer:
      'The profile states the overlap in hours against each US zone, and that window forms part of the engagement terms.',
  },
  {
    question: 'When can they realistically start?',
    answer:
      'Availability is stated as immediate, one week, two weeks or 30 days, and can be filtered on before you shortlist.',
  },
  {
    question: 'Can I see the work before committing to a longer contract?',
    answer:
      'That is the purpose of the one-week working engagement: real work, your process, reviewed by your team.',
  },
  {
    question: "What happens if the engagement isn't working?",
    answer:
      'You can close out at the end of the one-week engagement without a longer commitment. [FACT: confirm notice and replacement terms for engagements that continue beyond the first week.]',
  },
  {
    question: 'How quickly can I add a second or third person with the same skills?',
    answer:
      'The same Skill Community shows other professionals assessed against the same criteria, with rate, availability and overlap already visible. [FACT: confirm typical time to add additional capacity.]',
  },
];

export const footerDraft = {
  columns: [
    {
      heading: 'Platform',
      links: ['Find Talent', 'Skill Communities', 'How It Works', 'Time-Zone Overlap', 'Post a Job'],
    },
    { heading: 'Company', links: ['About', 'How we assess', 'Enterprise', 'Contact us'] },
    { heading: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Free Trial Terms', 'Cookie Policy'] },
  ],
};

export const images = {
  hero: '/home-hero.jpg',
  cta: '/dd32bec6-6050-435f-87a9-48ec1374c8ef.jpg',
  avatar: '/home-avatar.jpg',
};

export const howweassesscta = {
  hero: '/how_it_assess_cta.png',
  cta: '/how_it_assess_cta.png',
};

export const aboutcta = {
  hero: '/home-hero.jpg',
  cta: '/about_us_horizonal_img.jpg',
};

export const howitassesscta = {
  hero: '/home-hero.jpg',
  cta: '/team-working-together-project (2).jpg',
};