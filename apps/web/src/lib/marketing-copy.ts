/** Marketing copy from bestal_prototype_v2.html
 *  Note: strings with trial hour counts (e.g. "10 hours") are templates — pages use
 *  `marketing-trial-copy.ts` builders + `useFreeTrialHours()` for live platform settings.
 */

export const EVIDENCE_STRIP = [
  {
    num: '01',
    title: 'AI-Assessed. BesTal-reviewed',
    body: `Powered by AI-driven evaluation and validated through BesTal's review process to deliver accurate, high-quality results.`,
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
    title: 'Know When They Can Start',
    body: 'Every published profile shows confirmed availability upfront—from available now to a specific future start date.',
  },
  {
    num: '06',
    title: '10 Hours Free Trial',
    body: 'Try any engineer on real work at no charge.',
  },
] as const;

export const HOME_STATS = [
  { value: '10', label: 'Hours free trail, on real work,\nbefore you commit' },
  { value: '100%', label: 'Working in\nyour time zone' },
  { value: '5', label: 'Areas every engineer\nis tested on' },
  { value: '7', label: 'Skill Communities' },
] as const;

export const HOME_STEPS = [
  {
    step: 1,
    title: 'Describe your requirement',
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
      'An AI-Assessed. BesTal-reviewed tested them against role-specific criteria. You read the scorecard — including what they were weak at.',
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
  { name: 'Enterprise Apps', body: 'SAP | Oracle ERP | Oracle EPM | OneStream | Anaplan | Workday | Microsoft Dynamics' },
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
    name: 'Enterprise Apps',
    body: 'Enterprise application specialists across leading ERP and planning platforms.',
    badges: ['ERP', 'EPM'],
    tags: [
      'SAP',
      'Oracle ERP',
      'Oracle EPM',
      'OneStream',
      'Anaplan',
      'Workday',
      'Microsoft Dynamics',
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
    title: 'Tested by AI-Assessed. BesTal-reviewed',
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
  { step: 1, title: 'Pick the engineer', body: 'See a strong fit? Move directly to a trial. Prefer to interview the candidate first? Schedule an interview.' },
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

export const TRUST_PAGE = {
  hero: {
    label: 'Trust',
    title: 'Trust at the Core of Every Engagement',
    paragraphs: [
      'At BesTal, trust is built into every stage of how we source, verify, and place talent — from candidate verification and assessment to client engagement.',
      'Our structured processes provide greater transparency, confidence and protection before a professional joins your team, systems or projects.',
    ],
  },
  pillars: [
    {
      id: 'verify',
      title: 'Verify the Professional',
      subtitle: "Know Who You are Engaging.",
      intro:
        'We validate key credentials to help establish candidate identity and professional credibility.',
      items: [
        {
          title: 'Identity Verification',
          body: 'Validation of identity credentials, including Aadhaar & PAN, as applicable.',
        },
        {
          title: 'Employment Verification',
          body: 'Validation of relevant employment history and professional experience.',
        },
        {
          title: 'Legal Checks',
          body: 'Verification of criminal records, litigation history and court records, as applicable. replace Education Verification with Legal Checks.'
        },
      ],
    },
    {
      id: 'assess',
      title: 'Assess the Capability',
      subtitle: 'Go Beyond the Resume.',
      intro:
        'BesTal professionals undergo structured assessments aligned to their skills and experience, helping you evaluate demonstrated capability — not just resume claims.',
      items: [
        {
          title: 'Technical Assessment',
          body: 'Evaluation of relevant technical skills and proficiency.',
        },
        {
          title: 'Assessment Identity',
          body: 'Identity validation to confirm the professional taking the assessment is the same person being presented, preventing proxy test-taking.',
        },
      ],
    },
    {
      id: 'protect',
      title: 'Protect the Engagement',
      subtitle: 'Trust Throughout the Engagement.',
      intro:
        'Our engagement framework is designed to protect client information, intellectual property and business interests throughout the engagement.',
      items: [
        {
          title: 'Data Protection',
          body: 'Responsible handling of candidate and client information with appropriate access controls.',
        },
        {
          title: 'Confidentiality',
          body: 'Clear expectations around the protection of confidential, proprietary and sensitive information.',
        },
        {
          title: 'Client IP Protection',
          body: 'Engagement terms are designed to establish appropriate protection of client work product and intellectual property.',
        },
      ],
    },
  ],
  commitment: {
    title: 'Our Commitment',
    paragraphs: [
      'We are committed to responsible data handling, controlled access, confidentiality and continuous process improvement.',
      'As BesTal grows, we continue to strengthen our security, privacy, compliance and operational controls in line with recognized industry practices.',
      'You get visibility into verification status, assessment results, availability, working hours, start date and rate — before you decide.',
    ],
  },
  closing: {
    title: 'Verified Talent. Greater Confidence.',
    body: "Know who they are. Know what they can do. Know what's been verified — before you decide.",
  },
} as const;

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
    title: 'Sales Inquiries',
    href: 'mailto:sales@bestal.co',
    display: 'connect@bestal.co',
    description: 'Talk to someone about building a team.',
  },
  {
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
  { num: '04', name: 'Enterprise Apps', body: 'SAP · Oracle ERP · Oracle EPM · OneStream · Anaplan · Workday · Microsoft Dynamics' },
  { num: '05', name: 'ServiceNow', body: 'Developers · Architects · ITSM · ITOM · CSM · HRSD · SecOps · Integration Specialists' },
  { num: '06', name: 'Salesforce', body: 'Developers · Administrators · Architects · Marketing Cloud · Service Cloud · Sales Cloud · CPQ · Data Cloud' },
  { num: '07', name: 'Cybersecurity', body: 'SOC & Detection Engineers · IAM · Cloud Security · Application Security · Security Engineering · GRC · Security Architects' },
] as const;

export const FOR_ENGINEERS_ASK = [
  { title: 'A real technical test', body: "By AI-Assessed. BesTal-reviewed in your field — not a recruiter, not a generic aptitude quiz. It's demanding, and not everyone passes." },
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
  subtitle: 'Technology talent should be easier to evaluate before you hire it.',
  body:
    'BesTal gives organizations access to Pre-Vetted Technology Professionals with assessment results, verification status, rates, availability and working hours visible upfront. From individual specialists to managed teams, we help technology leaders add the skills and capacity they need—without carrying unnecessary bench.',
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
      detail:
        'Candidates are sourced into a specialist community and screened on experience, stack depth, and stated availability.',
      stageNums: ['01', '02'],
      width: 100,
      tone: 'light' as const,
    },
    {
      range: '03 – 04',
      label: 'Tested externally, then verified',
      detail:
        'An independent specialist assesses technical depth, then identity and employment claims are verified.',
      stageNums: ['03', '04'],
      width: 88,
      tone: 'mid' as const,
    },
    {
      range: '05 – 06',
      label: 'Priced and time zone assigned',
      detail:
        'The hourly rate is set and published, and working hours are committed against a US time zone.',
      stageNums: ['05', '06'],
      width: 76,
      tone: 'deep' as const,
    },
    {
      range: '07 – 08',
      label: 'Published and maintained',
      detail:
        'The profile goes live only when every prior stage is complete, then availability and hours stay current.',
      stageNums: ['07', '08'],
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
      value: 'AI-Assessed. BesTal-reviewed',
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
      title: 'Tested by AI-Assessed. BesTal-reviewed',
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
            'BesTal is a talent platform that helps organizations find and engage Pre-Vetted Technology Professionals, including freelancers, contractors, dedicated engineers, and managed teams.',
        },
        {
          question: 'What does "Pre-Vetted" mean?',
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
  'What does "Pre-Vetted" mean?',
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

export const TALENT_LANDING_PAGE = {
  hero: {
    label: 'For Talent',
    title: 'Your Skills Deserve More Than a Résumé.',
    subheading:
      'Build a profile that shows what you can do — and get discovered for global technology opportunities.',
    paragraphs: [
      'You\'ve built your skills through years of learning, solving problems and delivering real work. Your next opportunity should recognize that — not just the keywords on your résumé.',
      'BesTal helps skilled technology professionals in India showcase their capabilities and get considered for opportunities with companies and teams around the world.',
      'Bring your skills, experience, assessment results, credentials, availability and work preferences together in one professional profile — giving potential clients a clearer picture of what you can contribute.',
    ],
    hook: 'Get assessed. Get recognized. Get discovered.',
    primaryCta: 'Join the BesTal Talent Network',
    profile: {
      name: 'Leila Haddad',
      role: 'AI / Machine Learning Engineer',
      skills: ['PyTorch', 'LLMOps', 'Python', 'MLOps'],
      experience: '7 years experience',
      score: 95,
      scoreLabel: 'BesTal Score',
      availability: 'Available now',
      image:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=80',
      tabs: ['Skills', 'Assessment', 'Profile'] as const,
      tabRows: [
        { label: 'Talent', value: 'Verified professional profile' },
        { label: 'Capability', value: 'Evidence-based assessment' },
        { label: 'Global Opportunities', value: 'Matched to your preferences' },
      ],
    },
  },
  whyJoin: {
    step: '01',
    title: 'Why Join BesTal?',
    subtitle: 'Let your skills open more doors.',
    intro:
      'BesTal is building a curated community for technology professionals who want meaningful work, greater global exposure and recognition for demonstrated capability.',
    reasons: [
      {
        title: 'Get Discovered for Global Opportunities',
        body:
          'Make your expertise visible for opportunities aligned to your capabilities, experience, availability and work preferences — not simply résumé keywords.',
      },
      {
        title: 'Prove Your Skills Once. Use Them Across Opportunities.',
        body:
          'Complete BesTal\'s structured assessment process and build a richer professional profile that can be considered across relevant opportunities. Spend less time repeatedly proving the basics and more time discussing where you can add value.',
      },
      {
        title: 'Build a Profile That Shows What You Can Do',
        body:
          'Showcase technical expertise, assessment insights, professional experience, projects, credentials, availability, preferred working hours, engagement preferences and rate expectations.',
      },
      {
        title: 'Work With Global Teams',
        body:
          'Get considered for opportunities to collaborate with organizations and technology teams across geographies, industries and modern technology environments.',
      },
      {
        title: 'Choose Opportunities That Fit You',
        body:
          'Depending on the opportunity, engagement models may include freelance, contract, part-time, full-time and project-based work. Share your availability and preferences upfront.',
      },
      {
        title: 'Be Transparent. Expect Transparency.',
        body:
          'BesTal aims to align role expectations, working hours, availability, engagement model and commercial expectations early — so both you and the client can make informed decisions.',
      },
    ],
    cta: 'Join the BesTal Talent Network',
  },
  capabilities: {
    step: '02',
    title: 'More than a résumé. Evidence of your capabilities.',
    subtitle:
      'Your BesTal profile is designed to make your skills, readiness and work preferences easier for the right clients to understand.',
  },
  workSpeak: {
    step: '03',
    title: 'Let Your Work Speak for You',
    subtitle: 'Sometimes the best way to prove yourself isn\'t another interview.',
    intro:
      'For eligible opportunities, clients may evaluate mutual fit through a 10-hour trial engagement, giving you the opportunity to demonstrate your skills through real work before a longer-term engagement is considered.',
    importantLabel: 'Important:',
    importantNote:
      'Approved trial hours are compensated to the professional under the applicable engagement terms. The client trial does not mean unpaid work for talent.',
  },
  advantage: {
    step: '04',
    title: 'The BesTal Advantage',
    subtitle: 'Your expertise. Made visible.',
    intro:
      'Traditional hiring can reduce years of experience to a few pages of a résumé and a handful of keyword searches. BesTal is designed to give demonstrated capability, relevant experience and readiness to contribute greater visibility.',
    evidenceTitle: 'Evidence of your capabilities',
    evidenceBars: [
      { label: 'Technical Capability', value: 95 },
      { label: 'Communication Skills', value: 92 },
      { label: 'Collaboration Style', value: 89 },
      { label: 'Client Readiness', value: 94 },
    ],
    items: [
      {
        title: 'More Than a Résumé',
        body:
          'Showcase skills, assessment insights, experience and professional credentials in one profile.',
      },
      {
        title: 'Capability-Based Matching',
        body:
          'Get considered for opportunities based on demonstrated expertise, experience, availability and client requirements.',
      },
      {
        title: 'Verified Professional Profile',
        body:
          'Build additional credibility by completing applicable identity and professional verification.',
      },
      {
        title: 'Transparent Opportunities',
        body:
          'Share your preferred engagement model, availability, working hours and rate expectations upfront.',
      },
      {
        title: 'Real-World Validation',
        body:
          'For eligible engagements, demonstrate what you can do through actual work — not just another round of interviews.',
      },
    ],
  },
  profileShowcase: {
    label: 'Verified Professional Profile',
    name: 'Marcus Adeyemi',
    role: 'Cloud & Platform Engineer',
    bio: 'Platform engineering, landing zones and delivery automation.',
    skills: ['Python/Go', 'Terraform', 'Azure', 'Platform Eng'],
    breakdown: [
      { label: 'Technical Capability', value: 90 },
      { label: 'Communication Skills', value: 88 },
    ],
    experience: '17 years experience',
    availability: 'Available in 2 weeks',
    timezone: 'GMT +1',
    rate: '$75 / hour',
    badge: 'Western-Standard',
    image:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
  },
  communities: {
    step: '05',
    title: 'Find Your Community',
    subtitleLeft: 'Where does your expertise fit?',
    subtitleRight:
      'Join specialized BesTal Talent Communities across high-demand technology domains:',
    cta: 'Explore Talent Communities',
    ctaHref: '/communities',
    cards: [
      {
        title: 'AI & Machine Learning',
        body: 'Generative AI, AI Engineering, Machine Learning, MLOps and emerging AI skills.',
        image:
          'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Data Engineering & Analytics',
        body: 'Data Engineering, Databricks, Snowflake, Data Platforms, Analytics and Business Intelligence.',
        image:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Cloud & DevOps',
        body: 'AWS, Azure, GCP, DevOps, SRE, Kubernetes and Platform Engineering.',
        image:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Full-Stack & Software Engineering',
        body: 'Java, .NET, Python, React, Angular, Node.js, Mobile and QA Automation.',
        image:
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Enterprise Applications',
        body: 'SAP, Oracle, Microsoft and other enterprise technology platforms.',
        image:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'ServiceNow',
        body: 'Development, architecture, ITSM, ITOM, CSM, HRSD, SecOps and integrations.',
        image:
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Salesforce',
        body: 'Development, administration, architecture, Sales Cloud, Service Cloud, Marketing Cloud and Data Cloud.',
        image:
          'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Cybersecurity',
        body: 'Security engineering, cloud security, IAM, SOC, application security and GRC.',
        image:
          'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=900&q=80',
      },
    ],
  },
  howItWorks: {
    step: '06',
    title: 'How BesTal Works',
    subtitle: 'From your skills to the right opportunity.',
    steps: [
      {
        title: 'Join',
        body:
          'Create your BesTal account and tell us about your experience, skills, career interests and work preferences.',
      },
      {
        title: 'Demonstrate Your Expertise',
        body:
          'Complete a structured assessment designed to understand technical depth, problem solving, communication, collaboration and client readiness.',
      },
      {
        title: 'Get Verified',
        body:
          'Complete applicable identity and professional background verification to strengthen the credibility of your profile.',
      },
      {
        title: 'Build Your BesTal Profile',
        body:
          'Bring your skills, assessment insights, experience, credentials, availability and preferences together in one professional profile.',
      },
      {
        title: 'Get Matched',
        body:
          'When relevant client requirements arise, BesTal can match your profile based on expertise, experience, availability and engagement preferences.',
      },
      {
        title: 'Meet the Client',
        body:
          'If there\'s a strong match, move forward to a client conversation or interview. For eligible opportunities, you may also demonstrate your capability through a real-work trial.',
      },
      {
        title: 'Start Your Engagement',
        body:
          'When you and the client are both comfortable with the fit and engagement terms, start working and doing what matters most: delivering great work.',
      },
    ],
  },
  features: {
    step: '07',
    title: 'Built for Ambitious Technology Professionals',
    body:
      'Whether you\'re an experienced engineer, specialist consultant, architect or emerging technology expert, BesTal gives you another way to make your capabilities visible to the market.',
    items: [
      'Work with global clients and distributed technology teams.',
      'Take on challenging projects aligned to your expertise.',
      'Build experience with international teams and delivery environments.',
      'Earn recognition for specialized and emerging skills.',
      'Find flexible opportunities that fit your career and availability.',
      'Build a stronger professional profile around demonstrated capability.',
    ],
    quote:
      'Whatever your next step looks like, BesTal is designed to help the right opportunities discover the right skills.',
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  },
  transparency: {
    step: '08',
    title: 'A Network Built on Quality and Transparency',
    paragraphs: [
      'BesTal is a curated talent network. Joining the network does not guarantee an interview, project, assignment or placement.',
      'Opportunities depend on client demand, your skills and experience, assessment results, availability, work preferences and fit with specific client requirements.',
      'We believe being transparent about this matters.',
      'Our goal isn\'t to send every opportunity to every professional. It\'s to create better matches between proven talent and organizations that need those capabilities.',
    ],
  },
  cta: {
    step: '09',
    title: 'Ready to Let Your Skills Speak for You?',
    body:
      'Start with a simple profile. You can complete your assessment, verification and detailed preferences as you move through the BesTal process.',
    quickStepTitle: 'A quick first step',
    quickStepBody:
      'To join, we recommend asking only for: Name, Email, Mobile Number, Primary Skill, Years of Experience, and LinkedIn Profile or Résumé. Additional details can be completed after signup.',
    tagline:
      'Showcase your expertise. Demonstrate your capabilities. Get discovered for opportunities that match what you do best.',
    headline: 'Your Skills Deserve More Than a Résumé.',
    primaryCta: 'Join the BesTal Talent Network',
    signInLabel: 'Already registered? Sign In',
    signInHref: '/login/portal',
    assessmentLabel: 'Want to know more? See How BesTal Assessment Works',
    assessmentHref: '/evaluation-standard',
    checklist: [
      'Name',
      'Email',
      'Mobile Number',
      'Primary Skill',
      'Years of Experience',
      'LinkedIn Profile or Résumé',
    ],
  },
} as const;

export const CONSULTING_PAGE = {
  hero: {
    titleLine1: 'Specialized Expertise.',
    titleLine2: 'Built for Execution.',
    paragraphs: [
      'From strategy and architecture to engineering and managed delivery, BesTal helps organizations turn technology priorities into measurable progress.',
      'Technology leaders are under constant pressure to modernize platforms, adopt AI, improve data foundations, accelerate product delivery and control cost — often with limited internal capacity and scarce specialist skills.',
      'BesTal Consulting brings together experienced technology specialists, engineering capability and flexible delivery models to help organizations move critical initiatives forward with greater speed, focus and confidence.',
      'Whether you need expert guidance for a complex decision, additional engineering capacity for a transformation program, or a dedicated team accountable for delivery, we shape the engagement around your business objectives, technology environment and operating model.',
    ],
    primaryCta: 'Schedule a Consultation',
    secondaryCta: 'Explore How We Help',
    profiles: [
      {
        name: 'Ananya Rao',
        role: 'Full-Stack Engineer',
        skills: ['TypeScript', 'React'],
        experience: '7 years experience',
        availability: 'Available now',
        availabilityTone: 'now' as const,
        score: 94,
        image:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      },
      {
        name: 'Leila Haddad',
        role: 'AI / Machine Learning Engineer',
        skills: ['PyTorch', 'LLMOps'],
        experience: '7 years experience',
        availability: 'Available now',
        availabilityTone: 'now' as const,
        score: 95,
        image:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      },
      {
        name: 'Marcus Adeyemi',
        role: 'Cloud & Platform Engineer',
        skills: ['Kubernetes', 'Terraform'],
        experience: '12 years experience',
        availability: 'Available in 2 weeks',
        availabilityTone: 'soon' as const,
        score: 96,
        image:
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      },
      {
        name: 'Diego Alvarez',
        role: 'Data Engineer',
        skills: ['Databricks', 'dbt'],
        experience: '10 years experience',
        availability: 'Available now',
        availabilityTone: 'now' as const,
        score: 93,
        image:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      },
    ],
    pillars: [
      {
        title: 'Advice when you need direction',
        body:
          'Expert guidance for complex technology decisions — from architecture and platform strategy to modernization planning, technical assessments and implementation roadmaps.',
      },
      {
        title: 'Engineering when you need execution',
        body:
          'Extend your ability to build and ship with engineering capability across planning, design, development, integration, testing and release.',
      },
      {
        title: 'Teams when you need scale',
        body:
          'Dedicated or managed teams aligned to a product, platform, workstream or business outcome — shaped around your operating model, time zones and program needs.',
      },
    ],
  },
  intro: {
    columns: [
      { title: 'Advice', sub: 'when you need direction.' },
      { title: 'Engineering', sub: 'when you need execution.' },
      { title: 'Teams', sub: 'when you need scale.' },
    ],
    body:
      'BesTal Consulting is designed to meet organizations where they are — from a focused specialist engagement to an end-to-end delivery team.',
  },
  howWeHelp: {
    title: 'How We Help',
    intro: 'The right capability for the problem in front of you.',
    cardLabel: 'How We Help',
    services: [
      {
        title: 'Technology Advisory & Architecture',
        body:
          'Bring clarity to complex technology decisions. Our specialists can support architecture, platform strategy, solution design, modernization planning, technical assessments and implementation roadmaps — helping leadership teams move from options to informed action.',
        link: 'Schedule a Consultation',
      },
      {
        title: 'Specialized Technology Consulting',
        body:
          'Access deep expertise for initiatives that require skills beyond day-to-day team capacity. BesTal consultants work alongside your teams to solve focused technical challenges, establish sound engineering approaches and accelerate execution.',
        link: 'Schedule a Consultation',
      },
      {
        title: 'Engineering & Product Delivery',
        body:
          'Extend your ability to build and ship. From data platforms and AI solutions to cloud-native applications and enterprise systems, we provide engineering capability across planning, design, development, integration, testing and release.',
        link: 'Schedule a Consultation',
      },
      {
        title: 'Project & Program Delivery Support',
        body:
          'Strengthen critical initiatives with experienced professionals who can contribute across architecture, engineering, delivery management, quality and execution — reducing pressure on internal teams while maintaining alignment with your priorities.',
        link: 'Schedule a Consultation',
      },
      {
        title: 'Dedicated & Managed Teams',
        body:
          'Build cross-functional teams around a defined product, platform, workstream or business outcome. Team structure, governance and delivery cadence can be aligned to your operating model, time zones and program needs.',
        link: 'Schedule a Consultation',
      },
      {
        title: 'Ongoing Engineering Support',
        body:
          'Maintain momentum after go-live. BesTal can provide ongoing engineering, enhancement, platform support and delivery capacity for organizations that need continuity without permanently expanding internal headcount.',
        link: 'Schedule a Consultation',
      },
    ],
  },
  technology: {
    title: 'Our Technology Expertise',
    intro:
      'BesTal supports consulting, engineering and modernization initiatives across core and emerging enterprise technology domains.',
    cards: [
      {
        title: 'Data, Analytics & AI',
        body:
          'Data strategy, data engineering, modern data platforms, analytics, machine learning, Generative AI, AI engineering, MLOps and AI-enabled applications.',
        image:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Cloud, DevOps & Platform Engineering',
        body:
          'Cloud architecture, migration and modernization, AWS, Azure, GCP, DevOps, SRE, Kubernetes, infrastructure automation and platform engineering.',
        image:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Digital & Product Engineering',
        body:
          'Web and mobile applications, APIs, microservices, full-stack engineering, modernization, QA automation and product engineering.',
        image:
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Enterprise Applications',
        body:
          'Enterprise application modernization, implementation and integration across platforms such as SAP, Oracle, Microsoft and related ecosystems.',
        image:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'ServiceNow',
        body:
          'Platform architecture, development, integration and implementation support across relevant ServiceNow workflows and modules.',
        image:
          'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Salesforce',
        body:
          'Architecture, development, integration and platform support across Sales Cloud, Service Cloud, Marketing Cloud, Data Cloud and related solutions.',
        image:
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Cybersecurity',
        body:
          'Security engineering, cloud and application security, IAM, security operations and technology risk support, subject to project-specific capability and requirements.',
        image:
          'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80',
      },
    ],
  },
  professionals: {
    title: 'Built Around Business Priorities',
    intro:
      'Technology consulting creates value when it connects architecture and engineering decisions to the outcomes the business actually needs.',
    quote:
      'Every engagement starts with the business objective — then we shape the capability, team and delivery model around what needs to be achieved.',
    items: [
      'Modernize legacy platforms without disrupting critical operations.',
      'Build stronger data foundations for analytics, AI and automation.',
      'Move AI initiatives from experimentation toward production use cases.',
      'Accelerate cloud adoption and improve platform scalability and resilience.',
      'Increase product and engineering throughput when internal capacity is constrained.',
      'Access specialized skills for SAP, ServiceNow, Salesforce and enterprise platforms.',
      'Strengthen delivery capability for transformation programs and time-sensitive initiatives.',
      'Create flexible capacity without permanently carrying skills that may only be required for a specific phase or program.',
    ],
  },
  why: {
    step: '05',
    title: 'Why BesTal Consulting?',
    intro: 'Enterprise thinking. Specialist expertise. Flexible execution.',
    items: [
      {
        title: 'Specialists, Not Generic Capacity',
        body:
          'Access professionals aligned to the problem you are solving — from architects and senior engineers to platform specialists and cross-functional delivery teams.',
      },
      {
        title: 'From Advice to Execution',
        body:
          'We can support the journey from assessment and architecture through implementation and ongoing engineering, reducing the gap between strategy and delivery.',
      },
      {
        title: 'Flexible by Design',
        body:
          'Engage an individual specialist, a dedicated team, a project-based unit or ongoing delivery capacity. The model can adapt as priorities, scope and demand evolve.',
      },
      {
        title: 'Greater Transparency',
        body:
          'For talent-led engagements, relevant assessment insights, verification status, availability and commercial information can be made visible upfront, helping clients make faster, better-informed decisions.',
      },
      {
        title: 'Global Delivery, Local Alignment',
        body:
          'Support distributed organizations across the US, UK, Middle East and India with delivery structures designed around client time zones, collaboration needs and program governance.',
      },
      {
        title: 'Enterprise & GCC Ready',
        body:
          'Our model is suited to enterprises, Global Capability Centers, product companies and technology organizations that need specialist capability while preserving control, governance and flexibility.',
      },
      {
        title: 'Outcome-Focused',
        body:
          'We start with the business and technology objective, then shape the capability, team and delivery model around what needs to be achieved — not around a predetermined staffing construct.',
      },
    ],
  },
  engagement: {
    title: 'Engagement Models',
    intro: 'Choose the level of ownership and flexibility your initiative requires.',
    models: [
      {
        num: '01',
        title: 'Expert-on-Demand',
        body:
          'Bring in a specialist architect, consultant or senior engineer for a focused challenge, technical decision or defined period.',
      },
      {
        num: '02',
        title: 'Team Augmentation',
        body:
          'Add experienced professionals to an existing product, engineering or transformation team while retaining day-to-day client ownership.',
      },
      {
        num: '03',
        title: 'Dedicated Team',
        body:
          'Create a stable, cross-functional team aligned to a product, platform or workstream, operating as an extension of your organization.',
      },
      {
        num: '04',
        title: 'Project-Based Delivery',
        body:
          'Define a scope, milestones and delivery responsibilities around a specific initiative. Commercial and governance structure can be aligned to the clarity and risk profile of the work.',
      },
      {
        num: '05',
        title: 'Managed Delivery',
        body:
          'BesTal assumes greater responsibility for team structure, delivery management, execution cadence and defined outcomes within the agreed scope.',
      },
      {
        num: '06',
        title: 'Ongoing Engineering Capacity',
        body:
          'Maintain access to engineering capability for enhancement, modernization, operational improvement or evolving product needs without permanently expanding internal capacity.',
      },
    ],
  },
  approach: {
    step: '06',
    title: 'Our Approach',
    intro: 'Start with the problem. Build the right team. Stay focused on outcomes.',
    steps: [
      {
        num: '01',
        title: 'Understand',
        body:
          'We begin with the business objective, technology context, constraints, stakeholders, timelines and definition of success.',
      },
      {
        num: '02',
        title: 'Shape',
        body:
          'We define the expertise, team structure, delivery model and governance appropriate to the initiative.',
      },
      {
        num: '03',
        title: 'Mobilize',
        body:
          'We bring together the required specialists and establish ways of working, ownership, communication and delivery cadence.',
      },
      {
        num: '04',
        title: 'Execute',
        body:
          'The team works against agreed priorities, milestones and engineering standards, with transparent progress and active issue management.',
      },
      {
        num: '05',
        title: 'Adapt',
        body:
          'As requirements evolve, capacity and specialist skills can be adjusted to keep the engagement aligned to business needs.',
      },
      {
        num: '06',
        title: 'Transfer & Scale',
        body:
          'Where appropriate, we support knowledge transfer, transition, ongoing delivery or expansion into the next phase.',
      },
    ],
  },
  leaders: {
    title: 'Designed for Technology Leaders',
    intro:
      'BesTal Consulting is built for leaders who need to move important technology work forward without creating unnecessary complexity.',
    roles: [
      {
        num: '01',
        title: 'CTO / CIO',
        body:
          'Modernize technology, improve resilience, access specialist expertise and balance transformation priorities with cost and risk.',
      },
      {
        num: '02',
        title: 'CDO / Head of Data & AI',
        body:
          'Strengthen data foundations, accelerate analytics and AI initiatives, and access engineers who can move concepts toward production.',
      },
      {
        num: '03',
        title: 'VP / Director of Engineering',
        body:
          'Increase engineering capacity, close skill gaps, improve delivery velocity and scale teams around changing product priorities.',
      },
      {
        num: '04',
        title: 'COO / Transformation Leader',
        body:
          'Add execution capacity to strategic programs while maintaining visibility, governance and alignment to business outcomes.',
      },
      {
        num: '05',
        title: 'CEO / Business Leader',
        body:
          'Access technology capability that helps accelerate growth, modernization and operational change without unnecessary fixed capacity.',
      },
      {
        num: '06',
        title: 'Procurement / Vendor Management',
        body:
          'Create clearer engagement structures, commercial visibility and scalable access to specialized technology capability.',
      },
    ],
  },
  closing: {
    sections: [
      {
        title: 'Global Perspective. Delivery Aligned to You.',
        paragraphs: [
          'Organizations increasingly operate across geographies, time zones and distributed teams. BesTal Consulting is designed to support clients across the US, UK, Middle East and India with engagement structures aligned to local business needs and global delivery.',
          'Team composition, working-hour overlap, location strategy and governance are shaped around the engagement — helping distributed teams collaborate effectively without forcing every project into the same delivery model.',
        ],
      },
      {
        title: 'Built for Enterprise Confidence',
        paragraphs: [
          'Enterprise technology work requires more than technical capability. Depending on the engagement, BesTal can align the delivery model around client requirements for confidentiality, access controls, verification, onboarding, IP protection, working practices and governance.',
          'No unsupported compliance claims.',
          'Any security certification, regulatory compliance, data-residency commitment, service-level obligation or industry-specific control should be communicated only when it is formally established and applicable to the engagement.',
        ],
      },
      {
        title: 'Ready to Move a Technology Priority Forward?',
        paragraphs: [
          'Whether you are modernizing a platform, building an AI or data capability, scaling engineering delivery, implementing an enterprise application or addressing a specialist skill gap, BesTal can help you shape the right consulting and delivery model.',
          'Bring us the problem. We’ll help you define the expertise and execution model required to move it forward.',
        ],
      },
    ],
    primaryCta: 'Schedule a Consultation',
    secondaryPrompt: 'Prefer to start with a conversation?',
    secondaryCta: 'Talk to Our Team',
    footerTitle: 'Specialized Expertise. Built for Execution.',
    regions: ['US', 'UK', 'MIDDLE EAST', 'INDIA'],
  },
} as const;
