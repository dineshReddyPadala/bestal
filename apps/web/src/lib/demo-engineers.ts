/** Fictional demo engineers — aligned with prototype data/engineers.ts */

export type ScoreRow = {
  label: string;
  value: number;
  tone: 'teal' | 'gold';
};

export type DemoEngineer = {
  id: string;
  initials: string;
  name: string;
  role: string;
  discipline: string;
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
};

const PLACEHOLDER_NOTE =
  '[PLACEHOLDER: tester note pending — retains structure of a scored, written evaluation from an outside specialist.]';

function engineer(
  data: Omit<
    DemoEngineer,
    'meta' | 'timezoneDetail' | 'evaluation' | 'trialEligible'
  > & { trialEligible?: boolean },
): DemoEngineer {
  return {
    ...data,
    meta: `${data.experience} · ${data.location}`,
    timezoneDetail: data.zoneHours,
    evaluation: data.quote,
    trialEligible: data.trialEligible ?? true,
  };
}

export const DEMO_ENGINEERS: DemoEngineer[] = [
  engineer({
    id: 'ananya-m',
    initials: 'AM',
    name: 'Ananya M.',
    role: 'Senior Backend Engineer',
    discipline: 'Full Stack & Engineering',
    experience: '9 years',
    location: 'Pune, India',
    rate: 23,
    skills: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Kubernetes'],
    zoneLabel: 'Works US Pacific hours',
    zoneHours: '9:00am – 6:00pm PST · full business day',
    timezone: 'Pacific',
    score: 93,
    dimensions: [
      { label: 'Technical depth', value: 9.5, tone: 'teal' },
      { label: 'Problem solving', value: 9.2, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 9.4, tone: 'teal' },
      { label: 'Code quality', value: 9.1, tone: 'teal' },
      { label: 'Communication', value: 8.9, tone: 'teal' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Mar 2026',
    availability: 'Available in 2 weeks',
    availabilityWeeks: 2,
    confirmed: 'Confirmed 2 days ago',
  }),
  engineer({
    id: 'priya-s',
    initials: 'PS',
    name: 'Priya.S',
    role: 'Senior Data Engineer',
    discipline: 'Data & AI',
    experience: '8 years',
    location: 'Hyderabad, India',
    rate: 23,
    skills: ['Snowflake', 'Databricks', 'dbt', 'Python', 'AWS'],
    zoneLabel: 'Works US Central hours',
    zoneHours: '9:00am – 6:00pm CST · full business day',
    timezone: 'Central',
    score: 91,
    dimensions: [
      { label: 'Technical depth', value: 9.4, tone: 'teal' },
      { label: 'Problem solving', value: 9, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 9.2, tone: 'teal' },
      { label: 'Code quality', value: 8.9, tone: 'gold' },
      { label: 'Communication', value: 8.8, tone: 'gold' },
    ],
    quote:
      'Strong dimensional modelling and cost reasoning on Snowflake. Explained clustering trade-offs unprompted. Reservation: limited exposure to streaming ingestion at scale.',
    quoteIsPlaceholder: false,
    testedOn: 'Mar 2026',
    availability: 'Available 24 Hrs',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 6 hours ago',
  }),
  engineer({
    id: 'sneha-p',
    initials: 'SP',
    name: 'Sneha.P',
    role: 'SAP ABAP Consultant',
    discipline: 'SAP',
    experience: '11 years',
    location: 'Gurugram, India',
    rate: 23,
    skills: ['SAP ABAP', 'S/4HANA', 'Fiori', 'CDS Views', 'BTP'],
    zoneLabel: 'Works US Eastern hours',
    zoneHours: '9:00am – 6:00pm EST · full business day',
    timezone: 'Eastern',
    score: 90,
    dimensions: [
      { label: 'Technical depth', value: 9.3, tone: 'teal' },
      { label: 'Problem solving', value: 8.8, tone: 'gold' },
      { label: 'Collaboration & Cultural Fit', value: 9, tone: 'teal' },
      { label: 'Code quality', value: 8.7, tone: 'gold' },
      { label: 'Communication', value: 9.1, tone: 'teal' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Feb 2026',
    availability: 'Available in 4 weeks',
    availabilityWeeks: 4,
    confirmed: 'Confirmed 3 days ago',
  }),
  engineer({
    id: 'rahul-k',
    initials: 'RK',
    name: 'Rahul.K',
    role: 'ML Engineer',
    discipline: 'Data & AI',
    experience: '6 years',
    location: 'Bengaluru, India',
    rate: 23,
    skills: ['PyTorch', 'RAG', 'MLOps', 'LangChain', 'Python'],
    zoneLabel: 'Works US Eastern hours',
    zoneHours: '9:00am – 6:00pm EST · full business day',
    timezone: 'Eastern',
    score: 89,
    dimensions: [
      { label: 'Technical depth', value: 9.1, tone: 'teal' },
      { label: 'Problem solving', value: 9.3, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 8.6, tone: 'gold' },
      { label: 'Code quality', value: 8.8, tone: 'gold' },
      { label: 'Communication', value: 8.7, tone: 'gold' },
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
    experience: '8 years',
    location: 'Kochi, India',
    rate: 23,
    skills: ['React', 'TypeScript', 'Next.js', 'Design Systems', 'Accessibility'],
    zoneLabel: 'Works US Pacific hours',
    zoneHours: '9:00am – 6:00pm PST · full business day',
    timezone: 'Pacific',
    score: 88,
    dimensions: [
      { label: 'Technical depth', value: 8.9, tone: 'teal' },
      { label: 'Problem solving', value: 8.7, tone: 'gold' },
      { label: 'Collaboration & Cultural Fit', value: 8.8, tone: 'gold' },
      { label: 'Code quality', value: 9, tone: 'teal' },
      { label: 'Communication', value: 8.8, tone: 'gold' },
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
    experience: '7 years',
    location: 'Chennai, India',
    rate: 23,
    skills: ['Playwright', 'Selenium', 'TypeScript', 'CI/CD', 'API Testing'],
    zoneLabel: 'Works US Central hours',
    zoneHours: '9:00am – 6:00pm CST · full business day',
    timezone: 'Central',
    score: 86,
    dimensions: [
      { label: 'Technical depth', value: 8.7, tone: 'gold' },
      { label: 'Problem solving', value: 8.5, tone: 'gold' },
      { label: 'Collaboration & Cultural Fit', value: 8.2, tone: 'gold' },
      { label: 'Code quality', value: 8.9, tone: 'teal' },
      { label: 'Communication', value: 8.6, tone: 'gold' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Jan 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 1 day ago',
  }),
  engineer({
    id: 'karan-d',
    initials: 'KD',
    name: 'Karan.D',
    role: 'Senior Cloud Architect',
    discipline: 'Cloud & Platform',
    experience: '10 years',
    location: 'Bengaluru, India',
    rate: 23,
    skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD'],
    zoneLabel: 'Works US Eastern hours',
    zoneHours: '9:00am – 6:00pm EST · full business day',
    timezone: 'Eastern',
    score: 92,
    dimensions: [
      { label: 'Technical depth', value: 9.3, tone: 'teal' },
      { label: 'Problem solving', value: 9.1, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 9.5, tone: 'teal' },
      { label: 'Code quality', value: 8.8, tone: 'gold' },
      { label: 'Communication', value: 9, tone: 'teal' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Mar 2026',
    availability: 'Available in 2 weeks',
    availabilityWeeks: 2,
    confirmed: 'Confirmed 1 day ago',
  }),
  engineer({
    id: 'meera-n',
    initials: 'MN',
    name: 'Meera N.',
    role: 'ServiceNow Developer',
    discipline: 'ServiceNow',
    experience: '7 years',
    location: 'Pune, India',
    rate: 23,
    skills: ['ITSM', 'ITOM', 'Flow Designer', 'Integration Hub', 'CMDB'],
    zoneLabel: 'Works US Central hours',
    zoneHours: '9:00am – 6:00pm CST · full business day',
    timezone: 'Central',
    score: 90,
    dimensions: [
      { label: 'Technical depth', value: 9.2, tone: 'teal' },
      { label: 'Problem solving', value: 8.9, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 8.8, tone: 'gold' },
      { label: 'Code quality', value: 8.7, tone: 'gold' },
      { label: 'Communication', value: 9, tone: 'teal' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
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
    experience: '8 years',
    location: 'Hyderabad, India',
    rate: 23,
    skills: ['Apex', 'LWC', 'Flow', 'Service Cloud', 'Integration'],
    zoneLabel: 'Works US Pacific hours',
    zoneHours: '9:00am – 6:00pm PST · full business day',
    timezone: 'Pacific',
    score: 89,
    dimensions: [
      { label: 'Technical depth', value: 9, tone: 'teal' },
      { label: 'Problem solving', value: 8.8, tone: 'gold' },
      { label: 'Collaboration & Cultural Fit', value: 8.7, tone: 'gold' },
      { label: 'Code quality', value: 8.9, tone: 'teal' },
      { label: 'Communication', value: 9.1, tone: 'teal' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Mar 2026',
    availability: 'Available in 2 weeks',
    availabilityWeeks: 2,
    confirmed: 'Confirmed 2 days ago',
  }),
  engineer({
    id: 'aditya-c',
    initials: 'AC',
    name: 'Aditya.C',
    role: 'Security Engineer',
    discipline: 'Cybersecurity',
    experience: '9 years',
    location: 'Mumbai, India',
    rate: 23,
    skills: ['SIEM', 'IAM', 'Cloud Security', 'SOC 2', 'Pen Testing'],
    zoneLabel: 'Works US Eastern hours',
    zoneHours: '9:00am – 6:00pm EST · full business day',
    timezone: 'Eastern',
    score: 91,
    dimensions: [
      { label: 'Technical depth', value: 9.4, tone: 'teal' },
      { label: 'Problem solving', value: 9.2, tone: 'teal' },
      { label: 'Collaboration & Cultural Fit', value: 9, tone: 'teal' },
      { label: 'Code quality', value: 8.8, tone: 'gold' },
      { label: 'Communication', value: 8.9, tone: 'teal' },
    ],
    quote: PLACEHOLDER_NOTE,
    quoteIsPlaceholder: true,
    testedOn: 'Mar 2026',
    availability: 'Available now',
    availabilityWeeks: 0,
    confirmed: 'Confirmed 5 hours ago',
  }),
];

export const DISCIPLINES = [
  'All Disciplines',
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

export const HERO_ENGINEER = DEMO_ENGINEERS.find((e) => e.id === 'priya-s')!;

/** One featured demo profile per skill community (home hero slider). */
const COMMUNITY_ENGINEER_IDS: Record<string, string> = {
  'Data & AI': 'priya-s',
  'Cloud & Platform': 'karan-d',
  'Full Stack & Engineering': 'ananya-m',
  SAP: 'sneha-p',
  ServiceNow: 'meera-n',
  Salesforce: 'lakshmi-v',
  Cybersecurity: 'aditya-c',
};

export type CommunityProfileSlide = {
  community: string;
  description: string;
  engineer: DemoEngineer;
};

export const COMMUNITY_PROFILE_SLIDES: CommunityProfileSlide[] = [
  {
    community: 'Data & AI',
    description: 'Engineering, analytics, machine learning and applied AI.',
    engineer: DEMO_ENGINEERS.find((e) => e.id === COMMUNITY_ENGINEER_IDS['Data & AI'])!,
  },
  {
    community: 'Cloud & Platform',
    description: 'Cloud architecture, platform engineering, DevOps and SRE.',
    engineer: DEMO_ENGINEERS.find((e) => e.id === COMMUNITY_ENGINEER_IDS['Cloud & Platform'])!,
  },
  {
    community: 'Full Stack & Engineering',
    description: 'Front-end, back-end and full-stack product engineering.',
    engineer: DEMO_ENGINEERS.find((e) => e.id === COMMUNITY_ENGINEER_IDS['Full Stack & Engineering'])!,
  },
  {
    community: 'SAP',
    description: 'Functional and technical roles across S/4HANA programmes.',
    engineer: DEMO_ENGINEERS.find((e) => e.id === COMMUNITY_ENGINEER_IDS.SAP)!,
  },
  {
    community: 'ServiceNow',
    description: 'Implementation, development and administration across ITSM.',
    engineer: DEMO_ENGINEERS.find((e) => e.id === COMMUNITY_ENGINEER_IDS.ServiceNow)!,
  },
  {
    community: 'Salesforce',
    description: 'Admin, development and configuration across CRM.',
    engineer: DEMO_ENGINEERS.find((e) => e.id === COMMUNITY_ENGINEER_IDS.Salesforce)!,
  },
  {
    community: 'Cybersecurity',
    description: 'Security engineering, cloud security, identity and governance.',
    engineer: DEMO_ENGINEERS.find((e) => e.id === COMMUNITY_ENGINEER_IDS.Cybersecurity)!,
  },
];
