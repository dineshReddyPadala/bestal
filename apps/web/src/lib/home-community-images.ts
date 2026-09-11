/** Card photos for home page skill community grid (matches talent landing communities). */
const HOME_COMMUNITY_IMAGES: Record<string, string> = {
  'AI/ML':
    'AI_ML.jpg',
  'Data Engineering':
    'data_engineer.jpg',
  'DevOps & Cloud':
    'cloude_computing.jpg',
  'Full Stack':
    'full-stack.jpg',
  'Enterprise Apps':
    'application_dev.jpg',
  Salesforce:
    'saleforce.jpg',
  ServiceNow:
    'service_now.jpg',
  Others:
    'others.jpg',
};

const DEFAULT_HOME_COMMUNITY_IMAGE = HOME_COMMUNITY_IMAGES.Others;

export function getHomeCommunityImage(communityName: string): string {
  return HOME_COMMUNITY_IMAGES[communityName] ?? DEFAULT_HOME_COMMUNITY_IMAGE;
}

/** Consulting “Our Technology Expertise” carousel — same art as home skill communities. */
const CONSULTING_TECH_IMAGE_BY_TITLE: Record<string, string> = {
  'Data, Analytics & AI': getHomeCommunityImage('AI/ML'),
  'Cloud, DevOps & Platform Engineering': getHomeCommunityImage('DevOps & Cloud'),
  'Digital & Product Engineering': getHomeCommunityImage('Full Stack'),
  'Enterprise Applications': getHomeCommunityImage('Enterprise Apps'),
  ServiceNow: getHomeCommunityImage('ServiceNow'),
  Salesforce: getHomeCommunityImage('Salesforce'),
  Cybersecurity: getHomeCommunityImage('Others'),
};

export function getConsultingTechImage(title: string): string {
  return CONSULTING_TECH_IMAGE_BY_TITLE[title] ?? DEFAULT_HOME_COMMUNITY_IMAGE;
}
