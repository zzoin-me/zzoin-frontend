export type ProjectStatus = "RECRUITING" | "RECRUITMENT_CLOSED" | "IN_PROGRESS" | "COMPLETED";
export type CollaborationType = "ONLINE" | "OFFLINE" | "BOTH";
export type GoalType = "PORTFOLIO" | "PRODUCTION" | "COMPETITION";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type RecruitmentCategory = "PLANNING" | "DESIGN" | "DEVELOPMENT" | "MARKETING";

export interface User {
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
  category: RecruitmentCategory;
  applicantCount: number;
  recruitmentCount: number;
  qualification: string;
  preferred: string;
}

export interface CreateRecruitment {
  category: RecruitmentCategory;
  name: string;
  count: number;
  qualification: string;
  preferred: string;
}

export interface UpdateRecruitment {
  recruitmentId?: number;
  category?: RecruitmentCategory;
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
  categories: RecruitmentCategory[];
  status: ProjectStatus;
  applicantCount: number;
  recruitmentCount: number;
  imageUrl: string;
  authorNickname?: string;
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
  questions?: CustomQuestion[];
  authorNickname?: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  collaborationType: CollaborationType;
  communicationTool: string;
  meetingSchedule?: string;
  period?: string;
  recruitmentDeadline: string;
  goalType: GoalType;
  imageUrl: string;
  recruitments: CreateRecruitment[];
  questions?: CreateQuestion[];
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
  fields?: string[];
  bio?: string;
  profileUrl?: string;
  verified: boolean;
  verifiedEmail?: string;
  nicknameChangeableAt?: string;
  stackInfoList?: StackInfo[];
}

export interface UserProfile {
  name: string;
  fields?: string[];
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
  fields?: string[];
  profileUrl?: string;
  stackIds?: number[];
}

export interface UpdateSchoolProfileRequest {
  major?: string;
  grade?: number;
}

export interface ProjectApplicant {
  applicationId: number;
  userId: number;
  nickName: string;
  profileUrl: string;
  recruitmentName: string;
  recruitmentCategory: RecruitmentCategory;
  stackNames: string[];
  applicationDate: string;
  letter: string;
  schoolName: string;
  major: string;
  grade: number;
  ratingAvg: number;
  status: ApplicationStatus;
  histories: ProjectMember[];
  answers?: AnswerResponse[];
}

export interface ProjectMember {
  projectId: number;
  projectName: string;
  joinedAt: string;
  completedAt: string;
}

export interface ProjectApplicants {
  applicants: ProjectApplicant[];
}

export interface ApplyProjectRequest {
  recruitmentId: number;
  letter: string;
  answers?: QuestionAnswer[];
}

export interface DeleteApplicationRequest {
  applicationId: number;
}

export interface UpdateApplicantStatusRequest {
  status: ApplicationStatus;
}

export interface AuthorDTO {
  userId: number;
  nickname: string;
  profileUrl?: string;
}

export interface PostPreview {
  id: number;
  title: string;
  contentPreview: string;
  author: AuthorDTO;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
}

export interface PostDetail {
  id: number;
  title: string;
  content: string;
  author: AuthorDTO;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  isMine: boolean;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: AuthorDTO;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
}

export interface Comment {
  id: number;
  content: string;
  author: AuthorDTO;
  parentId: number | null;
  depth: number;
  createdAt: string;
  isMine: boolean;
  isDeleted: boolean;
  children?: Comment[];
}

export type CommunityBoardType = "all" | "popular" | "mine" | "comments" | "likes" | "saved";

export type QuestionType = "TEXT" | "SINGLE_CHOICE" | "MULTI_CHOICE";

export interface CreateQuestion {
  type: QuestionType;
  label: string;
  options?: string[];
  required: boolean;
}

export interface CustomQuestion {
  id: number;
  type: QuestionType;
  label: string;
  options?: string[];
  required: boolean;
}

export interface QuestionAnswer {
  questionId: number;
  answerText: string;
}

export interface AnswerResponse {
  questionLabel: string;
  questionType: QuestionType;
  answerText: string;
}

export interface PostListParams {
  board?: CommunityBoardType;
  sort?: "LATEST" | "POPULAR";
  keyword?: string;
  page?: number;
  size?: number;
}

export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: number | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface MyApplicationPreview {
  applicationId: number;
  projectId: number;
  projectTitle: string;
  appliedRecruitmentName: string;
  appliedRecruitmentCategory: RecruitmentCategory;
  status: ApplicationStatus;
  createdAt: string;
}

export interface MyProjectPreview {
  id: number;
  title: string;
  status: ProjectStatus;
  applicantCount: number;
  createdAt: string;
}

export type ReviewType = "received" | "written";

export interface Review {
  id: number;
  projectId: number;
  projectTitle: string;
  rating: number;
  content: string;
  createdAt: string;
  type: ReviewType;
}

export interface ReviewSummary {
  avgRating: number;
  totalCount: number;
  distribution: Record<5 | 4 | 3 | 2 | 1, number>;
}
