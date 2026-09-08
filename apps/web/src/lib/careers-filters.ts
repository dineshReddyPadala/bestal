export type CareersFilterJob = {
  title: string;
  skillCommunity: string;
  jobLevel: string;
};

export type CareersFilterState = {
  jobName: string;
  disciplines: string[];
  experienceLevels: string[];
};

export function getCareersJobExperienceLevel(job: Pick<CareersFilterJob, 'jobLevel'>): string {
  return job.jobLevel.trim() || 'Open level';
}

export function getCareersDisciplines(jobs: readonly CareersFilterJob[]): string[] {
  return [...new Set(jobs.map((job) => job.skillCommunity).filter(Boolean))].sort();
}

export function getCareersExperienceLevels(jobs: readonly CareersFilterJob[]): string[] {
  return [...new Set(jobs.map((job) => getCareersJobExperienceLevel(job)))].sort();
}

export function countCareersJobsByDiscipline(jobs: readonly CareersFilterJob[]): Record<string, number> {
  return jobs.reduce<Record<string, number>>((counts, job) => {
    counts[job.skillCommunity] = (counts[job.skillCommunity] ?? 0) + 1;
    return counts;
  }, {});
}

export function countCareersJobsByExperienceLevel(
  jobs: readonly CareersFilterJob[],
): Record<string, number> {
  return jobs.reduce<Record<string, number>>((counts, job) => {
    const level = getCareersJobExperienceLevel(job);
    counts[level] = (counts[level] ?? 0) + 1;
    return counts;
  }, {});
}

export function filterCareersJobs<T extends CareersFilterJob>(
  jobs: readonly T[],
  filters: CareersFilterState,
): T[] {
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
