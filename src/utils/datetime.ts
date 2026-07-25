export function localDatetimeInputToKstIso(value: string): string {
  if (!value) return "";
  const iso = parseLocalDatetime(value);
  return iso ?? "";
}

export function isoToLocalDatetimeInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${mo}-${da}T${h}:${mi}`;
}

export function formatKoreanDatetime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const h24 = d.getHours();
  const isPm = h24 >= 12;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const meridiem = isPm ? "오후" : "오전";
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${meridiem} ${h12}시 ${String(d.getMinutes()).padStart(2, "0")}분`;
}

function parseLocalDatetime(value: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), 0, 0);
  if (isNaN(date.getTime())) return null;
  const Y = date.getFullYear();
  const Mo = String(date.getMonth() + 1).padStart(2, "0");
  const D = String(date.getDate()).padStart(2, "0");
  const H = String(date.getHours()).padStart(2, "0");
  const Mi = String(date.getMinutes()).padStart(2, "0");
  const S = String(date.getSeconds()).padStart(2, "0");
  return `${Y}-${Mo}-${D}T${H}:${Mi}:${S}`;
}
