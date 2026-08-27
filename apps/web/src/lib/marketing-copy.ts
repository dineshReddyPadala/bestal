/** Marketing copy from bestal_prototype_v2.html
 *  Note: strings with trial hour counts (e.g. "10 hours") are templates — pages use
 *  `marketing-trial-copy.ts` builders + `useFreeTrialHours()` for live platform settings.
 */

export const EVIDENCE_STRIP = [
  {
    num: '01',
    title: 'Tested by Experts',
    body: 'An outside specialist tests every engineer. You see exactly how they scored — including what they were weak at.',
  },
  {
    num: '02',
    title: 'Background Verified',
    body: 'Identity, education and employment checked before the profile goes live.',
  },
  {
    num: '03',
    title: 'Your Timezone',
    body: 'Every engineer works in your Timezone.',
  },
  {
    num: '04',
    title: 'Rate Up Front',
    body: "The hourly rate is on the profile before you shortlist.",
  },
  {
    num: '05',
    title: 'Start in Hours, Not Weeks',
    body: 'Filter for engineers who can start now, in 24 hours, or in 48. Every start date is confirmed and dated.',
  },
  {
    num: '06',
    title: '10 Hours Free Trial',
    body: 'Try any engineer on real work at no charge.',
  },
] as const;

export const HOME_STATS = [
  { value: '10', label: 'Hours free, on real work,\nbefore you commit' },
  { value: '100%', label: 'Working in\nyour time zone' },
  { value: '5', label: 'Areas every engineer\nis tested on' },
  { value: '7', label: 'Skill Communities' },
] as const;

export const HOME_STEPS = [
  {
    step: 1,
    title: 'Tell us what you need',
    body: 'One sentence is enough: "Two senior Snowflake engineers on Central hours, starting this week."',
  },
  {
    step: 2,
    title: 'See the evidence',
    body: 'Matched engineers arrive with test results, verification status, hourly rate, time zone and start date already attached.',
  },
  {
    step: 3,
    title: 'Try them free',
    body: 'Real work, your systems, your team. No charge, and no obligation to continue.',
  },
  {
    step: 4,
    title: 'Engage them',
    body: 'Continue into a paid engagement.',
  },
] as const;

export const TIMEZONE_BLOCKS = [
  {
    title: 'One zone, full day',
    body: '9:00am to 6:00pm in your zone, every working day. Standups, pairing, code review and incidents — all inside normal hours.',
  },
  {
    title: 'Committed in writing',
    body: 'The working day is confirmed before the profile goes live.',
  },
  {
    title: 'Filter by your zone',
    body: 'See engineers that can work in your timezone.',
  },
] as const;

export const BUYER_QUESTIONS = [
  'Who can start today, and in which discipline?',
  "Do they work my team's hours — a full day, not a few?",
  'What can this engineer actually do, and who says so?',
  'Who tested them, and what did they get wrong?',
  'Is their identity verified? Their employment history?',
  'What is the hourly rate?',
  'Can I see them work before I pay anything?',
] as const;

export const HOME_BUYER_FAQ = [
  {
    question: 'Who can start today, and in which discipline?',
    answer:
      'Filter for engineers who can start now, in 24 hours, or in 48. Every start date is confirmed and dated on the profile.',
  },
  {
    question: "Do they work my team's hours — a full day, not a few?",
    answer:
      'Every engineer works a full business day in one US time zone. Overlap hours are shown on the profile and committed in writing.',
  },
  {
    question: 'What can this engineer actually do, and who says so?',
    answer:
      'An outside specialist tested them against role-specific criteria. You read the scorecard — including what they were weak at.',
  },
  {
    question: 'Who tested them, and what did they get wrong?',
    answer:
      'The profile names the tester, the discipline, the criteria and the date. Reservations are published, not hidden.',
  },
  {
    question: 'Is their identity verified? Their employment history?',
    answer:
      'Identity, education and employment are checked before a profile goes live. Status is shown; documents are never shared.',
  },
  {
    question: 'What is the hourly rate?',
    answer: 'The hourly rate is on the profile before you shortlist — and it does not change later.',
  },
  {
    question: 'Can I see their work before I pay anything?',
    answer: 'Try any engineer on real work at no charge. You keep the work either way.',
  },
] as const;

export const HOME_COMMUNITIES = [
  { name: 'Data & AI', body: 'Engineering, analytics, machine learning and applied AI.' },
  { name: 'Cloud & Platform', body: 'Cloud architecture, platform engineering, DevOps and SRE.' },
  { name: 'Full Stack & Engineering', body: 'Front-end, back-end and full-stack product engineering.' },
  { name: 'SAP', body: 'Functional and technical roles across S/4HANA programmes.' },
  { name: 'ServiceNow', body: 'Implementation, development and administration across ITSM.' },
  { name: 'Salesforce', body: 'Admin, development and configuration across CRM.' },
  { name: 'Cybersecurity', body: 'Security engineering, cloud security, identity and governance.' },
] as const;

