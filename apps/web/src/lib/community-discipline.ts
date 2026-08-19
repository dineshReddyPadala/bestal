/** Map community card labels to filter discipline values. */
export function communityToDiscipline(name: string): string {
  if (name === 'Full Stack') return 'Full Stack & Engineering';
  return name;
}
