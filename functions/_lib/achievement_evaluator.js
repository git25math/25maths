export const XP_THRESHOLDS = [0, 50, 200, 500, 1000, 2000, 4000, 8000, 16000, 32000];

export function computeLevel(totalXp) {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}