export type HomeCommunityCard = {
  name: (typeof HOME_COMMUNITIES)[number]['name'];
  body: string;
  badges: readonly [string, string];
  tags: readonly string[];
};

export const HOME_COMMUNITY_CARDS: HomeCommunityCard[] = [
  {
    name: 'Data & AI',
    body: 'Engineering, analytics, machine learning and applied AI.',
    badges: ['Fullstack', 'Developer'],
    tags: [
      'Data Engineers',
      'Databricks',
      'Snowflake',
      'Analytics Engineers',
      'Data Scientists',
      'ML Engineers',
      'GenAI Engineers',
      'Agentic AI',
      'MLOps',
      'AI Architects',
    ],
  },
  {
    name: 'Cloud & Platform',
    body: 'Cloud architecture, platform engineering, DevOps and SRE.',
    badges: ['Platform', 'DevOps'],
    tags: [
      'Cloud Architects',
      'Kubernetes',
      'Terraform',
      'AWS',
      'GCP',
      'Azure',
      'Site Reliability',
      'Platform Engineers',
      'CI/CD',
      'Infrastructure',
    ],
  },
  {
    name: 'Full Stack & Engineering',
    body: 'Front-end, back-end and full-stack product engineering.',
    badges: ['Product', 'Engineering'],
    tags: [
      'React',
      'Node.js',
      'TypeScript',
      'Java',
      'Spring Boot',
      'PostgreSQL',
      'Microservices',
      'API Design',
      'Mobile',
      'System Design',
    ],
  },
  {
    name: 'SAP',
    body: 'Functional and technical roles across S/4HANA programmes.',
    badges: ['Functional', 'Technical'],
    tags: [
      'S/4HANA',
      'ABAP',
      'Fiori',
      'SAP BTP',
      'Integration',
      'FI/CO',
      'MM',
      'SD',
      'Basis',
      'Migration',
    ],
  },
  {
    name: 'ServiceNow',
    body: 'Implementation, development and administration across ITSM.',
    badges: ['ITSM', 'Developer'],
    tags: [
      'ServiceNow Admin',
      'ITSM',
      'CSM',
      'HRSD',
      'Flow Designer',
      'Integration Hub',
      'CMDB',
      'SecOps',
      'App Engine',
      'Architect',
    ],
  },
  {
    name: 'Salesforce',
    body: 'Admin, development and configuration across CRM.',
    badges: ['Admin', 'Developer'],
    tags: [
      'Sales Cloud',
      'Service Cloud',
      'Apex',
      'Lightning',
      'Flows',
      'Integration',
      'Marketing Cloud',
      'CPQ',
      'Architect',
      'CRM',
    ],
  },
  {
    name: 'Cybersecurity',
    body: 'Security engineering, cloud security, identity and governance.',
    badges: ['Security', 'Engineering'],
    tags: [
      'AppSec',
      'Cloud Security',
      'IAM',
      'SIEM',
      'Pen Testing',
      'GRC',
      'Zero Trust',
      'DevSecOps',
      'SOC',
      'Compliance',
    ],
  },
];

export const ONBOARDING_STEPS = [
  {
    step: 1,
    title: 'Identified',
    body: 'We source continuously into specific engineering communities against live and anticipated demand — not into a general resume pool.',
  },
  {
    step: 2,
    title: 'Screened',
    body: 'A recruiter in the relevant community reviews experience, stack depth, English fluency and stated availability. Most applicants stop here.',
  },
  {
    step: 3,
    title: 'Tested by an outside specialist',
    body: 'A qualified specialist — not a BesTal recruiter — tests the engineer against role-specific criteria and scores technical depth, problem solving, collaboration and cultural fit, code quality and communication separately.',
    // fact: '[FACT: tester sourcing and qualification criteria]',
  },
  {
    step: 4,
    title: 'Verified',
    body: 'Identity confirmed against a live capture. Education and employment history independently checked.',
    // fact: '[FACT: verification provider and scope]',
  },
  {
    step: 5,
    title: 'Pricing',
    body: 'An hourly rate is set from skill, seniority, certification, scarcity and time-zone commitment. It is published on the profile.',
  },
  {
    step: 6,
    title: 'Time zone assigned',
    body: 'The engineer commits in writing to a full business day in one US time zone — Eastern, Central, Mountain or Pacific. Not "flexible," and not an overlap window.',
  },
  {
    step: 7,
    title: 'Published',
    body: 'The profile goes live only when the test, verification, rate, start date and time-zone commitment are all complete. Incomplete profiles are not shown.',
  },
  {
    step: 8,
    title: 'Maintained',
    body: 'Start dates and working hours are reconfirmed on a recurring cycle. Profiles that go stale drop down in search until reconfirmed.',
  },
] as const;

