export function mapProgressToClass(percent: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(percent / 10) * 10))
  return `w-p-${clamped}`
}