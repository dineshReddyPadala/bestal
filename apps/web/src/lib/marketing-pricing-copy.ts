export const PRICING_HERO = {
  label: 'Pricing & Engagement Models',
  titleLines: [
    { text: 'Know the Talent.', em: false },
    { text: 'Know the Rate. Before You Decide.', em: true },
  ] as const,
  body: 'Every profile shows the hourly rate alongside assessment results, verification status, availability and working hours—so you can evaluate capability and cost together.',
  bullets: [
    'No hidden pricing conversations.',
    'No surprise markups.',
    'No waiting until the final stage to understand cost.',
  ],
  pillars: [
    { id: 'know-the-engineer', label: ` Know the engineer.`, em: false },
    { id: 'know-the-rate', label: 'Know the rate.', em: false },
    { id: 'before-you-decide', label: `Before you decide. `, em: false },
  ] as const,
};

export const PRICING_TECH_STACK = [
  { id: 'ai-ml', label: 'AI/ML' },
  { id: 'devops', label: 'DevOps & cloud' },
  { id: 'data-engineering', label: 'Data Engineering' },
  { id: 'full-stack', label: 'Full stack' },
  { id: 'salesforce', label: 'Salesforce' },
  { id: 'sap', label: 'SAP' },
] as const;

/** Profile includes list — exported separately so HMR cannot leave `.includes` undefined on `PRICING_TRANSPARENT`. */
export const PRICING_PROFILE_INCLUDES = [
  { id: 'hourly-rate', num: '01', label: 'Hourly Rate' },
  { id: 'assessment', num: '02', label: 'Assessment Insights' },
  { id: 'verification', num: '03', label: 'Verification Status' },
  { id: 'availability', num: '04', label: 'Availability' },
  { id: 'start-date', num: '05', label: 'Confirmed Start Date' },
  { id: 'expertise', num: '06', label: 'Technology Expertise' },
] as const;

export const PRICING_TRANSPARENT = {
  title: 'Transparent Pricing by Design',
  titleEm: 'Pricing should never be a surprise.',
  sideNote:
    'This allows hiring managers and technology leaders to evaluate capability, availability, and cost at the same time, enabling faster and more informed decisions.',
  panelLabel: "That's why every engineer profile includes:",
  includes: PRICING_PROFILE_INCLUDES,
} as const;

export const PRICING_RATE_BAND_SCALE = ['$0', '$20', '$30', '$40'] as const;

export const PRICING_RATE_BAND_SEGMENTS = [
  { id: 'under-20', label: 'Under $20', tone: 'dark' as const, flex: 1 },
  { id: '20-30', label: '$20–$30', tone: 'mid' as const, flex: 1 },
  { id: '30-40', label: '$30–$40', tone: 'light' as const, flex: 1 },
] as const;

export const PRICING_BANDS = {
  title: 'Typical Rate Bands',
  axisLabel: 'hourly rate',
  columns: [
    'The ranges above provide a general indication of the engineering talent available on the BesTal platform.',
    'Every engineer profile displays a transparent hourly rate alongside assessment insights, availability, and verification status, allowing you to evaluate talent and cost at the same time.',
  ] as const,
  scale: PRICING_RATE_BAND_SCALE,
  segments: PRICING_RATE_BAND_SEGMENTS,
} as const;

export const PRICING_FACTOR_ITEMS = [
  {
    num: '01',
    title: 'Skill and discipline',
    body: "Scarcity differs sharply. A GenAI engineer and a QA automation engineer aren't priced alike.",
  },
  {
    num: '02',
    title: 'Tested depth',
    body: 'What the test showed, not what the resume claimed.',
  },
  {
    num: '03',
    title: 'Certification',
    body: "Where it's genuinely load-bearing, as in SAP and ServiceNow.",
  },
  {
    num: '04',
    title: 'Scarcity',
    body: 'Real supply in that discipline at the depth you need.',
  },
  {
    num: '05',
    title: 'Start date',
    body: "Available-now senior engineers carry a premium. That's honest supply and demand.",
  },
  {
    num: '06',
    title: 'Time zone',
    body: "A full Pacific business day from India is a real quality-of-life cost, and it's priced accordingly.",
  },
] as const;

export const PRICING_FACTORS = {
  title: 'What sets a price',
  items: PRICING_FACTOR_ITEMS,
} as const;

export const PRICING_PERSPECTIVE_NOTES = [
  {
    id: 'cost-advantage',
    body: "Access to global engineering talent creates meaningful cost advantages for organizations, and we're transparent about that.",
  },
  {
    id: 'value',
    bodyLead: 'However, ',
    bodyEm: 'BesTal',
    bodyTail: " is not built around low rates. It's built around value.",
  },
] as const;

export const PRICING_PERSPECTIVE = {
  title: 'Our Perspective on Cost',
  notes: PRICING_PERSPECTIVE_NOTES,
  quoteLead: 'Our objective is to provide ',
  quoteEm: 'competitive rates without compromising on quality, transparency, or flexibility.',
  quoteSubtext:
    'We believe the best talent decisions come from balancing capability, reliability, transparency, and value.',
} as const;

export const PRICING_TRIAL_NAV = [
  { id: 'Evaluate', label: 'Evaluate' }
] as const;

export const PRICING_TRIAL_STEPS = [
  { num: '01', title: 'Technical Capability' },
  { num: '02', title: 'Communication Skills' },
  { num: '03', title: 'Collaboration Style' },
  { num: '04', title: 'Client Readiness' },
  { num: '05', title: 'Team Fit' },
] as const;

export const PRICING_TRIAL = {
  sectionNum: '01',
  title: 'Try Before You Commit',
  subtitleLead: "The best way to evaluate talent isn't through a resume. It's through ",
  subtitleEm: 'real work',
  subtitleTail: '.',
  ctaLabel: (hours: number) => `${hours}-Hour Free Trial`,
  ctaHref: '/try-for-a-week',
  nav: PRICING_TRIAL_NAV,
  steps: PRICING_TRIAL_STEPS,
  footnoteLead: 'Keep everything produced during the trial.',
  footnoteEm: 'No obligation to continue.',
} as const;

export const PRICING_FOOTER_CTA = {
  title: 'Ready to Build Your Team?',
  body: 'Access Pre-Vetted Talent with transparent pricing, verified profiles, and flexible engagement models.',
  primaryCta: 'Explore Pre-Vetted Talent',
  primaryHref: '/sample-talent',
  secondaryCta: 'Reach out to us',
  secondaryHref: '/reach-out',
  pillars: ['Remote Talent.', 'Your Time Zone.', 'Proven Before You Commit.'] as const,
} as const;