export const ENGAGEMENT_STEPS = [
  {
    step: 1,
    title: 'Describe what you need',
    body: 'Write it as a sentence, or use the structured form. Both let you specify the time zone and the start date you need.',
  },
  {
    step: 2,
    title: 'Review matched engineers',
    body: 'Matches arrive with evidence attached and an explanation of why each one matched, criterion by criterion. You see the reasoning, not just a score.',
  },
  {
    step: 3,
    title: 'Compare',
    body: 'Put up to four engineers side by side on experience, rate, start date, time zone, test results, certifications and verification status.',
  },
  {
    step: 4,
    title: 'Start a 10-hour free trial',
    body: 'Pick an engineer and put them on real work for free trial. No interview round required — the test results and the trial replace it.',
  },
  {
    step: 5,
    title: 'Continue, swap, or stop',
    body: 'Move into a paid engagement, swap for a different engineer, or stop.',
    // fact: '[FACT: replacement turnaround commitment]',
  },
  {
    step: 6,
    title: 'Manage and scale',
    body: 'Active engagements, timesheet approval, structured feedback, and "add similar engineer" from anyone already working out.',
  },
] as const;

export const CONTROL_TABLE = {
  youControl: [
    'Which engineer goes on trial',
    'What the 10 hours are spent on',
    'Timesheet approval',
    'Continue / swap / stop',
    'Which of your team gets access to what',
  ],
  weHandle: [
    'Sourcing into the engineering communities',
    'Independent testing and verification',
    'Rate setting, contracting, payments',
    'Replacement sourcing',
    'Start-date and working-hours maintenance',
  ],
} as const;

export const EVALUATION_DIMENSIONS = [
  { title: 'Technical depth', body: 'Working command of the primary stack, at the depth the role requires. Not trivia.' },
  { title: 'Problem solving', body: 'How they approach an unfamiliar problem — including what they ask before they start.' },
  { title: 'Collaboration & Cultural Fit', body: 'How well they collaborate with teams, adapt to client culture, and communicate under real working conditions.' },
  { title: 'Communication score', body: 'Whether they can explain a technical decision to your team, disagree usefully, and say "I don\'t know."' },
  { title: 'Client readiness score', body: 'How prepared they are to start on client work — context gathering, delivery habits, and professional readiness.' },
] as const;

export const PRICE_BANDS = [
  'Under $25',
  '$25–$35',
  '$35–$50',
  '$50–$75',
  '$75+',
] as const;

export const RATE_FACTORS = [
  { num: '01', title: 'Skill and discipline', body: 'Scarcity differs sharply. A GenAI engineer and a QA automation engineer aren\'t priced alike.' },
  { num: '02', title: 'Experience', body: 'Depend on the experiecen level, what the test showed and what resume claimed.' },
  { num: '03', title: 'Tested depth', body: 'What the test showed, not what the resume claimed.' },
  { num: '04', title: 'Scarcity', body: 'Real supply in that discipline at the depth you need.' },
  { num: '05', title: 'Start date', body: "Available-now senior engineers carry a premium. That's honest supply and demand." },
  { num: '06', title: 'Certification', body: "Where it's genuinely load-bearing, as in SAP and ServiceNow." },
] as const;

export const TRIAL_STEPS = [
  { step: 1, title: 'Pick the engineer', body: 'Any profile marked free Trial. No interview round required — the test results tell you what an interview would.' },
  { step: 2, title: 'Define the 10 hours', body: 'A specific deliverable, written success criteria, and a named manager on your side.' },
  { step: 3, title: 'They start', body: 'Your systems, your access controls, your standups, working your business hours. Most trials begin within 24 to 48 hours of confirmation.' },
  { step: 4, title: 'Decide', body: 'Continue into a paid engagement, swap for a different engineer, or stop. No charge for the 10 hours either way.' },
] as const;

export const TRIAL_SETTLED = [
  { strong: 'The 10 hours are free.', rest: ' No card, no deposit, no invoice.' },
  { strong: 'You keep the work.', rest: ' Whatever you decide afterwards.' },
  { strong: 'IP is assigned to you at the point of creation', rest: ' — not on payment, not by licence.' },
  { strong: 'Stopping costs nothing.', rest: ' No continuation obligation, no notice period, no conversation about staying.' },
] as const;

export const TRUST_STATS = [
  'Gartner projects that by 2028, one in four candidate profiles worldwide will be fake. (Gartner, 2025)',
  'In a 2025 Gartner survey of 3,000 candidates, 6% admitted to interview fraud. (Gartner, 2025)',
  'A 2025 Checkr survey of 3,000 managers found 62% believe candidates are now better at faking identities with AI than their teams are at detecting it. (Checkr, 2025)',
  'The US Department of Justice has documented a state-sponsored scheme placing fraudulent remote IT workers inside US companies — a June 2025 action described workers employed at more than 100 US companies, including Fortune 500s. (US DOJ, 2025)',
] as const;

