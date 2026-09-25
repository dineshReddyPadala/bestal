export type PageId =
  | 'home'
  | 'consulting'
  | 'delivery'
  | 'talent'
  | 'communities'
  | 'trust'
  | 'about'
  | 'help'
  | 'candidate'
  | 'contact'
  | 'workspace'
  | 'privacy'
  | 'terms'
  | 'cookies';

export type WorkspaceMode = 'buyer' | 'candidate';

export type BuyerTab =
  | 'overview'
  | 'advisor'
  | 'discover'
  | 'teams'
  | 'delivery'
  | 'consulting'
  | 'workforce'
  | 'projects'
  | 'analytics'
  | 'billing';

export type CandidateTab = 'passport' | 'opps' | 'assess' | 'earn';

export type WorkspaceTab = BuyerTab | CandidateTab;

export type RequestKind = 'consulting' | 'security' | 'general';

export interface NamedItem {
  title: string;
  description: string;
}

export interface Community extends NamedItem {
  id: string;
}

export interface Challenge extends NamedItem {
  icon: string;
}

export interface Pillar {
  id: PageId;
  title: string;
  subtitle: string;
  description: string;
  items: string[];
  accent: 'blue' | 'navy' | 'blue-d';
  icon: string;
  href: string;
}

export interface StepItem {
  kicker: string;
  title: string;
  description: string;
  icon: string;
}

export interface EngagementModel {
  key: string;
  title: string;
  description: string;
  duration: string;
}

export interface LadderModel {
  name: string;
  duration: string;
  description: string;
  outcome: string;
}

export interface Scenario {
  name: string;
  communities: string[];
  models: string[];
  challenge: string;
  approach: string;
}

export interface Professional {
  initials: string;
  name: string;
  role: string;
  community: string;
  specialty: string;
  skills: string[];
  years: number;
  zone: string;
  score: number;
  rate: number;
  availableInDays: number;
  city: string;
  dimensions: number[];
  note: string;
  reservation: string;
  education: string;
  employment: string;
  models: string[];
}

export interface DeliveryPod {
  name: string;
  team: number[];
  lead: number;
  owner: string;
  status: 'green' | 'amber' | 'pending';
  sprint: number;
  velocity: number[];
  commit: number[];
  start: string;
  model: string;
  fee: number;
}

export interface ConsultingRequest {
  title: string;
  type: string;
  stage: number;
  owner: string;
  due: string;
}

export interface ProjectOpportunity {
  title: string;
  hours: string;
  rate: string;
  zone: string;
  skills: string[];
  status: string;
  applicants: number;
}

export interface WorkforceMember {
  professionalIndex: number;
  status: 'live' | 'trial';
  hours: number;
  pending: boolean;
  since: string;
  model: string;
}

export interface Invoice {
  number: string;
  period: string;
  amount: number;
  status: string;
  lines: { Consulting: number; Delivery: number; Talent: number };
}

export interface SpendMonth {
  month: string;
  consulting: number;
  delivery: number;
  talent: number;
}

export interface TeamDraftMember {
  professionalIndex?: number;
  role: string;
  allocation: number;
}

export interface DiscoverFilters {
  query: string;
  community: string;
  availability: string;
  rate: string;
  sort: 'match' | 'score' | 'rate' | 'exp' | 'avail';
}

export interface ParsedNeed {
  keywords: string[];
  zone: string | null;
  maxRate: number | null;
  senior: boolean;
  now: boolean;
  own: boolean;
  advice: boolean;
  hours: boolean;
  months: boolean;
}

export interface Recommendation {
  service: string;
  shape: string;
  why: string;
  ctaLabel: string;
  ctaTo: string;
}

export interface PageMeta {
  title: string;
  description: string;
}

export interface ContactPayload {
  name: string;
  company: string;
  email: string;
  role: string;
  country: string;
  topic: string;
  details: string;
}

export interface CommunityApplication {
  fullName: string;
  email: string;
  mobile: string;
  community: string;
  years: string;
  profileLink: string;
  workingPreference: string;
}

export interface EnquiryPayload {
  name: string;
  email: string;
  company: string;
  details: string;
  kind: RequestKind;
}
