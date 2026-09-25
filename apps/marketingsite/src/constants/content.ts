import { ROUTES } from '@/constants/routes';
import type {
  Challenge,
  Community,
  EngagementModel,
  LadderModel,
  NamedItem,
  Pillar,
  Scenario,
  StepItem,
} from '@/types';

export const ZONES = ['US Eastern', 'US Central', 'US Mountain', 'US Pacific', 'UK'] as const;

export const DIMENSIONS = [
  'Technical depth',
  'Problem solving',
  'Architecture',
  'Communication',
  'Reliability',
] as const;

export const DIMENSION_DETAILS = [
  'Working command of the primary stack at the depth the role needs.',
  'How they approach an unfamiliar problem, including what they ask before starting.',
  'Trade-offs, failure modes and scale, or implementation only.',
  'Explaining a decision clearly, and being direct about a limitation.',
  'Reviewed over the engagement: confirmed availability, accurate timesheets, commitments kept.',
];

export const COMMUNITIES: Community[] = [
  {
    id: 'digital-engineering',
    title: 'Digital Engineering',
    description:
      'Modern engineering across web, mobile, backend and quality - the core build capability behind most initiatives.',
  },
  {
    id: 'ai-data',
    title: 'AI & Data',
    description:
      'Data platforms, analytics engineering and applied AI - from pipelines to production models.',
  },
  {
    id: 'cloud-devops',
    title: 'Cloud & DevOps',
    description:
      'Cloud architecture, platform engineering, DevOps and SRE - the foundation modern delivery runs on.',
  },
  {
    id: 'enterprise-platforms',
    title: 'Enterprise Platforms',
    description:
      'SAP, ServiceNow, Salesforce and adjacent enterprise systems - configuration-first, upgrade-safe.',
  },
  {
    id: 'transformation',
    title: 'Transformation & Automation',
    description:
      'Security, compliance and process automation work that underpins broader modernization programs.',
  },
];

export const COMMUNITY_CHIP: Record<string, string> = {
  'Digital Engineering': 't',
  'AI & Data': 'v',
  'Cloud & DevOps': 's',
  'Enterprise Platforms': 'p',
  'Transformation & Automation': 't',
};

export const PILLARS: Pillar[] = [
  {
    id: 'consulting',
    title: 'Technology Consulting',
    subtitle: 'Advise + Transform',
    description:
      'Architecture, modernization and technology strategy from specialists who help you decide, then help you execute.',
    items: [
      'Architecture & Technology Strategy',
      'Data, AI & Cloud Advisory',
      'Modernization & Migration Planning',
      'Enterprise Platform Guidance',
    ],
    accent: 'blue',
    icon: 'search',
    href: ROUTES.consulting,
  },
  {
    id: 'delivery',
    title: 'Managed Services',
    subtitle: 'Own + Deliver',
    description:
      'A named team with clear governance, working to defined outcomes and transparent delivery reporting.',
    items: [
      'Managed Engineering & Delivery',
      'Application & Platform Services',
      'Cloud & Technology Operations',
      'Delivery Governance',
    ],
    accent: 'navy',
    icon: 'layers',
    href: ROUTES.delivery,
  },
  {
    id: 'talent',
    title: 'Talent Solutions',
    subtitle: 'Access + Scale',
    description:
      'Evaluated, verified technology professionals you can review and engage directly, at the pace your roadmap needs.',
    items: [
      'Specialist Technology Professionals',
      'Flexible Engagement Models',
      'Evaluation & Verification',
      'Scalable Technology Capacity',
    ],
    accent: 'blue-d',
    icon: 'users',
    href: ROUTES.talent,
  },
];

export const CHALLENGES: Challenge[] = [
  {
    title: 'Modernize Applications',
    description: 'Transform legacy environments and accelerate cloud-native engineering.',
    icon: 'code',
  },
  {
    title: 'Adopt AI & Data',
    description: 'Move AI and data initiatives from exploration toward practical implementation.',
    icon: 'database',
  },
  {
    title: 'Transform Enterprise Platforms',
    description:
      'Strengthen and modernize ServiceNow, Salesforce, SAP, Oracle and other enterprise environments.',
    icon: 'grid',
  },
  {
    title: 'Build & Scale Digital Products',
    description: 'Extend engineering capability across modern digital platforms and applications.',
    icon: 'layers',
  },
  {
    title: 'Strengthen Cloud & DevOps',
    description: 'Improve cloud, platform engineering, DevOps, SRE and delivery automation.',
    icon: 'cloud',
  },
  {
    title: 'Scale Technology Capacity',
    description:
      'Access specialist capability when internal teams need additional expertise or capacity.',
    icon: 'users',
  },
];

