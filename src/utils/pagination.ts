export type PageEntry = number | "...";

export function getPageList(current: number, total: number, siblingCount = 2): PageEntry[] {
  const minPages = siblingCount * 2 + 5;

  if (total <= minPages) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = Math.max(2, current - siblingCount);
  let end = Math.min(total - 1, current + siblingCount);

  if (end - start < siblingCount * 2) {
    if (current < total / 2) {
      end = Math.min(total - 1, start + siblingCount * 2);
    } else {
      start = Math.max(2, end - siblingCount * 2);
    }
  }

  const pages: PageEntry[] = [1];
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}