export const TRUST_VERIFICATION = [
  { title: 'Identity', body: 'Government-issued ID confirmed against a live capture of the person.', fact: '[FACT: provider and method]' },
  { title: 'Identity bound to the test', body: 'The person verified is the person tested. Identity is tied to the testing session, so the score belongs to the human on the profile. This is the check most platforms skip, and it\'s the one that matters most.', highlight: true },
  { title: 'Education', body: 'Independently confirmed with the awarding institution.', fact: '[FACT: provider]' },
  { title: 'Employment history', body: 'Independently confirmed with prior employers.', fact: '[FACT: provider, lookback period]' },
  { title: 'Exclusivity and conflicts', body: 'Every engineer makes a written declaration covering concurrent employment and conflicts of interest, and accepts exclusivity terms for the engagement.', fact: '[FACT: declaration and contractual mechanism]' },
] as const;

export const CONTACT_REASONS = [
  'I need engineers',
  'I want to see the platform',
  'Procurement or security review',
  "I'm an engineer",
  'Partnership or other',
] as const;

export const CONTACT_TOPICS = [
  { value: 'GENERAL', label: 'General Queries' },
  { value: 'SALES', label: 'Sales Inquiries' },
  { value: 'SUPPORT', label: 'Client Support' },
  // { value: 'PRESS', label: 'Press' },
  // { value: 'PARTNERSHIPS', label: 'Partnerships' },
  // { value: 'INVESTORS', label: 'Investors' },
] as const;

export type ContactTopicValue = (typeof CONTACT_TOPICS)[number]['value'];

/** All topics stored by the API (includes legacy form options). */
export type ContactMessageTopicValue =
  | ContactTopicValue
  | 'PRESS'
  | 'PARTNERSHIPS'
  | 'INVESTORS';

export const CONTACT_DIRECT_LINES = [
  {
    num: '01',
    title: 'Sales Inquiries',
    href: 'mailto:sales@bestal.co',
    display: 'connect@bestal.co',
    description: 'Talk to someone about building a team.',
  },
  {
    num: '02',
    title: 'Careers',
    href: 'mailto:careers@bestal.co',
    display: 'careers@bestal.co',
    description: 'Explore opportunities and join our team.',
  },
] as const;

export const CONTACT_ADDRESSES = [
  {
    label: 'USA',
    lines: ['6701, Palermo Trail,', 'Flower Mound, TX 75077'],
    phone: { href: 'tel:+15125083546', display: '512 508 3546' },
  },
  {
    label: 'India',
    lines: ['11th Floor, Orbit,', 'HITEC City, Hyderabad'],
  },
] as const;

export const CONTACT_TOPIC_LABELS: Record<ContactMessageTopicValue, string> = {
  GENERAL: 'General Queries',
  SALES: 'Sales Inquiries',
  SUPPORT: 'Client Support',
  PRESS: 'Press',
  PARTNERSHIPS: 'Partnerships',
  INVESTORS: 'Investors',
};

export const COMMUNITY_DETAILS = [
  { num: '01', name: 'Data & AI', body: 'Data Engineers · Databricks · Snowflake · Analytics Engineers · Data Scientists · ML Engineers · GenAI Engineers · Agentic AI · MLOps · AI Architects' },
  { num: '02', name: 'Cloud & Platform', body: 'AWS · Azure · GCP · DevOps · Site Reliability Engineers · Kubernetes · Platform Engineers · Cloud Architects' },
  { num: '03', name: 'Full Stack', body: 'React · Angular · Node · Java · .NET · Python · Mobile · QA Automation' },
  { num: '04', name: 'SAP', body: 'S/4HANA · FICO · MM · SD · ABAP · Basis · BTP · SuccessFactors · SAP Analytics · Architects' },
  { num: '05', name: 'ServiceNow', body: 'Developers · Architects · ITSM · ITOM · CSM · HRSD · SecOps · Integration Specialists' },
  { num: '06', name: 'Salesforce', body: 'Developers · Administrators · Architects · Marketing Cloud · Service Cloud · Sales Cloud · CPQ · Data Cloud' },
  { num: '07', name: 'Cybersecurity', body: 'SOC & Detection Engineers · IAM · Cloud Security · Application Security · Security Engineering · GRC · Security Architects' },
] as const;

