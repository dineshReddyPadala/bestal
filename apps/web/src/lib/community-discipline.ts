/** Map community card labels to filter discipline values. */
export function communityToDiscipline(name: string): string {
  if (name === 'Full Stack') return 'Full Stack & Engineering';
  return name;
}

/** Map marketing discipline labels back to platform community names. */
export function disciplineToCommunityName(discipline: string): string {
  if (discipline === 'Full Stack & Engineering') return 'Full Stack';
  return discipline;
}
