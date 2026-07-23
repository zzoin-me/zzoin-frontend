import type { Comment, Post } from "@/types";

export const mockPosts: Post[] = [
  {
    id: "1",
    title: "사이드 프로젝트 팀원 구할 때 이력서 꼭 봐야할까요?",
    content: "보통 지원 자격만 보고 뽑는 편인데 다들 어떻게 판단하시는지 궁금해서 여쭤봅니다...",
    author: "익명 1",
    createdAt: "2시간 전",
    tags: ["사이드 프로젝트", "팀원 모집"],
    likes: 128,
    comments: 24,
    views: 312,
  },
  {
    id: "2",
    title: "학교 밖에서 메이트 구하는 가장 좋은 방법이 뭘까요?",
    content: "대학교 동아리만으로는 한계가 있어서 다른 채널을 찾고 있어요.",
    author: "익명 2",
    createdAt: "5시간 전",
    tags: ["팀원 모집"],
    likes: 64,
    comments: 12,
    views: 187,
  },
  {
    id: "3",
    title: "새내기 때 시작하는 사이드 프로젝트, 현실적일까?",
    content: "전공 기초도 부족한 것 같은데 무리해서 시작해도 될지 고민돼요.",
    author: "익명 3",
    createdAt: "1일 전",
    tags: ["새내기", "사이드 프로젝트"],
    likes: 89,
    comments: 31,
    views: 421,
  },
  {
    id: "4",
    title: "디자이너 없이 프론트만으로 MVP 만들어본 후기",
    content: "Figma 없이 CSS 감각으로만 UI 구성했는데 공유하고 싶은 게 많네요.",
    author: "익명 4",
    createdAt: "2일 전",
    tags: ["프론트엔드", "MVP"],
    likes: 215,
    comments: 42,
    views: 894,
  },
];

export const mockComments: Comment[] = [
  {
    id: "c1",
    postId: "1",
    author: "익명 2",
    content: "저는 포트폴리오 링크 정도만 확인하고 자기소개서 위주로 봐요!",
    createdAt: "1시간 전",
  },
  {
    id: "c2",
    postId: "1",
    author: "익명 5",
    content: "결국엔 커뮤니케이션이 되는지가 가장 큰 것 같아요.",
    createdAt: "30분 전",
  },
];
