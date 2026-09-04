import { publicJobs } from '@bestal/mock-data';
import type { PublicJob } from '@bestal/mock-data';
import { getCareersJobDescription } from './careers-job-descriptions';

export type CareersFilterState = {
  jobName: string;
  disciplines: string[];
  experienceLevels: string[];
};

export function getCareersJobExperienceLevel(job: PublicJob): string {
  return getCareersJobDescription(job).jobLevel;
}

export function getCareersDisciplines(): string[] {
  return [...new Set(publicJobs.map((job) => job.skillCommunity))].sort();
}

export function getCareersExperienceLevels(): string[] {
  return [...new Set(publicJobs.map((job) => getCareersJobExperienceLevel(job)))].sort();
}

export function countCareersJobsByDiscipline(jobs: readonly PublicJob[]): Record<string, number> {
  return jobs.reduce<Record<string, number>>((counts, job) => {
    counts[job.skillCommunity] = (counts[job.skillCommunity] ?? 0) + 1;
    return counts;
  }, {});
}

export function countCareersJobsByExperienceLevel(jobs: readonly PublicJob[]): Record<string, number> {
  return jobs.reduce<Record<string, number>>((counts, job) => {
    const level = getCareersJobExperienceLevel(job);
    counts[level] = (counts[level] ?? 0) + 1;
    return counts;
  }, {});
}

export function filterCareersJobs(
  jobs: readonly PublicJob[],
  filters: CareersFilterState,
): PublicJob[] {
  const query = filters.jobName.trim().toLowerCase();

  return jobs.filter((job) => {
    const experienceLevel = getCareersJobExperienceLevel(job);

    if (query && !job.title.toLowerCase().includes(query)) return false;
    if (filters.disciplines.length > 0 && !filters.disciplines.includes(job.skillCommunity)) {
      return false;
    }
    if (
      filters.experienceLevels.length > 0 &&
      !filters.experienceLevels.includes(experienceLevel)
    ) {
      return false;
    }

    return true;
  });
}

export function toggleFilterValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}
