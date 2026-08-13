export const RESERVED_NICKNAME_MESSAGE = "사용할 수 없는 단어가 포함된 닉네임입니다.";

const RESERVED_NICKNAME_TERMS = [
  "admin",
  "administrator",
  "official",
  "support",
  "zzoin",
  "관리자",
  "운영자",
  "고객센터",
  "고객지원",
  "쪼인",
  "deleted",
  "탈퇴",
  "삭제",
  "비활성화",
] as const;

export function containsReservedNicknameTerm(value: string): boolean {
  const comparable = value.normalize("NFKC").toLocaleLowerCase("en-US");
  return RESERVED_NICKNAME_TERMS.some((term) => comparable.includes(term));
}