export const FOR_ENGINEERS_ASK = [
  { title: 'A real technical test', body: "By an outside specialist in your field — not a recruiter, not a generic aptitude quiz. It's demanding, and not everyone passes." },
  { title: 'Verification', body: 'Identity, education and employment, independently checked. Your documents are never shared with clients — only the status.' },
  { title: 'A full day in a US time zone', body: "Not a few hours of overlap. A committed business day in Eastern, Central, Mountain or Pacific — because that's what clients are actually buying." },
  { title: 'An honest start date', body: "If you say you can start in 24 hours, we'll hold you to it. Start dates are reconfirmed regularly." },
  { title: 'A conflict declaration', body: "If you're employed elsewhere, tell us in writing. We won't place you into a conflict, and undisclosed dual employment ends the relationship." },
] as const;

export const FOR_ENGINEERS_GET = [
  { title: 'Tested once, visible to many', body: 'No repeated screening for every opportunity.' },
  { title: 'Your results, published', body: 'Including what the tester thought you were strong at. Clients see evidence, not a resume.' },
  { title: 'A rate you agreed to', body: "You know what you're paid before you accept anything.", fact: '[FACT: pay-rate transparency policy]' },
  { title: 'Work that matches your stack', body: 'Matched on tested depth, not keyword overlap.' },
  { title: 'US clients, without relocating', body: 'Work with US engineering teams from where you are, on hours you agreed to.' },
] as const;

export const FOOTER_TAGLINE =
  'Tested, verified and priced before you commit — working a full day in your time zone.';

export const ABOUT_HERO = {
  title: 'About us',
  subtitle: 'We help organizations build and scale their technology workforce.',
  body:
    'BesTal supports clients globally with digital engineering talent — freelancers, contractors, dedicated engineers, and managed teams — so businesses can acquire the skills and capacity they need, when they need them.',
  primaryCta: 'See how it works',
} as const;

export const ABOUT_SPLIT = {
  paragraphs: [
    'Technology priorities shift faster than traditional hiring models can keep pace. Organizations need access to specialized talent without compromising quality or carrying unnecessary workforce capacity. BesTal bridges that gap through specialist-led assessments, transparent talent profiles, and flexible engagement models — giving businesses a faster, more reliable way to access digital engineering expertise.',
    'Whether you need to augment a team, access niche skills, accelerate a critical initiative, or build a managed delivery team, BesTal provides workforce solutions aligned to your business goals.',
  ],
} as const;

export const ABOUT_FEATURED = {
  num: '01',
  title: 'Pre-Vetted, Not Just Screened',
  body:
    'Every engineer is evaluated by an independent specialist across five areas: Technical Depth, Problem Solving, Collaboration & Cultural Fit, Communication, and Client Readiness. Each area is scored separately, and you see the full results — including identified weaknesses. We publish those reservations because a score without context isn\'t evidence.',
  tags: [
    'Technical depth',
    'Problem solving',
    'Collaboration & Cultural Fit',
    'Communication score',
    'Client readiness score',
  ],
} as const;

export type AboutDifferenceCard = {
  num: string;
  title: string;
  body: string;
  tags?: readonly string[];
  tagVariant?: 'filled' | 'outline';
};

export const ABOUT_DIFFERENCE: AboutDifferenceCard[] = [
  {
    num: '02',
    title: 'Your Hours, Not Theirs',
    body:
      'Every engineer commits to your business hours in one US time zone: Eastern, Central, Mountain, or Pacific. Not a few hours of overlap. Not a flexible schedule. Working hours aligned with your team.',
    tags: ['Eastern', 'Central', 'Mountain', 'Pacific'],
    tagVariant: 'outline',
  },
  {
    num: '03',
    title: 'Transparent From the Start',
    body:
      'Hourly rates are displayed on every profile before you shortlist, schedule a call, or begin evaluations. Every profile also includes verified availability and a confirmed start date.',
  },
  {
    num: '04',
    title: 'Try Before You Commit',
    body:
      'Put any available engineer on real work for up to 10 hours at no charge. Keep everything they produce, whether you continue or not. The best way to evaluate talent is through real work, in your systems, alongside your team.',
  },
  {
    num: '05',
    title: 'Verified, Not Assumed',
    body:
      'Identity is verified through a live capture linked directly to the assessment process, ensuring the assessment belongs to the person you\'ll work with. Education and employment history are independently verified, with verification status visible on the profile while personal documents remain private.',
  },
];

export const ABOUT_SPECIALISTS = {
  num: '06',
  title: 'Specialists, Not Generalists',
  body:
    'Engineers belong to one of seven specialist communities — Data & AI, Cloud & Platform, Full Stack, SAP, ServiceNow, Salesforce, and Cybersecurity — each with its own assessments and independent evaluators. A Snowflake engineer is evaluated by someone who has built on Snowflake.',
  tags: [
    'Data & AI',
    'Cloud & Platform',
    'Full Stack',
    'SAP',
    'ServiceNow',
    'Salesforce',
    'Cybersecurity',
  ],
} as const;

export const HIW_HERO = {
  label: 'Process',
  title: 'How BesTal works',
  body:
    'Two engines work in parallel. One is built around customer requirements—understanding, shaping and delivering the right talent. The other is built around engineering talent—building communities, developing capabilities and validating skills. Together, they create a talent supply chain you can see, measure and trust.',
} as const;

