import { ZONES } from '@/constants/content';
import type { ParsedNeed, Professional, Recommendation } from '@/types';
import { ROUTES } from '@/constants/routes';

const SYNONYMS: Record<string, string[]> = {
  snowflake: ['snowflake'],
  databricks: ['databricks', 'spark', 'delta'],
  fabric: ['fabric', 'power bi', 'synapse'],
  aws: ['aws'],
  azure: ['azure'],
  kubernetes: ['kubernetes', 'k8s'],
  react: ['react', 'frontend', 'next'],
  servicenow: ['servicenow', 'itsm', 'itom'],
  sap: ['sap', 'abap', 's/4hana'],
  salesforce: ['salesforce', 'apex', 'cpq'],
  security: ['security', 'siem', 'iam', 'soc'],
  genai: ['genai', 'llm', 'rag', 'agents', 'gen ai'],
  ml: ['ml', 'mlops', 'machine learning'],
  data: ['data engineer', 'data architect', 'dbt', 'airflow', 'pipeline', 'warehouse', 'migrate', 'migration'],
  cloud: ['cloud', 'devops', 'terraform'],
  qa: ['qa', 'test', 'automation', 'playwright'],
  java: ['java', 'spring', 'kafka'],
  node: ['node', 'backend'],
};

function wordBoundary(alias: string): RegExp {
  return new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}\\b`, 'i');
}

export function parseNeed(text: string): ParsedNeed {
  const result: ParsedNeed = {
    keywords: [],
    zone: null,
    maxRate: null,
    senior: /senior|lead|architect|principal/i.test(text),
    now: /\bnow\b|immediate|asap|this week|this month/i.test(text),
    own: /own|owns|manage|deliver|end.to.end|outcome|team that/i.test(text),
    advice: /should we|strategy|assess|roadmap|architecture review|not sure|which|evaluate|decide/i.test(text),
    hours: /\b(\d{1,3})\s*(hrs|hours)\b/i.test(text),
    months: /quarter|month|months|year/i.test(text),
  };

  ZONES.forEach((zone) => {
    if (wordBoundary(zone).test(text) || wordBoundary(zone.replace('US ', '')).test(text)) {
      result.zone = zone;
    }
  });

  const match =
    text.match(/(?:under|below|<|max|budget|up to)\s*\$?\s*(\d{2,3})/i) || text.match(/\$\s*(\d{2,3})\b/);
  if (match) result.maxRate = Number(match[1]);

  for (const [key, aliases] of Object.entries(SYNONYMS)) {
    if (aliases.some((alias) => wordBoundary(alias).test(text))) {
      result.keywords.push(key);
    }
  }

  return result;
}

export function recommendService(need: ParsedNeed): Recommendation {
  if (need.advice && !need.own) {
    return {
      service: 'Technology Consulting',
      shape: 'Discovery & Assessment',
      why: "You're deciding, not building yet. A fixed-fee assessment gives you a recommended path either way.",
      ctaLabel: 'Explore Technology Consulting',
      ctaTo: ROUTES.consulting,
    };
  }
  if (need.own || need.months) {
    return {
      service: 'Managed Services',
      shape: 'Managed Delivery Pod',
      why: 'You want the outcome owned, not just additional hands. A named team with a delivery lead who reports to you.',
      ctaLabel: 'Explore Managed Services',
      ctaTo: ROUTES.delivery,
    };
  }
  return {
    service: 'Talent Solutions',
    shape: 'Direct engagement',
    why: 'You know what to build and who leads it. Review evaluated professionals directly, with an eligible trial available.',
    ctaLabel: 'Explore Technology Professionals',
    ctaTo: `${ROUTES.workspace}?tab=discover`,
  };
}

export function matchScore(professional: Professional, need: ParsedNeed | null): number | null {
  if (!need) return null;
  let score = 0;
  let max = 0;
  const hay = `${professional.role} ${professional.skills.join(' ')} ${professional.community} ${professional.specialty}`;
  if (need.keywords.length) {
    max += 50;
    score +=
      (50 *
        need.keywords.filter((key) => SYNONYMS[key].some((alias) => wordBoundary(alias).test(hay))).length) /
      need.keywords.length;
  }
  if (need.zone) {
    max += 20;
    if (professional.zone === need.zone) score += 20;
  }
  if (need.maxRate) {
    max += 15;
    if (professional.rate <= need.maxRate) score += 15;
  }
  if (need.senior) {
    max += 10;
    if (professional.years >= 7) score += 10;
  }
  if (need.now) {
    max += 5;
    if (professional.availableInDays <= 3) score += 5;
  }
  return max ? Math.round(40 + (60 * score) / max) : Math.round(professional.score * 0.9);
}

export function matchWhy(professional: Professional, need: ParsedNeed): string {
  const reasons: string[] = [];
  const hay = `${professional.role} ${professional.skills.join(' ')} ${professional.community} ${professional.specialty}`;
  need.keywords.forEach((key) => {
    if (SYNONYMS[key].some((alias) => wordBoundary(alias).test(hay))) reasons.push(`OK ${key}`);
  });
  if (need.zone) reasons.push(professional.zone === need.zone ? `OK ${need.zone}` : `NOT ${professional.zone}`);
  if (need.maxRate) {
    reasons.push(
      professional.rate <= need.maxRate
        ? `OK $${professional.rate} under $${need.maxRate}`
        : `NOT $${professional.rate} over $${need.maxRate}`,
    );
  }
  if (need.senior) {
    reasons.push(
      professional.years >= 7 ? `OK ${professional.years} yrs` : `NOT ${professional.years} yrs, mid-level`,
    );
  }
  return reasons.slice(0, 4).join(' · ');
}

export function availabilityLabel(days: number): string {
  if (days === 0) return 'Available now';
  if (days === 1) return 'In 24 hours';
  return `In ${days} days`;
}