export const WHY_ITEMS: { title: string; description: string; icon: string }[] = [
  {
    title: 'Specialist Expertise',
    description: 'Focused capabilities across key and emerging technologies, not a generalist bench.',
    icon: 'star',
  },
  {
    title: 'Flexible Engagement',
    description:
      'Move between consulting, managed services and specialist capacity based on the requirement.',
    icon: 'shuffle',
  },
  {
    title: 'Evaluation & Verification',
    description: 'Structured evaluation and verification embedded into our community model.',
    icon: 'check_circle',
  },
  {
    title: 'Delivery Visibility',
    description: 'Clear governance and visibility across teams, engagements and delivery, in one workspace.',
    icon: 'eye',
  },
];

export const HOME_STEPS: StepItem[] = [
  {
    kicker: '01 · Understand',
    title: 'Define the challenge',
    description: 'Share the challenge, desired outcome, capability gap or delivery requirement.',
    icon: 'search',
  },
  {
    kicker: '02 · Recommend',
    title: 'Identify the right approach',
    description:
      'We help determine whether Technology Consulting, Managed Services or Talent Solutions best fits the requirement.',
    icon: 'compass',
  },
  {
    kicker: '03 · Validate',
    title: 'Review the proposed approach',
    description:
      'Review the relevant expertise, delivery model, team structure, evaluation insights and commercials.',
    icon: 'check_circle',
  },
  {
    kicker: '04 · Start',
    title: 'Begin with the right engagement',
    description:
      'Begin with the engagement approach that fits — a consulting engagement, a managed service, or direct specialist engagement.',
    icon: 'rocket',
  },
  {
    kicker: '05 · Deliver',
    title: 'Maintain visibility',
    description:
      'Track relevant delivery progress, teams, utilization, spend and engagement information through the BesTal Client Workspace.',
    icon: 'bar_chart',
  },
];

export const CONSULTING_STEPS: StepItem[] = [
  {
    kicker: '01',
    title: 'Understand',
    description: 'The challenge, constraints and what "good" looks like for your organization.',
    icon: 'search',
  },
  {
    kicker: '02',
    title: 'Assess',
    description:
      'Current state, options and trade-offs, reviewed by senior specialists in the relevant discipline.',
    icon: 'clipboard',
  },
  {
    kicker: '03',
    title: 'Recommend',
    description: 'A clear, direct recommendation — including when the honest answer is not to build.',
    icon: 'compass',
  },
  {
    kicker: '04',
    title: 'Roadmap',
    description: 'A phased, costed plan you can act on, with or without BesTal.',
    icon: 'map',
  },
  {
    kicker: '05',
    title: 'Support Execution',
    description: 'Where useful, we can support execution directly or hand the roadmap to your team.',
    icon: 'rocket',
  },
];

export const LADDER: LadderModel[] = [
  {
    name: 'Focused Advisory',
    duration: 'Indicative: days to a few weeks',
    description: 'A senior specialist engaged for a specific decision, technical review or second opinion.',
    outcome: 'A clear recommendation on a specific question',
  },
  {
    name: 'Discovery & Assessment',
    duration: 'Indicative: 2-4 weeks, fixed fee',
    description:
      'Current-state assessment, options analysis and a recommended path, from senior consultants in the relevant discipline.',
    outcome: 'Assessment and a recommended path',
  },
  {
    name: 'Transformation Initiative',
    duration: 'Indicative: multi-month, phased',
    description:
      'Target architecture, a costed roadmap, and support through a broader modernization or transformation program.',
    outcome: 'Architecture, roadmap and delivery support',
  },
  {
    name: 'Ongoing Advisory',
    duration: 'Indicative: continuous, as needed',
    description:
      'Standing access to senior specialists for architecture reviews and technology decisions as they arise.',
    outcome: 'Ongoing access to specialist judgment',
  },
];

