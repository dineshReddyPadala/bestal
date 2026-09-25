import type { PageId, PageMeta } from '@/types';
import { SITE_NAME } from '@/constants/routes';

export const PAGE_META: Record<PageId, PageMeta> = {
  home: {
    title: `${SITE_NAME} | Technology Consulting, Managed Services & Talent Solutions`,
    description:
      'BesTal Solutions helps organizations solve complex challenges, deliver critical initiatives and scale capability through Technology Consulting, Managed Services and Talent Solutions.',
  },
  consulting: {
    title: `Technology Consulting | ${SITE_NAME}`,
    description:
      'Specialist expertise for critical technology decisions and transformation initiatives — architecture, modernization, Data, AI, Cloud and enterprise platforms.',
  },
  delivery: {
    title: `Managed Services | ${SITE_NAME}`,
    description:
      'Technology delivery with clear ownership, governance and accountability. Dedicated teams and managed delivery designed around defined outcomes.',
  },
  talent: {
    title: `Talent Solutions | ${SITE_NAME}`,
    description:
      'Access evaluated technology professionals with greater confidence. Review skills, assessment insights and availability before deciding how to proceed.',
  },
  communities: {
    title: `Technology Communities | ${SITE_NAME}`,
    description:
      'Specialist expertise organized around the capabilities our clients need — one capability engine supporting all three BesTal service lines.',
  },
  trust: {
    title: `Trust & Governance | ${SITE_NAME}`,
    description:
      'Confidence built through transparency, responsible practices and clear accountability across evaluation, data protection and delivery governance.',
  },
  about: {
    title: `About ${SITE_NAME}`,
    description:
      'BesTal is a technology services and solutions company helping organizations build, modernize and scale technology capabilities.',
  },
  help: {
    title: `How We Can Help | ${SITE_NAME}`,
    description:
      'Representative scenarios showing how the BesTal service model can be applied across modernization, AI adoption, cloud and enterprise platforms.',
  },
  candidate: {
    title: `Join Our Community | ${SITE_NAME}`,
    description:
      'Get evaluated once. Build visibility across relevant opportunities as part of a BesTal specialist technology community.',
  },
  contact: {
    title: `Contact | ${SITE_NAME}`,
    description: "Tell us what you're trying to achieve and we'll route it to the right people at BesTal.",
  },
  workspace: {
    title: `Client Workspace | ${SITE_NAME}`,
    description:
      'A demonstration of the BesTal Client Workspace — delivery visibility, teams, engagements and commercials in one place.',
  },
  privacy: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: 'How BesTal Solutions collects, uses and protects information.',
  },
  terms: {
    title: `Terms of Use | ${SITE_NAME}`,
    description: 'Terms governing use of the BesTal Solutions website.',
  },
  cookies: {
    title: `Cookie Policy | ${SITE_NAME}`,
    description: 'How BesTal Solutions uses cookies.',
  },
};
