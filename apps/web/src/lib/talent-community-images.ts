import { TALENT_LANDING_PAGE } from './marketing-copy';

const TALENT_COMMUNITY_IMAGE_BY_TITLE = Object.fromEntries(
  TALENT_LANDING_PAGE.communities.cards.map((card) => [card.title, card.image]),
) as Record<string, string>;

/** Image path used on the talent landing “Find Your Community” cards. */
export function getTalentCommunityImage(title: string): string {
  return TALENT_COMMUNITY_IMAGE_BY_TITLE[title] ?? TALENT_COMMUNITY_IMAGE_BY_TITLE.Others ?? '';
}

/** Careers “Explore Technology Career Paths” cards mapped to talent community art. */
export const CAREER_PATH_IMAGES = {
  aiMl: getTalentCommunityImage('AI & Machine Learning'),
  dataEngineering: getTalentCommunityImage('Data Engineering & Analytics'),
  cloudDevOps: getTalentCommunityImage('Cloud & DevOps'),
  fullStack: getTalentCommunityImage('Full-Stack & Software Engineering'),
  enterpriseApps: getTalentCommunityImage('Enterprise Applications'),
  serviceNow: getTalentCommunityImage('ServiceNow'),
  salesforce: getTalentCommunityImage('Salesforce'),
  others: getTalentCommunityImage('Others'),
} as const;