export const PRACTICES: NamedItem[] = [
  {
    title: 'Strategy & Architecture',
    description:
      'Technology strategy, target architecture and the trade-off decisions that shape everything downstream.',
  },
  {
    title: 'Application Modernization',
    description:
      'Legacy application assessment, re-platforming and migration planning toward maintainable, cloud-ready systems.',
  },
  {
    title: 'AI & Data',
    description:
      'Data platform design and applied AI — from pipelines and warehousing to GenAI systems built with clear evaluation criteria.',
  },
  {
    title: 'Cloud Transformation',
    description:
      'Cloud strategy, landing zones and platform engineering, with cost and operating model considered from day one.',
  },
  {
    title: 'Enterprise Platforms',
    description:
      'SAP, ServiceNow, Salesforce and adjacent systems — configuration-first, so the platform survives its next upgrade.',
  },
  {
    title: 'Integration & Automation',
    description:
      'Systems integration, workflow automation and the connective work that turns separate platforms into one capability.',
  },
];

export const SERVICE_FAMILIES: NamedItem[] = [
  {
    title: 'Managed Engineering & Delivery',
    description: 'Ongoing product and platform engineering delivered by a named team.',
  },
  {
    title: 'Application & Platform Services',
    description: 'Run and evolve existing applications and platforms under an agreed service model.',
  },
  {
    title: 'Cloud & Technology Operations',
    description: 'Operate cloud infrastructure and platform tooling to an agreed governance cadence.',
  },
  {
    title: 'Managed Specialist Services',
    description: 'A dedicated capability in a specific technology area, managed end to end.',
  },
];

export const GOV_AREAS: NamedItem[] = [
  { title: 'Delivery Progress', description: 'What has shipped against what was committed, this period.' },
  { title: 'Quality', description: 'Defect trends and how issues are being addressed.' },
  { title: 'Risks & Dependencies', description: 'What could affect delivery, and who owns resolving it.' },
  { title: 'Service Performance', description: 'How the engagement is performing against what was agreed.' },
  { title: 'Commercial Visibility', description: 'Spend, utilization and invoicing, in view throughout.' },
  { title: 'Governance Cadence', description: 'How and how often BesTal reports, as agreed in the SOW.' },
];

export const EVAL_FRAMEWORK: NamedItem[] = [
  { title: 'Identity', description: 'Confirmed as applicable to the engagement.' },
  { title: 'Employment', description: 'Prior employment checked as applicable.' },
  { title: 'Education', description: 'Academic credentials checked as applicable.' },
  { title: 'Technology Assessment', description: "A specialist assessment in the professional's discipline." },
  { title: 'Engagement Readiness', description: 'Availability and working arrangement confirmed.' },
];

export const MODELS: EngagementModel[] = [
  {
    key: 'Dedicated',
    title: 'Dedicated',
    description:
      'Full-time professionals embedded in your team for 3 to 12+ months. You direct the work; they join your standups.',
    duration: 'Monthly, agreed rate',
  },
  {
    key: 'Flexible',
    title: 'Flexible',
    description: 'Specialists for migrations, launches and short-term projects. Scale as the roadmap moves.',
    duration: 'Weekly, agreed rate',
  },
  {
    key: 'Specialist Experts',
    title: 'Specialist Experts',
    description:
      'Fractional architects and senior advisors for the decisions that are expensive to get wrong.',
    duration: 'Blocks of hours',
  },
  {
    key: 'Project-Based',
    title: 'Project-Based',
    description: 'Outcome-based work scoped in hours or days. Defined deliverable, agreed price.',
    duration: 'Fixed scope, fixed price',
  },
];

export const TRUST_PILLARS: NamedItem[] = [
  {
    title: 'Professional Evaluation & Verification',
    description:
      'Identity, employment, education and technology assessment, checked as applicable before a profile is visible.',
  },
  {
    title: 'Data Protection & Privacy',
    description: 'Purpose-based access and appropriate controls around client and professional information.',
  },
  {
    title: 'Confidentiality',
    description: 'Engagement and client information handled under written confidentiality terms.',
  },
  {
    title: 'Client IP',
    description: 'Work-product and intellectual property ownership addressed in the engagement agreement.',
  },
  {
    title: 'Access & Security Controls',
    description: 'Relevant access and security requirements agreed per engagement, not a one-size claim.',
  },
  {
    title: 'Delivery Governance',
    description:
      'Roles, visibility, risk management and a governance cadence connected to Managed Services.',
  },
];

export const PRINCIPLES: NamedItem[] = [
  {
    title: 'Client Need First',
    description: 'Engagement model follows the requirement, not the other way round.',
  },
  {
    title: 'Specialist Capability',
    description: 'Depth in focused technology areas rather than a generalist bench.',
  },
  {
    title: 'Flexible Engagement',
    description: 'Consulting, managed services or capacity — and the ability to move between them.',
  },
  {
    title: 'Evaluation & Verification',
    description: 'Structured checks embedded into how communities are built.',
  },
  {
    title: 'Delivery Visibility',
    description: 'Governance and reporting clients can actually see.',
  },
  {
    title: 'Responsible Growth',
    description: 'Communities and services grow where BesTal can build genuine depth, not everywhere at once.',
  },
];

