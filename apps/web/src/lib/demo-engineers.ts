/** Fictional demo engineers — aligned with prototype data/engineers.ts */

import { resolveMarketingTimezone } from './marketing-timezone';

export type ScoreRow = {
  label: string;
  value: number;
  tone: 'teal' | 'gold';
};

export type DemoEngineerGender = 'female' | 'male';

const FEMALE_FIRST_NAME_HINTS = new Set([
  'amanda',
  'anita',
  'divya',
  'emily',
  'jaya',
  'jessica',
  'kavita',
  'lakshmi',
  'maria',
  'neha',
  'priya',
  'sarah',
  'shiva',
  'sneha',
]);

/** Infer avatar gender from the first token of a display name. */
export function inferGenderFromName(name: string): DemoEngineerGender {
  const firstToken = name.trim().split(/[\s.]+/)[0]?.toLowerCase() ?? '';
  if (!firstToken) return 'male';
  return FEMALE_FIRST_NAME_HINTS.has(firstToken) ? 'female' : 'male';
}

export type DemoEngineer = {
  id: string;
  initials: string;
  name: string;
  role: string;
  discipline: string;
  gender: DemoEngineerGender;
  experience: string;
  location: string;
  meta: string;
  rate: number;
  skills: string[];
  zoneLabel: string;
  zoneHours: string;
  timezone: string;
  timezoneDetail: string;
  score: number;
  dimensions: ScoreRow[];
  quote: string;
  quoteIsPlaceholder: boolean;
  evaluation: string;
  testedOn: string;
  availability: string;
  availabilityWeeks: number;
  confirmed: string;
  trialEligible: boolean;
  previousCompany?: string | null;
};

const PLACEHOLDER_NOTE =
  '[PLACEHOLDER: tester note pending — retains structure of a scored, written evaluation from an outside specialist.]';

const ENGINEER_PREVIOUS_COMPANIES: Partial<Record<string, string>> = {
  'jessica-m': 'Microsoft',
  'emily-r': 'Snowflake',
  'michael-t': 'CTS',
  'david-w': 'Deloitte',
  'amanda-l': 'Accenture',
  'james-h': 'CrowdStrike',
  'rahul-k': 'Google',
  'arjun-t': 'Meta',
  'vikram-r': 'Salesforce',
  'lakshmi-v': 'Oracle',
  'divya-k': 'Capgemini',
  'shiva-g': 'Atlassian',
  'sai-k': 'Amazon',
  'saran-p': 'Uber',
  'jaya-k': 'Stripe',
  'prashanth-k': 'Nvidia',
};

function engineer(
  data: Omit<
    DemoEngineer,
    'meta' | 'timezoneDetail' | 'evaluation' | 'trialEligible' | 'zoneLabel' | 'zoneHours'
  > & { trialEligible?: boolean },
): DemoEngineer {
  const timezoneMeta = resolveMarketingTimezone(data.timezone);
  return {
    ...data,
    zoneLabel: timezoneMeta.zoneLabel,
    zoneHours: timezoneMeta.zoneHours,
    meta: `${data.experience} · ${data.location}`,
    timezoneDetail: timezoneMeta.zoneHours,
    evaluation: data.quote,
    trialEligible: data.trialEligible ?? true,
    previousCompany: ENGINEER_PREVIOUS_COMPANIES[data.id] ?? data.previousCompany ?? null,
  };
}

