/** Marketing copy from bestal_prototype_v2.html */

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
    title: '20 Hours Free',
    body: 'Try any engineer on real work at no charge.',
  },
] as const;

export const HOME_STATS = [
  { value: '20', label: 'Hours free, on real work,\nbefore you commit' },
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
    title: 'Try them free for 20 hours',
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
    answer: 'Try any engineer on real work for 20 hours at no charge. You keep the work either way.',
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

export const ONBOARDING_STEPS = [
  {
    step: 1,
    title: 'Identified',
    body: 'We source continuously into specific engineering communities against live and anticipated demand — not into a general résumé pool.',
  },
  {
    step: 2,
    title: 'Screened',
    body: 'A recruiter in the relevant community reviews experience, stack depth, English fluency and stated availability. Most applicants stop here.',
  },
  {
    step: 3,
    title: 'Tested by an outside specialist',
    body: 'A qualified specialist — not a BesTal recruiter — tests the engineer against role-specific criteria and scores technical depth, problem solving, architecture, code quality and communication separately.',
    fact: '[FACT: tester sourcing and qualification criteria]',
  },
  {
    step: 4,
    title: 'Verified',
    body: 'Identity confirmed against a live capture. Education and employment history independently checked.',
    fact: '[FACT: verification provider and scope]',
  },
  {
    step: 5,
    title: 'Rated',
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
    title: 'Start a 20-hour free trial',
    body: 'Pick an engineer and put them on real work for 20 hours, at no charge. No interview round required — the test results and the trial replace it.',
  },
  {
    step: 5,
    title: 'Continue, swap, or stop',
    body: 'Move into a paid engagement, swap for a different engineer, or stop.',
    fact: '[FACT: replacement turnaround commitment]',
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
    'What the 20 hours are spent on',
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
  { title: 'Architecture and design', body: 'Whether they can reason about trade-offs, failure modes and scale — or only implement.' },
  { title: 'Code quality', body: 'Structure, readability, testing instinct, error handling.' },
  { title: 'Communication', body: 'Whether they can explain a technical decision to your team, disagree usefully, and say "I don\'t know."' },
] as const;

export const RATE_FACTORS = [
  { num: '01', title: 'Skill and discipline', body: 'Scarcity differs sharply. A GenAI engineer and a QA automation engineer aren\'t priced alike.' },
  { num: '02', title: 'Experience', body: 'Depend on the experiecen level, what the test showed and what resume claimed.' },
  { num: '03', title: 'Tested depth', body: 'What the test showed, not what the résumé claimed.' },
  { num: '04', title: 'Scarcity', body: 'Real supply in that discipline at the depth you need.' },
  { num: '05', title: 'Start date', body: "Available-now senior engineers carry a premium. That's honest supply and demand." },
  { num: '06', title: 'Certification', body: "Where it's genuinely load-bearing, as in SAP and ServiceNow." },
] as const;

export const TRIAL_STEPS = [
  { step: 1, title: 'Pick the engineer', body: 'Any profile marked 20-Hour Trial. No interview round required — the test results tell you what an interview would.' },
  { step: 2, title: 'Define the 20 hours', body: 'A specific deliverable, written success criteria, and a named manager on your side.' },
  { step: 3, title: 'They start', body: 'Your systems, your access controls, your standups, working your business hours. Most trials begin within 24 to 48 hours of confirmation.' },
  { step: 4, title: 'Decide', body: 'Continue into a paid engagement, swap for a different engineer, or stop. No charge for the 20 hours either way.' },
] as const;

export const TRIAL_SETTLED = [
  { strong: 'The 20 hours are free.', rest: ' No card, no deposit, no invoice.' },
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
  { title: 'Your results, published', body: 'Including what the tester thought you were strong at. Clients see evidence, not a résumé.' },
  { title: 'A rate you agreed to', body: "You know what you're paid before you accept anything.", fact: '[FACT: pay-rate transparency policy]' },
  { title: 'Work that matches your stack', body: 'Matched on tested depth, not keyword overlap.' },
  { title: 'US clients, without relocating', body: 'Work with US engineering teams from where you are, on hours you agreed to.' },
] as const;

export const FOOTER_TAGLINE =
  'Tested, verified and priced before you commit — working a full day in your time zone.';
