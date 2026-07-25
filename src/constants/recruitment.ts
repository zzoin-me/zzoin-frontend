import type { RecruitmentCategory } from "@/types";

export interface CategoryOption {
  value: RecruitmentCategory;
  label: string;
}

export interface SubRoleOption {
  value: string;
  category: RecruitmentCategory;
}

export const RECRUITMENT_CATEGORIES: CategoryOption[] = [
  { value: "PLANNING", label: "기획" },
  { value: "DESIGN", label: "디자인" },
  { value: "DEVELOPMENT", label: "개발" },
  { value: "MARKETING", label: "마케팅" },
  { value: "ETC", label: "기타" },
];

export const SUB_ROLES: SubRoleOption[] = [
  { value: "서비스 기획", category: "PLANNING" },
  { value: "PM", category: "PLANNING" },
  { value: "프로젝트 매니저", category: "PLANNING" },
  { value: "사업 기획", category: "PLANNING" },

  { value: "UX", category: "DESIGN" },
  { value: "UI", category: "DESIGN" },
  { value: "UX/UI", category: "DESIGN" },
  { value: "그래픽", category: "DESIGN" },
  { value: "브랜드", category: "DESIGN" },
  { value: "일러스트", category: "DESIGN" },

  { value: "프론트엔드", category: "DEVELOPMENT" },
  { value: "백엔드", category: "DEVELOPMENT" },
  { value: "iOS", category: "DEVELOPMENT" },
  { value: "안드로이드", category: "DEVELOPMENT" },
  { value: "크로스플랫폼", category: "DEVELOPMENT" },
  { value: "데스크탑", category: "DEVELOPMENT" },
  { value: "게임 클라이언트", category: "DEVELOPMENT" },
  { value: "게임 서버", category: "DEVELOPMENT" },
  { value: "DevOps", category: "DEVELOPMENT" },
  { value: "데이터 엔지니어링", category: "DEVELOPMENT" },
  { value: "보안", category: "DEVELOPMENT" },

  { value: "콘텐츠", category: "MARKETING" },
  { value: "성장", category: "MARKETING" },
  { value: "SNS", category: "MARKETING" },
  { value: "브랜드", category: "MARKETING" },
  { value: "광고", category: "MARKETING" },
  { value: "PR", category: "MARKETING" },
];

export function getCategoryLabel(c: RecruitmentCategory): string {
  return RECRUITMENT_CATEGORIES.find((x) => x.value === c)?.label ?? c;
}

export function getSubRolesByCategory(c: RecruitmentCategory): SubRoleOption[] {
  return SUB_ROLES.filter((s) => s.category === c);
}
