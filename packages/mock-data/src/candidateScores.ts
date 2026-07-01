export const candidateScores: Record<number, number> = {
  1: 94,
  2: 96,
  3: 87,
  4: 91,
  5: 93,
  6: 88,
  7: 90,
  8: 85,
  9: 89,
  10: 89,
  11: 82,
  12: 86,
};

export function getBestalScore(candidateId: number): number {
  return candidateScores[candidateId] ?? 0;
}