export const SCENARIOS: Scenario[] = [
  {
    name: 'Application Modernization',
    communities: ['Digital Engineering'],
    models: ['Consulting', 'Managed Services'],
    challenge:
      'An organization is running critical workflows on an aging application that is increasingly costly to change and difficult to hire for.',
    approach:
      'A Discovery & Assessment engagement to evaluate re-platforming options, followed by a phased modernization delivered as a Managed Delivery Team.',
  },
  {
    name: 'AI & GenAI Adoption',
    communities: ['AI & Data'],
    models: ['Consulting', 'Talent Solutions'],
    challenge:
      'Teams have run early GenAI pilots but have no consistent way to evaluate quality, cost or risk before wider rollout.',
    approach:
      'An Architecture & Roadmap engagement to define an evaluation framework and target architecture, with specialist AI/ML professionals engaged directly to build it out.',
  },
  {
    name: 'Enterprise Platform Transformation',
    communities: ['Enterprise Platforms'],
    models: ['Consulting', 'Managed Services'],
    challenge:
      'A planned ServiceNow or SAP upgrade keeps stalling because of years of undocumented customization.',
    approach:
      'A configuration-first assessment identifying what can move to standard functionality, followed by a Managed Service to carry the platform through the upgrade and beyond.',
  },
  {
    name: 'Cloud & DevOps Transformation',
    communities: ['Cloud & DevOps'],
    models: ['Consulting', 'Managed Services'],
    challenge:
      "Cloud spend has grown faster than the team's ability to govern it, and releases are still largely manual.",
    approach:
      'A Discovery & Assessment engagement on cost and architecture, followed by a Managed Delivery Team to implement platform engineering and delivery automation.',
  },
  {
    name: 'Digital Product Engineering',
    communities: ['Digital Engineering', 'AI & Data'],
    models: ['Talent Solutions', 'Managed Services'],
    challenge:
      "A product team needs to ship faster but doesn't have spare capacity to hire and onboard for a single release cycle.",
    approach:
      'Specialist technology professionals engaged directly for the release, with an option to move into an ongoing Managed Delivery Team if the roadmap continues.',
  },
  {
    name: 'Scaling Specialist Technology Capacity',
    communities: ['Digital Engineering', 'Cloud & DevOps', 'Transformation & Automation'],
    models: ['Talent Solutions'],
    challenge:
      "An internal team has the roadmap but not enough specialist hands to execute it on the current timeline.",
    approach:
      'Evaluated technology professionals engaged directly, reviewed and selected against the team\'s actual requirement, with an eligible trial before a longer engagement.',
  },
  {
    name: 'Build-Operate-Transfer',
    communities: ['Digital Engineering', 'Cloud & DevOps'],
    models: ['Managed Services'],
    challenge:
      'An organization wants to stand up an offshore technology capability but does not want to build the operating model from zero.',
    approach:
      'BesTal builds the team, processes and governance, operates it under an agreed model, then transitions agreed elements on predetermined terms. Scope, duration, people, transition and commercials are defined per engagement — this is not presented as a single standardized or proven model.',
  },
];

export const TALENT_FAQS = [
  {
    q: 'Can I review evaluation insights before a conversation?',
    a: 'For available profiles, clients can review relevant assessment insights, verification status, skills, availability and engagement information before progressing to a discussion.',
  },
  {
    q: 'Who conducts the assessments?',
    a: "Assessments are designed around the relevant technology discipline and conducted using specialist evaluation methods. Where external assessors are used, their evaluation contributes to the professional's Talent Passport.",
  },
  {
    q: 'What can I expect on working arrangements?',
    a: 'Working-hour expectations are agreed based on the engagement. Profiles indicate confirmed availability so clients can evaluate fit before proceeding.',
  },
  {
    q: "What if the trial doesn't work out?",
    a: 'You can request an alternative professional or stop the engagement. Brief structured feedback helps us improve the next match.',
  },
  {
    q: 'Does the rate change after the trial?',
    a: 'The rate shown on the profile is the rate carried into the engagement. It does not change without both parties agreeing in writing.',
  },
];

