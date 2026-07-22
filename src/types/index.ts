export type ProjectStatus = "RECRUITING" | "IN_PROGRESS" | "COMPLETED";
export type CollaborationType = "ONLINE" | "OFFLINE" | "BOTH";
export type GoalType = "PORTFOLIO" | "PRODUCTION" | "COMPETITION";

export interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
  verified?: boolean;
  verifiedEmail?: string;
}

export interface StackInfo {
  id: number;
  name: string;
}

export interface UnivInfo {
  id: number;
  name: string;
  domain: string;
}

export interface Recruitment {
  id: number;
  name: string;
  count: number;
  qualification: string;
  preferred: string;
}

export interface CreateRecruitment {
  name: string;
  count: number;
  qualification: string;
  preferred: string;
}

export interface UpdateRecruitment {
  name?: string;
  count?: number;
  qualification?: string;
  preferred?: string;
}

export interface ProjectPreview {
  id: number;
  title: string;
  description: string;
  recruitmentDeadline: string;
  recruitments: string[];
  status: ProjectStatus;
  currentCount: number;
  totalCount: number;
  imageUrl: string;
}

export interface ProjectDetail {
  id: number;
  title: string;
  description: string;
  collaborationType: CollaborationType;
  communicationTool: string;
  meetingSchedule: string;
  period: string;
  recruitmentDeadline: string;
  goalType: GoalType;
  imageUrl: string;
  projectStatus: ProjectStatus;
  recruitments: Recruitment[];
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  collaborationType: CollaborationType;
  communicationTool: string;
  meetingSchedule: string;
  period: string;
  recruitmentDeadline: string;
  goalType: GoalType;
  imageUrl: string;
  recruitments: CreateRecruitment[];
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  collaborationType?: CollaborationType;
  communicationTool?: string;
  meetingSchedule?: string;
  period?: string;
  recruitmentDeadline?: string;
  goalType?: GoalType;
  imageUrl?: string;
  recruitments?: UpdateRecruitment[];
}

export interface MyProfile {
  name: string;
  email: string;
  field?: string;
  bio?: string;
  profileUrl?: string;
  verified: boolean;
  verifiedEmail?: string;
  stackInfoList?: StackInfo[];
}

export interface UserProfile {
  name: string;
  field?: string;
  bio?: string;
  profileUrl?: string;
  verified: boolean;
  stackInfoList?: StackInfo[];
}

export interface SchoolProfile {
  schoolName: string;
  major?: string;
  grade?: number;
}

export interface UpdateProfileRequest {
  nickName?: string;
  bio?: string;
  field?: string;
  profileUrl?: string;
  stackIds?: number[];
}

export interface UpdateSchoolProfileRequest {
  major?: string;
  grade?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  tags: string[];
  currentMembers: number;
  maxMembers: number;
  dday: string;
  author: string;
  status: "recruiting" | "closed";
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
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
