/** Map community card labels to filter discipline values. */
export function communityToDiscipline(name: string): string {
  const map: Record<string, string> = {
    'AI/ML': 'Machine Learning',
    'Data Engineering': 'Data Engineering',
    'DevOps & Cloud': 'Cloud & Platform',
    'DevOps & cloud': 'Cloud & Platform',
    'Full Stack': 'Full Stack & Engineering',
    'Full stack': 'Full Stack & Engineering',
    SAP: 'Enterprise Apps',
    'Enterprise Apps': 'Enterprise Apps',
    Salesforce: 'Salesforce',
    ServiceNow: 'ServiceNow',
    Others: 'All Disciplines',
    Backend: 'Full Stack',
    Frontend: 'Frontend',
    'Mobile Development': 'Mobile Development',
    'Scrum Master': 'All Disciplines',
    'Product Design': 'All Disciplines',
    'QA Automation': 'QA Automation',
  };

  return map[name] ?? name;
}

/** Map marketing discipline labels back to platform community names. */
export function disciplineToCommunityName(discipline: string): string {
  if (discipline === 'Full Stack & Engineering') return 'Full Stack';
  if (discipline === 'Cloud & Platform') return 'DevOps & Cloud';
  if (discipline === 'Machine Learning') return 'AI/ML';
  if (discipline === 'Enterprise Apps') return 'Enterprise Apps';
  return discipline;
}
