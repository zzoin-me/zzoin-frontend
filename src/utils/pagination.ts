export type PageEntry = number | "...";

export function getPageList(current: number, total: number): PageEntry[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = Math.max(2, current - 2);
  let end = Math.min(total - 1, current + 2);

  if (end - start < 4) {
    if (current < total / 2) {
      end = Math.min(total - 1, start + 4);
    } else {
      start = Math.max(2, end - 4);
    }
  }

  const pages: PageEntry[] = [1];
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}
