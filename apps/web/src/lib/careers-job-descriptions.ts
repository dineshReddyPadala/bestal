import type { CareerOpeningPublic } from './api/career-openings';

export const CAREERS_WHO_WE_ARE =
  'BesTal is a technology talent platform that helps enterprises hire Pre-Vetted Talent with proven scorecards, transparent rates, and overlap in US time zones. Our teams design and deploy enterprise solutions that are robust, secure, and scalable — across cloud, data, full-stack, and security disciplines.';

export type CareerOpeningView = Pick<
  CareerOpeningPublic,
  | 'title'
  | 'location'
  | 'remote'
  | 'jobLevel'
  | 'experience'
  | 'aboutRole'
  | 'responsibilities'
  | 'requirements'
>;

export type CareersJobDescription = CareerOpeningView & {
  whoWeAre: string;
  location: string;
};

export function formatCareersJobLocation(job: Pick<CareerOpeningView, 'location' | 'remote'>): string {
  return job.remote ? `${job.location} · Remote` : job.location;
}

export function getCareersJobDescription(job: CareerOpeningView): CareersJobDescription {
  return {
    title: job.title,
    location: formatCareersJobLocation(job),
    remote: job.remote,
    jobLevel: job.jobLevel,
    experience: job.experience,
    aboutRole: job.aboutRole,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    whoWeAre: CAREERS_WHO_WE_ARE,
  };
}
