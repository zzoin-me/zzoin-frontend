import type { Review, ReviewSummary } from "@/types";

export const mockReviews: Review[] = [
  {
    id: 1,
    projectId: 101,
    projectTitle: "프로젝트 제목 A",
    rating: 5,
    content: "피드백을 적극적으로 반영해주시고 소통이 원활해서 좋았습니다.",
    createdAt: "2026. 07. 01",
    type: "received",
  },
  {
    id: 2,
    projectId: 102,
    projectTitle: "프로젝트 제목 B",
    rating: 5,
    content: "책임감이 강하고 마감을 잘 지키는 팀원이었습니다.",
    createdAt: "2026. 06. 20",
    type: "received",
  },
  {
    id: 3,
    projectId: 103,
    projectTitle: "프로젝트 제목 C",
    rating: 4,
    content: "전반적으로 훌륭했지만 일정 관리에 조금 아쉬움이 있었습니다.",
    createdAt: "2026. 05. 15",
    type: "received",
  },
  {
    id: 4,
    projectId: 104,
    projectTitle: "프로젝트 제목 D",
    rating: 5,
    content: "기술력도 좋고 팀원들에게 배울 점을 많이 공유해주었습니다.",
    createdAt: "2026. 05. 02",
    type: "received",
  },
  {
    id: 5,
    projectId: 201,
    projectTitle: "프로젝트 제목 E",
    rating: 5,
    content: "정말 좋은 팀에서 일할 수 있어서 감사했습니다.",
    createdAt: "2026. 06. 28",
    type: "written",
  },
  {
    id: 6,
    projectId: 202,
    projectTitle: "프로젝트 제목 F",
    rating: 4,
    content: "배움이 많은 프로젝트였습니다.",
    createdAt: "2026. 04. 10",
    type: "written",
  },
];

export const mockReviewSummary: ReviewSummary = {
  avgRating: 4.6,
  totalCount: 4,
  distribution: {
    5: 3,
    4: 1,
    3: 0,
    2: 0,
    1: 0,
  },
};
