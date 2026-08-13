/** Fictional demo engineers from bestal_prototype_v2.html */
export type DemoEngineer = {
  initials: string;
  name: string;
  role: string;
  meta: string;
  rate: number;
  skills: string[];
  score: number;
  dimensions: { label: string; value: number }[];
  evaluation: string;
  availability: string;
  confirmed: string;
  timezone: string;
  timezoneDetail: string;
  trialEligible: boolean;
};

export const DEMO_ENGINEERS: DemoEngineer[] = [
  {
    initials: 'PS',
    name: 'Priya S.',
    role: 'Senior Data Engineer',
    meta: '8 years · Hyderabad, India',
    rate: 31,
    skills: ['Snowflake', 'Databricks', 'dbt', 'Python', 'AWS'],
    score: 91,
    dimensions: [
      { label: 'Technical depth', value: 9.4 },
      { label: 'Problem solving', value: 9.0 },
      { label: 'Architecture', value: 9.2 },
      { label: 'Code quality', value: 8.9 },
      { label: 'Communication', value: 8.8 },
    ],
    evaluation:
      'Strong dimensional modelling and cost reasoning on Snowflake. Explained clustering trade-offs unprompted. Reservation: limited exposure to streaming ingestion at scale.',
    availability: 'Available now',
    confirmed: '6 hours ago',
    timezone: 'US Central hours',
    timezoneDetail: '9:00am – 6:00pm CST · full business day',
    trialEligible: true,
  },
  {
    initials: 'RK',
    name: 'Rahul K.',
    role: 'ML Engineer',
    meta: '6 years · Bengaluru, India',
    rate: 38,
    skills: ['PyTorch', 'RAG', 'MLOps', 'LangChain', 'Python'],
    score: 88,
    dimensions: [
      { label: 'Technical depth', value: 9.0 },
      { label: 'Problem solving', value: 8.8 },
      { label: 'Architecture', value: 8.6 },
      { label: 'Code quality', value: 8.7 },
      { label: 'Communication', value: 8.5 },
    ],
    evaluation:
      'Solid retrieval evaluation methodology; builds task-specific eval sets before optimising. Reservation: fine-tuning experience is narrower than the résumé implies.',
    availability: 'Starts in 24 hours',
    confirmed: 'yesterday',
    timezone: 'US Eastern hours',
    timezoneDetail: '9:00am – 6:00pm EST · full business day',
    trialEligible: true,
  },
  {
    initials: 'AN',
    name: 'Anjali N.',
    role: 'SAP FICO Consultant',
    meta: '11 years · Pune, India',
    rate: 44,
    skills: ['S/4HANA', 'FICO', 'SAP Activate', 'Brownfield'],
    score: 90,
    dimensions: [
      { label: 'Technical depth', value: 9.1 },
      { label: 'Problem solving', value: 8.9 },
      { label: 'Architecture', value: 9.0 },
      { label: 'Code quality', value: 8.5 },
      { label: 'Communication', value: 9.3 },
    ],
    evaluation:
      'Two full-cycle brownfield migrations. Argued convincingly for selective transition over greenfield given the constraint set. Excellent finance-stakeholder communication.',
    availability: 'Starts in 48 hours',
    confirmed: '2 days ago',
    timezone: 'US Eastern hours',
    timezoneDetail: '8:00am – 5:00pm EST · full business day',
    trialEligible: false,
  },
  {
    initials: 'VM',
    name: 'Vikram M.',
    role: 'Site Reliability Engineer',
    meta: '9 years · Chennai, India',
    rate: 35,
    skills: ['Kubernetes', 'Terraform', 'AWS', 'Prometheus', 'Go'],
    score: 86,
    dimensions: [
      { label: 'Technical depth', value: 8.8 },
      { label: 'Problem solving', value: 9.1 },
      { label: 'Architecture', value: 8.5 },
      { label: 'Code quality', value: 8.4 },
      { label: 'Communication', value: 8.2 },
    ],
    evaluation:
      'Isolated the described outage correctly by reasoning about blast radius rather than restarting services. Strong FinOps instinct. Reservation: service-mesh depth is limited.',
    availability: 'Available now',
    confirmed: '4 hours ago',
    timezone: 'US Pacific hours',
    timezoneDetail: '9:00am – 6:00pm PST · full business day',
    trialEligible: true,
  },
  {
    initials: 'SD',
    name: 'Sneha D.',
    role: 'ServiceNow Developer',
    meta: '7 years · Noida, India',
    rate: 33,
    skills: ['ITSM', 'Flow Designer', 'CMDB', 'IntegrationHub'],
    score: 85,
    dimensions: [
      { label: 'Technical depth', value: 8.6 },
      { label: 'Problem solving', value: 8.5 },
      { label: 'Architecture', value: 8.7 },
      { label: 'Code quality', value: 8.3 },
      { label: 'Communication', value: 8.6 },
    ],
    evaluation:
      'Configuration-first by default; talked through why a requested customisation should not be built. CSDM reasoning is sound. Reservation: ITOM discovery exposure is light.',
    availability: 'Starts in 24 hours',
    confirmed: 'yesterday',
    timezone: 'US Central hours',
    timezoneDetail: '9:00am – 6:00pm CST · full business day',
    trialEligible: true,
  },
  {
    initials: 'KR',
    name: 'Karan R.',
    role: 'Salesforce Developer',
    meta: '5 years · Gurugram, India',
    rate: 29,
    skills: ['Apex', 'LWC', 'Flow', 'Service Cloud'],
    score: 82,
    dimensions: [
      { label: 'Technical depth', value: 8.4 },
      { label: 'Problem solving', value: 8.1 },
      { label: 'Architecture', value: 7.9 },
      { label: 'Code quality', value: 8.5 },
      { label: 'Communication', value: 8.3 },
    ],
    evaluation:
      'Bulkified by default and reasoned about governor limits before writing code. Reservation: sharing-model design at scale is still developing; would pair well with an architect.',
    availability: 'Starts in 5 days',
    confirmed: '3 days ago',
    timezone: 'US Mountain hours',
    timezoneDetail: '9:00am – 6:00pm MST · full business day',
    trialEligible: false,
  },
];

export const HERO_ENGINEER = DEMO_ENGINEERS[0]!;
