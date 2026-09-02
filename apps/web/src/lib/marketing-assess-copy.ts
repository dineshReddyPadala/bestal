export const ASSESS_HERO = {
  title: 'How We Assess Talent',
  subtitle: 'Objective evaluations designed to provide evidence before you commit.',
} as const;

export const ASSESS_PROCESS_STEPS = [
  {
    id: 'ai-assessment',
    num: '01',
    title: 'AI-Powered Assessment',
    body: 'Engineers complete a structured, role-specific assessment designed to evaluate practical capability within their discipline.',
  },
  {
    id: 'consistent-evaluation',
    num: '02',
    title: 'Consistent Evaluation',
    body: 'Every assessment follows the same evaluation framework so results are comparable across profiles and communities.',
  },
  {
    id: 'quality-review',
    num: '03',
    title: 'BesTal Quality Review',
    body: 'Assessment results undergo an internal quality review before anything is published to the platform.',
  },
  {
    id: 'published',
    num: '04',
    title: 'Assessment Published',
    body: 'Published profiles show assessment insights, verification status, rate, and availability — before you schedule a call.',
  },
] as const;

export const ASSESS_SPOTLIGHT = {
  titleHighlight: 'AI-Powered',
  titleRest: '. Human-Reviewed. Transparently Published.',
  body: 'Every assessment follows a consistent evaluation framework and undergoes a quality review before appearing on the BesTal platform.',
} as const;

export type AssessDimensionId =
  | 'technical-depth'
  | 'problem-solving'
  | 'collaboration'
  | 'communication'
  | 'client-readiness';

export const ASSESS_DIMENSIONS: ReadonlyArray<{
  id: AssessDimensionId;
  num: string;
  title: string;
  description: string;
  bullets: readonly string[];
}> = [
  {
    id: 'technical-depth',
    num: '01',
    title: 'Technical Depth',
    description:
      "We evaluate the engineer's knowledge, expertise, and practical experience within their area of specialization.",
    bullets: [
      'Technical proficiency',
      'Technology-specific knowledge',
      'Best practices',
      'Real-world application of skills',
    ],
  },
  {
    id: 'problem-solving',
    num: '02',
    title: 'Problem Solving',
    description:
      'We assess how engineers approach challenges, analyze requirements, and develop practical solutions.',
    bullets: [
      'Analytical thinking',
      'Structured problem-solving',
      'Decision making',
      'Solution design',
    ],
  },
  {
    id: 'collaboration',
    num: '03',
    title: 'Collaboration & Culture Fit',
    description:
      'Strong engineering delivery requires more than technical skills. Engineers must be able to collaborate effectively within existing teams and adapt to different ways of working.',
    bullets: [
      'Team collaboration',
      'Adaptability',
      'Professionalism',
      'Alignment with remote and distributed work environments',
    ],
  },
  {
    id: 'communication',
    num: '04',
    title: 'Communication Skills',
    description: 'Clear communication is essential for successful remote collaboration.',
    bullets: [
      'Clarity of thought',
      'Verbal communication',
      'Ability to explain technical concepts',
      'Stakeholder interaction',
    ],
  },
  {
    id: 'client-readiness',
    num: '05',
    title: 'Client Readiness',
    description:
      'We evaluate whether an engineer is prepared to contribute effectively in a client-facing environment.',
    bullets: [
      'Professional maturity',
      'Ownership and accountability',
      'Responsiveness',
      'Readiness to work within client teams and processes',
    ],
  },
];

export const ASSESS_WHAT_WE_ASSESS = {
  title: 'What We Assess',
  intro:
    'Our assessments go beyond technical skills. We evaluate the qualities that determine success in real-world client engagements: technical expertise, problem solving, collaboration, communication, and client readiness.',
} as const;

export const ASSESS_PREVETTED = {
  title: "What Does 'Pre-Vetted' Mean at BesTal?",
  intro:
    'At BesTal, Pre-Vetted means an engineer has completed a structured assessment process before being listed on the platform, an engineer is evaluated on Technical Depth, Problem Solving, Collaboration & Culture Fit, Communication Skills and Client Readiness',
  steps: [
    {
      id: 'structured',
      num: '01',
      title: 'Structured Assessment',
      body: 'Role-specific evaluation against published criteria within the engineer’s Skill Community.',
    },
    {
      id: 'review',
      num: '02',
      title: 'Technical Team Review',
      body: 'Assessment quality and consistency are reviewed before results are approved for publication.',
    },
    {
      id: 'insights',
      num: '03',
      title: 'Published Assessment Insights',
      body: 'Scores, summaries, and reservations are published so you can read the evidence before engaging.',
    },
    {
      id: 'profile',
      num: '04',
      title: 'Pre-Vetted Profile',
      body: 'Rate, availability, overlap hours, and verification status appear together on one profile.',
    },
  ],
  footer: [
    'Assessment results are reviewed by the BesTal technical team and then published on the engineer’s profile, together with verification status, availability and other relevant information.',
    'This gives clients visibility before engagement and helps reduce the guesswork typically associated with hiring remote talent.',
  ],
} as const;

export const ASSESS_VALIDATION = {
  title: 'Validation Through Real Work',
  intro:
    'Assessment predicts capability. The free trial confirms fit with your team, tools, and delivery expectations.',
  cards: [
    {
      id: 'team',
      num: '01',
      title: 'Your Team',
      body: 'Work alongside your engineers, attend stand-ups, and review output in your normal cadence.',
    },
    {
      id: 'environment',
      num: '02',
      title: 'Your Environment',
      body: 'Use your repos, tooling, and delivery process — not a synthetic take-home in isolation.',
    },
    {
      id: 'challenges',
      num: '03',
      title: 'Your Challenges',
      body: 'Direct the trial hours toward a real backlog item or scoped proof of capability.',
    },
    {
      id: 'hours',
      num: '04',
      title: 'Your Working Hours',
      body: 'Confirm overlap, responsiveness, and communication within the hours your team actually works.',
    },
  ],
} as const;

export const ASSESS_CTA = {
  title: "Because the best validation isn't an interview. It's working together.",
  button: 'Browse Pre-Vetted Talent',
} as const;
