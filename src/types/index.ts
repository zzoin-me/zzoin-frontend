export interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  tags: ProjectTag[];
  currentMembers: number;
  maxMembers: number;
  dday: string; // "D-13" 형식
  author: string;
  status: "recruiting" | "closed";
}

export type ProjectTag = "기획" | "프론트엔드" | "백엔드" | "디자인" | "기타";

export interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string; // "2시간 전" 형식
  tags: string[];
  likes: number;
  comments: number;
  views: number;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
}
