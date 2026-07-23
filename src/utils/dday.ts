export function calculateDday(deadline: string): string {
  const target = new Date(deadline).getTime();
  const now = Date.now();
  const diff = target - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "마감";
  if (days === 0) return "D-day";
  return `D-${days}`;
}