export const ADVISOR_EXAMPLES = [
  'We need to migrate our legacy warehouse to Databricks in the next two quarters and want a team that owns it.',
  'Two senior GenAI engineers with RAG experience, budget under $40/hr.',
  'Should we move to Microsoft Fabric or stay on Synapse? We need an architecture recommendation.',
  'A fractional cloud architect for a short FinOps review of our AWS account.',
  'One ServiceNow ITSM developer to add capacity to our team.',
];

export const WORKING_PREFERENCES = [
  'Client-Aligned Hours',
  'India Business Hours',
  'Partial Overlap',
  'Flexible',
  'To Be Discussed',
];

export const CONTACT_TOPICS = [
  'Technology Consulting',
  'Managed Services',
  'Talent Solutions',
  'Technology Communities',
  'Partnership',
  'Other',
];

export const FIT_BANDS: Record<string, [number, number]> = {
  'Digital Engineering': [18, 36],
  'AI & Data': [22, 42],
  'Cloud & DevOps': [24, 42],
  'Enterprise Platforms': [26, 44],
  'Transformation & Automation': [26, 42],
};

export const CARD_ICONS: Record<string, string> = {
  'Modernize Applications': 'code',
  'Adopt AI & Data': 'database',
  'Transform Enterprise Platforms': 'grid',
  'Build & Scale Digital Products': 'layers',
  'Strengthen Cloud & DevOps': 'cloud',
  'Scale Technology Capacity': 'users',
  'Digital Engineering': 'code',
  'AI & Data': 'database',
  'Cloud & DevOps': 'cloud',
  'Enterprise Platforms': 'grid',
  'Transformation & Automation': 'shield',
  'Strategy & Architecture': 'compass',
  'Application Modernization': 'refresh',
  'Cloud Transformation': 'cloud',
  'Integration & Automation': 'branch',
  'Focused Advisory': 'message',
  'Discovery & Assessment': 'search',
  'Transformation Initiative': 'trend',
  'Ongoing Advisory': 'refresh',
  'Managed Engineering & Delivery': 'layers',
  'Application & Platform Services': 'package',
  'Cloud & Technology Operations': 'cloud',
  'Managed Specialist Services': 'target',
  'Delivery Progress': 'bar_chart',
  Quality: 'check_circle',
  'Risks & Dependencies': 'alert',
  'Service Performance': 'trend',
  'Commercial Visibility': 'eye',
  'Governance Cadence': 'calendar',
  Dedicated: 'user_check',
  Flexible: 'branch',
  'Specialist Experts': 'award',
  'Project-Based': 'package',
  Identity: 'fingerprint',
  Employment: 'briefcase',
  Education: 'cap',
  'Technology Assessment': 'clipboard_check',
  'Engagement Readiness': 'check_square',
  'Professional Evaluation & Verification': 'shield',
  'Data Protection & Privacy': 'lock',
  Confidentiality: 'eye_off',
  'Client IP': 'copyright',
  'Access & Security Controls': 'key',
  'Delivery Governance': 'settings',
  'Client Need First': 'heart',
  'Specialist Capability': 'star',
  'Flexible Engagement': 'shuffle',
  'Evaluation & Verification': 'check_circle',
  'Delivery Visibility': 'eye',
  'Responsible Growth': 'trend',
  'AI & GenAI Adoption': 'zap',
  'Enterprise Platform Transformation': 'grid',
  'Cloud & DevOps Transformation': 'cloud',
  'Digital Product Engineering': 'code',
  'Scaling Specialist Technology Capacity': 'users',
  'Build-Operate-Transfer': 'repeat',
};

export const STAGES = ['Submitted', 'Scoping', 'Proposal', 'Active', 'Closed'] as const;

export const ROLES: Record<string, [number, string]> = {
  'Delivery lead': [46, 'Managed Services'],
  'Senior engineer': [38, 'Digital Engineering'],
  Engineer: [28, 'Digital Engineering'],
  'Data engineer': [34, 'AI & Data'],
  'AI/ML engineer': [38, 'AI & Data'],
  'QA automation': [24, 'Digital Engineering'],
  'DevOps engineer': [36, 'Cloud & DevOps'],
  'Architect (fractional)': [52, 'Cloud & DevOps'],
};

export const AVATAR_COLORS = [
  '#0B1F3A',
  '#0B66C3',
  '#25507A',
  '#5B6B82',
  '#0B1F3A',
  '#0B66C3',
  '#25507A',
  '#5B6B82',
  '#0B1F3A',
  '#0B66C3',
  '#25507A',
  '#5B6B82',
  '#0B1F3A',
  '#0B66C3',
];
