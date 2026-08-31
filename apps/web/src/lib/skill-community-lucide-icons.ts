import {
  Box,
  Brain,
  Cloud,
  Code2,
  Database,
  Layers,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

export const SKILL_COMMUNITY_LUCIDE_ICONS: Record<string, LucideIcon> = {
  'AI/ML': Brain,
  'DevOps & Cloud': Cloud,
  'DevOps & cloud': Cloud,
  'Data Engineering': Database,
  'Full Stack': Code2,
  'Full stack': Code2,
  Salesforce: Cloud,
  SAP: Box,
  ServiceNow: Workflow,
  Others: Layers,
};

export function skillCommunityLucideIcon(name: string): LucideIcon {
  return SKILL_COMMUNITY_LUCIDE_ICONS[name] ?? Layers;
}