export const HIW_CLIENT = {
  stepCount: '6 steps',
  title: 'How client requirements get served',
  intro:
    'Six stages from describing what you need through managing an active engagement — including a free trial before you commit.',
  flowRibbon: {
    left: 'Requirement → Matched engineers → Trial → Your decision',
    right: '10 free hours · 3 outcomes',
  },
  processCards: [
    {
      tone: 'peach' as const,
      title: 'What you describe',
      stage: '01',
      tags: ['Skills', 'Hours per week', 'Time zone'],
      body: 'One brief. No job post, no sourcing on your side.',
    },
    {
      tone: 'blue' as const,
      title: 'What comes back',
      stage: '02 – 03',
      matchRows: [
        { num: '01', fill: 100 },
        { num: '02', fill: 62 },
      ],
      body: 'Only fully Vetted profiles. Compared on tests, rates, and hours.',
    },
    {
      tone: 'green' as const,
      title: 'The trial you direct',
      stage: '04',
      trialHours: 10,
      body: '10 free hours. You choose the engineer and what the hours are spent on.',
    },
  ],
  trialOutcome: {
    title: 'At the end of the trial, you decide',
    stageTag: 'stage 05',
    options: [
      {
        tone: 'lavender' as const,
        title: 'Continue',
        body: 'Engagement runs on at the rate you already saw.',
        footerLabel: 'Manage and Scale',
        footerStage: 'stage 06',
      },
      {
        tone: 'rose' as const,
        title: 'Swap',
        body: 'We source a replacement. Your hours stay put.',
      },
      {
        tone: 'amber' as const,
        title: 'Stop',
        body: 'Nothing continues. No further commitment.',
      },
    ],
  },
  stagesLabel: 'The six stages',
  stages: [
    {
      num: '01',
      title: 'Describe What You Need',
      body: 'Skills, hours, and time zone.',
      showArrow: true,
    },
    {
      num: '02',
      title: 'Review Matched Engineers',
      body: 'Only published profiles reach you.',
      showArrow: true,
    },
    {
      num: '03',
      title: 'Compare',
      body: 'Test results, rates, and hours side by side.',
      showArrow: false,
    },
    {
      num: '04',
      title: 'Start a 10-Hour Free Trial',
      body: 'You choose who goes on trial.',
      showArrow: true,
    },
    {
      num: '05',
      title: 'Continue, Swap, or Stop',
      body: 'Your call at the end of the trial.',
      showArrow: true,
    },
    {
      num: '06',
      title: 'Manage and Scale',
      body: 'Approve timesheets, add engineers.',
      showArrow: false,
    },
  ],
} as const;

export const HIW_SEEKER = {
  stepCount: '8 steps',
  title: 'How job seeker gets onto BesTal',
  intro:
    'Eight stages between first contact and a published profile. A profile appears only when all of them are complete.',
  funnelLabel: 'Eight Stages, one profile',
  funnel: [
    {
      range: '01 – 02',
      label: 'Identified and screened',
      width: 100,
      tone: 'light' as const,
    },
    {
      range: '03 – 04',
      label: 'Tested externally, then verified',
      width: 88,
      tone: 'mid' as const,
    },
    {
      range: '05 – 06',
      label: 'Priced and time zone assigned',
      width: 76,
      tone: 'deep' as const,
    },
    {
      range: '07 – 08',
      label: 'Published and maintained',
      width: 64,
      tone: 'dark' as const,
    },
  ],
  funnelNote:
    'Each stage narrows the pool. Nothing is visible to you until stage 07.',
  stats: [
    {
      label: 'Stages required',
      value: '8 / 8',
      note: 'A profile appears only when all of them are complete.',
    },
    {
      label: 'Who runs the test',
      value: 'An outside specialist',
      note: 'Stage 03 is not scored by BesTal.',
    },
  ],
  stagesLabel: 'The eight stages',
  stages: [
    {
      num: '01',
      title: 'Identified',
      body: 'Sourced from the engineering communities.',
      showArrow: true,
    },
    {
      num: '02',
      title: 'Screened',
      body: 'First-pass check on experience and fit.',
      showArrow: true,
    },
    {
      num: '03',
      title: 'Tested by an Outside Specialist',
      body: 'Assessed by someone who does not work for us.',
      showArrow: true,
    },
    {
      num: '04',
      title: 'Verified',
      body: 'Identity and claims confirmed.',
      showArrow: false,
    },
    {
      num: '05',
      title: 'Pricing',
      body: 'Rate set and fixed before publication.',
      showArrow: true,
    },
    {
      num: '06',
      title: 'Time Zone Assigned',
      body: 'Working hours recorded against your day.',
      showArrow: true,
    },
    {
      num: '07',
      title: 'Published',
      body: 'Profile becomes visible to you.',
      showArrow: true,
    },
    {
      num: '08',
      title: 'Maintained',
      body: 'Availability and hours kept current.',
      showArrow: false,
    },
  ],
} as const;