export const DEMO_ENGINEERS: DemoEngineer[] = [
  engineer({
    id: 'jessica-m',
    initials: 'JM',
    name: 'Jessica M',
    role: 'Senior Backend Engineer',
    discipline: 'Full Stack & Engineering',
    gender: 'female',
    experience: '9 years',
    location: 'Seattle, WA',
    rate: 35,
    skills: ['Java', 'Spring Boot'],
    timezone: 'America/Los_Angeles',
    score: 93,
    dimensions: [
      { label: 'Technical depth', value: 9.5, tone: 'teal' },
      { label: 'Problem solving', value: 9.2, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 9.4, tone: 'teal' },
      { label: 'Client readiness score', value: 9.1, tone: 'teal' },
      { label: 'Communication score', value: 8.9, tone: 'teal' },
    ],
    quote:
      'Designed a resilient order-processing service under load-test conditions. Clear trade-offs on idempotency, back-pressure, and observability.',
    quoteIsPlaceholder: false,
    testedOn: 'Mar 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 2 days ago',
  }),
  engineer({
    id: 'emily-r',
    initials: 'ER',
    name: 'Emily R',
    role: 'Senior Data Engineer',
    discipline: 'Data & AI',
    gender: 'female',
    experience: '8 years',
    location: 'Austin, TX',
    rate: 35,
    skills: ['Snowflake', 'Databricks'],
    timezone: 'America/Chicago',
    score: 91,
    dimensions: [
      { label: 'Technical depth', value: 9.4, tone: 'teal' },
      { label: 'Problem solving', value: 9, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 9.2, tone: 'teal' },
      { label: 'Client readiness score', value: 8.9, tone: 'gold' },
      { label: 'Communication score', value: 8.8, tone: 'gold' },
    ],
    quote:
      'Strong dimensional modelling and cost reasoning on Snowflake. Explained clustering trade-offs unprompted. Reservation: limited exposure to streaming ingestion at scale.',
    quoteIsPlaceholder: false,
    testedOn: 'Mar 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 6 hours ago',
  }),
  engineer({
    id: 'david-w',
    initials: 'DW',
    name: 'David W',
    role: 'ABAP Consultant',
    discipline: 'SAP',
    gender: 'male',
    experience: '11 years',
    location: 'Atlanta, GA',
    rate: 40,
    skills: ['ABAP', 'S/4HANA'],
    timezone: 'America/New_York',
    score: 90,
    dimensions: [
      { label: 'Technical depth', value: 9.3, tone: 'teal' },
      { label: 'Problem solving', value: 8.8, tone: 'gold' },
      { label: 'Collaboration & Cultural Fit', value: 9, tone: 'teal' },
      { label: 'Client readiness score', value: 8.7, tone: 'gold' },
      { label: 'Communication score', value: 9.1, tone: 'teal' },
    ],
    quote:
      'Mapped a clean-core extension approach for a finance close workflow. Strong on CDS performance and release governance.',
    quoteIsPlaceholder: false,
    testedOn: 'Feb 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 3 days ago',
  }),
  engineer({
    id: 'rahul-k',
    initials: 'RK',
    name: 'Rahul.K',
    role: 'ML Engineer',
    discipline: 'Data & AI',
    gender: 'male',
    experience: '6 years',
    location: 'Bengaluru, India',
    rate: 23,
    skills: ['PyTorch', 'RAG', 'MLOps', 'LangChain', 'Python'],
    timezone: 'Asia/Kolkata',
    score: 89,
    dimensions: [
      { label: 'Technical depth', value: 9.1, tone: 'teal' },
      { label: 'Problem solving', value: 9.3, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 8.6, tone: 'gold' },
      { label: 'Client readiness score', value: 8.8, tone: 'gold' },
      { label: 'Communication score', value: 8.7, tone: 'gold' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Feb 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 11 hours ago',
  }),
  engineer({
    id: 'arjun-t',
    initials: 'AT',
    name: 'Arjun.T',
    role: 'Senior Frontend Engineer',
    discipline: 'Full Stack & Engineering',
    gender: 'male',
    experience: '8 years',
    location: 'Kochi, India',
    rate: 23,
    skills: ['React', 'TypeScript', 'Next.js', 'Design Systems', 'Accessibility'],
    timezone: 'Asia/Singapore',
    score: 88,
    dimensions: [
      { label: 'Technical depth', value: 8.9, tone: 'teal' },
      { label: 'Problem solving', value: 8.7, tone: 'gold' },
      { label: 'Collaboration & Cultural Fit', value: 8.8, tone: 'gold' },
      { label: 'Client readiness score', value: 9, tone: 'teal' },
      { label: 'Communication score', value: 8.8, tone: 'gold' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Mar 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 9 hours ago',
  }),
  engineer({
    id: 'vikram-r',
    initials: 'VR',
    name: 'Vikram.R',
    role: 'QA Automation Engineer',
    discipline: 'Full Stack & Engineering',
    gender: 'male',
    experience: '7 years',
    location: 'Chennai, India',
    rate: 23,
    skills: ['Playwright', 'Selenium', 'TypeScript', 'CI/CD', 'API Testing'],
    timezone: 'Europe/London',
    score: 86,
    dimensions: [
      { label: 'Technical depth', value: 8.7, tone: 'gold' },
      { label: 'Problem solving', value: 8.5, tone: 'gold' },
      { label: 'Collaboration & Cultural Fit', value: 8.2, tone: 'gold' },
      { label: 'Client readiness score', value: 8.9, tone: 'teal' },
      { label: 'Communication score', value: 8.6, tone: 'gold' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Jan 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 1 day ago',
  }),
  engineer({
    id: 'michael-t',
    initials: 'MT',
    name: 'Michael T',
    role: 'Senior Cloud Architect',
    discipline: 'Cloud & Platform',
    gender: 'male',
    experience: '10 years',
    location: 'Dallas, TX',
    rate: 38,
    skills: ['AWS', 'Kubernetes'],
    timezone: 'America/Chicago',
    score: 92,
    dimensions: [
      { label: 'Technical depth', value: 9.3, tone: 'teal' },
      { label: 'Problem solving', value: 9.1, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 9.5, tone: 'teal' },
      { label: 'Client readiness score', value: 8.8, tone: 'gold' },
      { label: 'Communication score', value: 9, tone: 'teal' },
    ],
    quote:
      'Produced a multi-account landing zone design with clear guardrails for networking, identity, and cost controls. Practical on day-two operations.',
    quoteIsPlaceholder: false,
    testedOn: 'Mar 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 1 day ago',
  }),
  engineer({
    id: 'amanda-l',
    initials: 'AL',
    name: 'Amanda L',
    role: 'ServiceNow Developer',
    discipline: 'ServiceNow',
    gender: 'female',
    experience: '5 years',
    location: 'Chicago, IL',
    rate: 22,
    skills: ['ITSM', 'ITOM'],
    timezone: 'America/Chicago',
    score: 90,
    dimensions: [
      { label: 'Technical depth', value: 9.2, tone: 'teal' },
      { label: 'Problem solving', value: 8.9, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 8.8, tone: 'gold' },
      { label: 'Client readiness score', value: 8.7, tone: 'gold' },
      { label: 'Communication score', value: 9, tone: 'teal' },
    ],
    quote:
      'Built an incident workflow with clean CMDB dependencies and measurable SLA routing. Comfortable explaining platform limits to stakeholders.',
    quoteIsPlaceholder: false,
    testedOn: 'Feb 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 8 hours ago',
  }),
  engineer({
    id: 'lakshmi-v',
    initials: 'LV',
    name: 'Lakshmi.V',
    role: 'Salesforce Developer',
    discipline: 'Salesforce',
    gender: 'female',
    experience: '8 years',
    location: 'Hyderabad, India',
    rate: 23,
    skills: ['Apex', 'LWC', 'Flow', 'Service Cloud', 'Integration'],
    timezone: 'Australia/Sydney',
    score: 89,
    dimensions: [
      { label: 'Technical depth', value: 9, tone: 'teal' },
      { label: 'Problem solving', value: 8.8, tone: 'gold' },
      { label: 'Collaboration & Cultural Fit', value: 8.7, tone: 'gold' },
      { label: 'Client readiness score', value: 8.9, tone: 'teal' },
      { label: 'Communication score', value: 9.1, tone: 'teal' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Mar 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 2 days ago',
  }),
  engineer({
    id: 'james-h',
    initials: 'JH',
    name: 'James H',
    role: 'Sr Security Specialist',
    discipline: 'Cybersecurity',
    gender: 'male',
    experience: '9 years',
    location: 'Phoenix, AZ',
    rate: 35,
    skills: ['SIEM', 'IAM'],
    timezone: 'UTC',
    score: 91,
    dimensions: [
      { label: 'Technical depth', value: 9.4, tone: 'teal' },
      { label: 'Problem solving', value: 9.2, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 9, tone: 'teal' },
      { label: 'Client readiness score', value: 8.8, tone: 'gold' },
      { label: 'Communication score', value: 8.9, tone: 'teal' },
    ],
    quote:
      'Walked through a cloud detection pipeline and IAM hardening plan with clear prioritization. Strong on communicating risk in business terms.',
    quoteIsPlaceholder: false,
    testedOn: 'Mar 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 5 hours ago',
  }),
  engineer({
    id: 'divya-k',
    initials: 'DK',
    name: 'Divya K',
    role: 'QA Specialist',
    discipline: 'QA Automation',
    gender: 'female',
    experience: '5 years',
    location: 'San Francisco, CA',
    rate: 20,
    skills: ['Selenium', 'Test Automation', 'Performance Testing'],
    timezone: 'America/Los_Angeles',
    score: 90,
    dimensions: [
      { label: 'Technical depth', value: 9, tone: 'teal' },
      { label: 'Problem solving', value: 8.8, tone: 'gold' },
      { label: 'Collaboration & Cultural Fit', value: 8.9, tone: 'teal' },
      { label: 'Client readiness score', value: 8.7, tone: 'gold' },
      { label: 'Communication score', value: 8.8, tone: 'gold' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Mar 2026',
    availability: 'Available in 5 days',
    availabilityWeeks: 1,
    confirmed: 'Confirmed 1 day ago',
  }),
  engineer({
    id: 'shiva-g',
    initials: 'SG',
    name: 'Shiva G',
    role: 'Frontend Engineer',
    discipline: 'Frontend',
    gender: 'male',
    experience: '4 years',
    location: 'New York, NY',
    rate: 22,
    skills: ['Frontend Development', 'React & Angular', 'UI/UX Engineering'],
    timezone: 'America/New_York',
    score: 91,
    dimensions: [
      { label: 'Technical depth', value: 9.1, tone: 'teal' },
      { label: 'Problem solving', value: 9, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 9.2, tone: 'teal' },
      { label: 'Client readiness score', value: 8.9, tone: 'teal' },
      { label: 'Communication score', value: 9, tone: 'teal' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Mar 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 4 hours ago',
  }),
  engineer({
    id: 'sai-k',
    initials: 'SK',
    name: 'Sai K',
    role: 'Data Engineer',
    discipline: 'Data Engineering',
    gender: 'male',
    experience: '5.4 years',
    location: 'Dallas, TX',
    rate: 22,
    skills: ['Data Engineering', 'Cloud Data Platforms', 'ETL & Data Pipelines'],
    timezone: 'America/Chicago',
    score: 92,
    dimensions: [
      { label: 'Technical depth', value: 9.2, tone: 'teal' },
      { label: 'Problem solving', value: 9.1, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 9, tone: 'teal' },
      { label: 'Client readiness score', value: 8.9, tone: 'teal' },
      { label: 'Communication score', value: 8.8, tone: 'gold' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Mar 2026',
    availability: 'Available in 3 days',
    availabilityWeeks: 1,
    confirmed: 'Confirmed 6 hours ago',
  }),
  engineer({
    id: 'saran-p',
    initials: 'SP',
    name: 'Saran P',
    role: 'Mobile Application developer',
    discipline: 'Mobile Development',
    gender: 'male',
    experience: '4 years',
    location: 'Boston, MA',
    rate: 20,
    skills: ['Mobile App Development', 'Flutter & React Native', 'Cross-Platform Architecture'],
    timezone: 'America/New_York',
    score: 90,
    dimensions: [
      { label: 'Technical depth', value: 9, tone: 'teal' },
      { label: 'Problem solving', value: 8.9, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 8.8, tone: 'gold' },
      { label: 'Client readiness score', value: 8.9, tone: 'teal' },
      { label: 'Communication score', value: 8.7, tone: 'gold' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Mar 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 2 days ago',
  }),
  engineer({
    id: 'jaya-k',
    initials: 'JK',
    name: 'Jaya K',
    role: 'Fullstack Engineer',
    discipline: 'Full Stack',
    gender: 'female',
    experience: '3.6 years',
    location: 'Portland, OR',
    rate: 22,
    skills: ['Backend Development', 'API Engineering', 'Cloud Solutions'],
    timezone: 'America/Los_Angeles',
    score: 90,
    dimensions: [
      { label: 'Technical depth', value: 8.9, tone: 'teal' },
      { label: 'Problem solving', value: 8.8, tone: 'gold' },
      { label: 'Collaboration & Cultural Fit', value: 9, tone: 'teal' },
      { label: 'Client readiness score', value: 8.8, tone: 'gold' },
      { label: 'Communication score', value: 8.9, tone: 'teal' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Mar 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 7 hours ago',
  }),
  engineer({
    id: 'prashanth-k',
    initials: 'PK',
    name: 'Prashanth K',
    role: 'Senior Data Engineer',
    discipline: 'Machine Learning',
    gender: 'male',
    experience: '6.7 years',
    location: 'Chicago, IL',
    rate: 35,
    skills: ['Generative AI', 'Agentic AI', 'Machine Learning'],
    timezone: 'America/Chicago',
    score: 90,
    dimensions: [
      { label: 'Technical depth', value: 9.1, tone: 'teal' },
      { label: 'Problem solving', value: 9, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 8.9, tone: 'teal' },
      { label: 'Client readiness score', value: 8.8, tone: 'gold' },
      { label: 'Communication score', value: 8.7, tone: 'gold' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Mar 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 10 hours ago',
  }),
];

export const DISCIPLINES = [
  'All Disciplines',
  'QA Automation',
  'Frontend',
  'Data Engineering',
  'Mobile Development',
  'Full Stack',
  'Machine Learning',
  'Data & AI',
  'Cloud & Platform',
  'Full Stack & Engineering',
  'SAP',
  'ServiceNow',
  'Salesforce',
  'Cybersecurity',
] as const;

export const TIMEZONES = ['All Timezones', 'Eastern', 'Central', 'Mountain', 'Pacific'] as const;

export const START_DATES = [
  'Any Start date',
  'Available now',
  'Within 2 weeks',
  'Within 4 weeks',
] as const;

export const SORT_OPTIONS = [
  { value: 'score', label: 'Test score' },
  { value: 'rate-low', label: 'Rate — low to high' },
  { value: 'rate-high', label: 'Rate — high to low' },
  { value: 'availability', label: 'Soonest start date' },
] as const;

export const HERO_ENGINEER = DEMO_ENGINEERS.find((e) => e.id === 'emily-r')!;

/** One featured demo profile per skill community (home hero slider). */
const COMMUNITY_ENGINEER_IDS: Record<string, string> = {
  'Data & AI': 'emily-r',
  'Cloud & Platform': 'michael-t',
  'Full Stack & Engineering': 'jessica-m',
  SAP: 'david-w',
  ServiceNow: 'amanda-l',
  Cybersecurity: 'james-h',
};

export type CommunityProfileSlide = {
  community: string;
  description: string;
  engineer: DemoEngineer;
};

export const COMMUNITY_PROFILE_SLIDES: CommunityProfileSlide[] = [
  {
    community: 'Data & AI',
    description: 'Spark, Kafka, Snowflake, dbt, and real-time pipeline architects',
    engineer: DEMO_ENGINEERS.find((e) => e.id === COMMUNITY_ENGINEER_IDS['Data & AI'])!,
  },
  {
    community: 'Cloud & Platform',
    description: 'Cloud architecture, platform engineering, DevOps and SRE',
    engineer: DEMO_ENGINEERS.find((e) => e.id === COMMUNITY_ENGINEER_IDS['Cloud & Platform'])!,
  },
  {
    community: 'Full Stack & Engineering',
    description: 'Front-end, back-end and full-stack product engineering',
    engineer: DEMO_ENGINEERS.find((e) => e.id === COMMUNITY_ENGINEER_IDS['Full Stack & Engineering'])!,
  },
  {
    community: 'SAP',
    description: 'Functional and technical roles across S/4HANA programmes',
    engineer: DEMO_ENGINEERS.find((e) => e.id === COMMUNITY_ENGINEER_IDS.SAP)!,
  },
  {
    community: 'ServiceNow',
    description: 'Implementation, development and administration across ITSM',
    engineer: DEMO_ENGINEERS.find((e) => e.id === COMMUNITY_ENGINEER_IDS.ServiceNow)!,
  },
  {
    community: 'Cybersecurity',
    description: 'Security engineering, cloud security, identity and governance',
    engineer: DEMO_ENGINEERS.find((e) => e.id === COMMUNITY_ENGINEER_IDS.Cybersecurity)!,
  },
];

/** Static landing hero profiles — twelve featured talent cards. */
const LANDING_ENGINEER_IDS: Array<{ community: string; description: string; id: string }> = [
  {
    community: 'QA Automation',
    description: 'ETL, data warehouse testing, data quality assurance, and API testing',
    id: 'divya-k',
  },
  {
    community: 'Frontend',
    description: 'Frontend development, React, Angular, and UI/UX engineering',
    id: 'shiva-g',
  },
  {
    community: 'Data Engineering',
    description: 'Cloud data platforms, ETL pipelines, and data engineering',
    id: 'sai-k',
  },
  {
    community: 'Mobile Development',
    description: 'Flutter, React Native, and cross-platform mobile architecture',
    id: 'saran-p',
  },
  {
    community: 'Full Stack',
    description: 'Backend development, API engineering, and cloud solutions',
    id: 'jaya-k',
  },
  {
    community: 'ServiceNow',
    description: 'Implementation, development and administration across ITSM',
    id: 'amanda-l',
  },
  {
    community: 'Machine Learning',
    description: 'Generative AI, agentic AI, and machine learning engineering',
    id: 'prashanth-k',
  },
  {
    community: 'Data & AI',
    description: 'Spark, Kafka, Snowflake, dbt, and real-time pipeline architects',
    id: 'emily-r',
  },
  {
    community: 'Cloud & Platform',
    description: 'Cloud architecture, platform engineering, DevOps and SRE',
    id: 'michael-t',
  },
  {
    community: 'Full Stack & Engineering',
    description: 'Front-end, back-end and full-stack product engineering',
    id: 'jessica-m',
  },
  {
    community: 'SAP',
    description: 'Functional and technical roles across S/4HANA programmes',
    id: 'david-w',
  },
  {
    community: 'Cybersecurity',
    description: 'Security engineering, cloud security, identity and governance',
    id: 'james-h',
  },
];

function withEngineerTimezone(engineer: DemoEngineer, timezone: string): DemoEngineer {
  const timezoneMeta = resolveMarketingTimezone(timezone);
  return {
    ...engineer,
    timezone: timezoneMeta.iana,
    zoneLabel: timezoneMeta.zoneLabel,
    zoneHours: timezoneMeta.zoneHours,
    timezoneDetail: timezoneMeta.zoneHours,
  };
}

/** Homepage slider — one distinct IANA timezone per featured card. */
const LANDING_PROFILE_TIMEZONES: Record<string, string> = {
  'divya-k': 'America/ANY',
  'shiva-g': 'Asia/Kolkata',
  'sai-k': 'America/New_York',
  'saran-p': 'America/Chicago',
  'jaya-k': 'America/Los_Angeles',
  'amanda-l': 'Europe/London',
  'prashanth-k': 'Europe/Berlin',
  'emily-r': 'Asia/Singapore',
  'michael-t': 'Australia/Sydney',
  'jessica-m': 'UTC',
  'david-w': 'America/New_York',
  'james-h': 'America/Chicago',
};

export const LANDING_PROFILE_SLIDES: CommunityProfileSlide[] = LANDING_ENGINEER_IDS.map(
  ({ community, description, id }) => {
    const base = DEMO_ENGINEERS.find((engineer) => engineer.id === id)!;
    const timezone = LANDING_PROFILE_TIMEZONES[id] ?? base.timezone;
    const slideEngineer =
      timezone === base.timezone ? base : withEngineerTimezone(base, timezone);

    return {
      community,
      description,
      engineer: slideEngineer,
    };
  },
);