export const ABOUT_CTA = {
  title: 'Workforce solutions aligned to your business goals.',
  body:
    'Augment a team, access niche skills, accelerate a critical initiative, or build a managed delivery team.',
  primaryCta: 'Reach out to us',
  // secondaryCta: 'Learn more',
} as const;

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqCategory = {
  id: string;
  title: string;
  items: FaqItem[];
};

export const FAQ_PAGE = {
  label: 'FAQ',
  title: 'Frequently Asked Questions',
  contactPrefix: "Can't find an answer? Reach out to us at",
  contactEmail: 'connect@bestal.co',
  tocTitle: 'Table of Contents',
  categories: [
    {
      id: 'platform',
      title: 'Platform & Talent',
      items: [
        {
          question: 'What is BesTal?',
          answer:
            'BesTal is a talent platform that helps organizations find and engage pre-vetted digital engineering talent, including freelancers, contractors, dedicated engineers, and managed teams.',
        },
        {
          question: 'What does "pre-vetted" mean?',
          answer:
            'Every engineer undergoes a specialist-led assessment before being listed on the platform. Engineers are evaluated across technical depth, problem solving, architecture, code quality, and communication.',
        },
        {
          question: 'Who conducts the assessments?',
          answer:
            "Assessments are conducted by independent specialists with expertise in the engineer's specific domain. For example, a Data & AI engineer is assessed by an experienced Data & AI practitioner.",
        },
        {
          question: 'Can I see assessment results before speaking with an engineer?',
          answer:
            "Yes. Assessment results are available on each engineer's profile, allowing you to review capabilities before scheduling a conversation.",
        },
        {
          question: "What information is available on an engineer's profile?",
          answer:
            'Profiles include: Assessment results | Hourly rate | Availability | Confirmed start date | Verification status | Technology expertise | Professional experience',
        },
        {
          question: 'What technology areas does BesTal support?',
          answer:
            'Our current talent communities include: Data & AI | Cloud & Platform | Full Stack | SAP | ServiceNow | Salesforce | Cybersecurity',
        },
        {
          question: 'How are engineers verified?',
          answer:
            'BesTal verifies engineer identity through a live verification process and independently validates education and employment history. Verification status is displayed on the profile.',
        },
      ],
    },
    {
      id: 'collaboration',
      title: 'Collaboration & Team Integration',
      items: [
        {
          question: 'How do BesTal engineers collaborate with existing teams?',
          answer:
            'BesTal engineers work as an extension of your team. They participate in your communication channels, meetings, development workflows, and delivery processes.',
        },
        {
          question: 'Will engineers follow our existing processes and ways of working?',
          answer:
            'Yes. Engineers adapt to your tools, coding standards, workflows, security requirements, and delivery methodologies.',
        },
        {
          question: 'Can engineers work within Agile teams?',
          answer:
            'Absolutely. Many engineers have experience participating in stand-ups, sprint planning, retrospectives, backlog refinement, and code reviews.',
        },
        {
          question: 'Do engineers work in US time zones?',
          answer:
            'Yes. Engineers commit to working a full business day in one US time zone: Eastern, Central, Mountain, or Pacific.',
        },
        {
          question: 'How much overlap will we have with the engineer?',
          answer:
            'Unlike traditional offshore models that rely on limited overlap, BesTal engineers work a full business day aligned to your chosen US time zone.',
        },
        {
          question: 'How do you evaluate communication skills?',
          answer:
            'Communication is one of the five areas assessed during the evaluation process. Clients can review communication scores and feedback before engaging an engineer.',
        },
        {
          question: 'Have the engineers worked remotely before?',
          answer:
            'Yes. BesTal focuses on engineers who can operate effectively in distributed environments and collaborate with global teams.',
        },
        {
          question: 'Can engineers collaborate with our employees, vendors, and stakeholders?',
          answer:
            'Yes. Engineers can work directly with internal teams, contractors, consultants, vendors, product managers, architects, and business stakeholders.',
        },
        {
          question: 'Can engineers participate in code reviews, architecture discussions, and customer meetings?',
          answer:
            'Yes. Engineers are expected to contribute as active members of your team and can participate wherever their expertise is required.',
        },
        {
          question: 'Can BesTal engineers become long-term members of our team?',
          answer:
            'Yes. BesTal supports both short-term project engagements and long-term team augmentation.',
        },
        {
          question: 'Can we build an entire team through BesTal?',
          answer:
            'Yes. We support both individual placements and dedicated teams, depending on your requirements.',
        },
      ],
    },
    {
      id: 'onboarding',
      title: 'Onboarding & Getting Started',
      items: [
        {
          question: 'How does the onboarding process work?',
          answer:
            'Once you select an engineer, we coordinate onboarding, including confirming the start date, aligning on project expectations, and integrating the engineer into your tools and workflows.',
        },
        {
          question: 'How quickly can an engineer start?',
          answer:
            'Many engineers can start immediately, within 24 hours, or within 48 hours. Confirmed start dates are displayed on their profiles.',
        },
        {
          question: 'What do we need to provide during onboarding?',
          answer:
            'Typically, clients provide: Project overview | Team structure | Required system access | Development standards | Communication channels | Key contacts',
        },
        {
          question: 'Will engineers participate in onboarding sessions and team introductions?',
          answer:
            'Yes. Engineers can attend onboarding meetings, project walkthroughs, knowledge-transfer sessions, and team introductions.',
        },
        {
          question: 'Can engineers use our existing tools and development environment?',
          answer:
            'Yes. Engineers work within your preferred technology stack, collaboration tools, source control systems, and delivery workflows.',
        },
        {
          question: 'What if our onboarding process includes security or compliance requirements?',
          answer:
            'Engineers can participate in your standard onboarding procedures, including security training, compliance reviews, and access approval processes.',
        },
        {
          question: 'Will we have a point of contact from BesTal?',
          answer:
            'Yes. BesTal provides support throughout onboarding and engagement to help ensure a smooth experience.',
        },
        {
          question: 'Can we onboard multiple engineers at the same time?',
          answer:
            'Yes. BesTal supports onboarding both individual engineers and larger teams.',
        },
        {
          question: 'Can we define our own onboarding process?',
          answer:
            "Absolutely. Engineers are expected to follow your organization's onboarding, communication, and delivery practices.",
        },
      ],
    },
    {
      id: 'trial',
      title: 'Free Trial',
      items: [
        {
          question: 'How does the 10-hour Free Trial work?',
          answer:
            'You can assign real work to an engineer for up to 10 hours at no charge. The trial is designed to help you evaluate technical capability, communication, and overall fit.',
        },
        {
          question: 'Can I use the Free Trial as part of onboarding?',
          answer:
            'Yes. Many clients use the trial period to introduce engineers to their systems, workflows, and teams while evaluating fit through real work.',
        },
        {
          question: 'Can I keep the work completed during the trial?',
          answer:
            "Yes. Any work completed during the trial remains with your organization, whether or not you continue the engagement.",
        },
        {
          question: 'What happens after the trial?',
          answer:
            "If you're satisfied with the engineer's performance, you can continue the engagement through BesTal under a paid arrangement.",
        },
        {
          question: "What if the engineer isn't the right fit?",
          answer:
            "The trial is intended to help you make that determination. If the engineer is not the right fit, you're under no obligation to continue.",
        },
        {
          question: 'Is the trial available for every engineer?',
          answer:
            "The Free Trial is available for eligible engineers listed on the platform, subject to availability and BesTal's trial terms.",
        },
      ],
    },
    {
      id: 'engagement',
      title: 'Engagement & Commercials',
      items: [
        {
          question: 'What engagement models does BesTal support?',
          answer:
            'BesTal supports: Individual specialists | Dedicated engineers | Managed teams | Time-and-materials engagements | Fixed-scope project delivery',
        },
        {
          question: 'Are there long-term contracts?',
          answer:
            'No. BesTal offers flexible engagement options designed to align with your business needs.',
        },
        {
          question: 'Can we scale our team after getting started?',
          answer:
            'Yes. You can add engineers or expand into larger teams as your requirements evolve.',
        },
        {
          question: "What if I don't find the right engineer?",
          answer:
            'Our team can work with you to refine your requirements and recommend alternative engineers that better match your technical and business needs.',
        },
        {
          question: 'Is there a fee to browse engineers?',
          answer:
            'No. You can review profiles, assessment results, rates, verification status, and availability before making engagement decisions.',
        },
        {
          question: 'Can we engage engineers for both short-term and long-term projects?',
          answer:
            'Yes. BesTal supports project-based engagements, ongoing team augmentation, and long-term workforce expansion.',
        },
      ],
    },
  ] satisfies FaqCategory[],
} as const;

export const HOME_FAQ_QUESTIONS = [
  'Can I see assessment results before speaking with an engineer?',
  "What information is available on an engineer's profile?",
  'What does "pre-vetted" mean?',
  'How are engineers verified?',
  'Do engineers work in US time zones?',
] as const;

export function getHomeFaqItems(): FaqItem[] {
  const all = FAQ_PAGE.categories.flatMap((c) => c.items);
  return HOME_FAQ_QUESTIONS.map((q) => {
    const item = all.find((i) => i.question === q);
    if (!item) throw new Error(`Missing FAQ: ${q}`);
    return item;
  });
}
