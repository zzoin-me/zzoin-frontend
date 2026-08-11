export type ProjectStatus = "RECRUITING" | "RECRUITMENT_CLOSED" | "IN_PROGRESS" | "COMPLETED";
export type CollaborationType = "ONLINE" | "OFFLINE" | "BOTH";
export type GoalType = "PORTFOLIO" | "PRODUCTION" | "COMPETITION";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type RecruitmentCategory = "PLANNING" | "DESIGN" | "DEVELOPMENT" | "MARKETING";

export interface JobCategory {
  id: number;
  categoryCode: string;
  name: string;
}

export interface JobRole {
  id: number;
  name: string;
  jobCategoryId: number;
}

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
  jobRoleId: number;
  name: string;
  category: RecruitmentCategory;
  applicantCount: number;
  recruitmentCount: number;
  qualification: string;
  preferred: string;
}

export interface CreateRecruitment {
  jobRoleId: number;
  recruitmentCount: number;
  qualification: string;
  preferred: string;
}

export interface UpdateRecruitment {
  recruitmentId?: number;
  jobRoleId: number;
  recruitmentCount?: number;
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
  socialProfileUrl?: string;
  customProfileImage: boolean;
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
  imageUrls: string[];
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
  imageUrls: string[];
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
  author?: AuthorDTO;
  parentId: number | null;
  depth: number;
  createdAt: string;
  isMine: boolean;
  isDeleted: boolean;
  children?: Comment[];
}

export interface CommentPageResponse {
  comments: Comment[];
  nextCursor: number | null;
  hasNext: boolean;
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
  imageUrls?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  imageUrls?: string[];
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
  projectStatus: ProjectStatus;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  senderNickname: string;
  senderProfileUrl?: string;
  content: string;
  createdAt: string;
  mine: boolean;
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
  nextCursor: number | null;
  hasNext: boolean;
}

export interface ChatRoom {
  projectId: number;
  projectTitle: string;
  projectImageUrl?: string;
  projectStatus: ProjectStatus;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface MyProjectPreview {
  id: number;
  title: string;
  status: ProjectStatus;
  applicantCount: number;
  createdAt: string;
}

export interface ReviewableProject {
  projectId: number;
  title: string;
  recruitment: string;
  joinedAt: string;
  completedAt: string;
  totalTargetCount: number;
  reviewedTargetCount: number;
  reviewCompleted: boolean;
}

export interface ReviewTarget {
  userId: number;
  nickname: string;
  recruitment: string;
  profileUrl?: string;
  reviewed: boolean;
}

export interface ReviewTargetsResponse {
  projectId: number;
  projectTitle: string;
  totalTargetCount: number;
  reviewedTargetCount: number;
  targets: ReviewTarget[];
}

export interface CreateReviewRequest {
  targetUserId: number;
  contribution: number;
  participation: number;
  responsibility: number;
  comment?: string;
}

export interface ReceivedReview {
  reviewId: number;
  projectId: number;
  projectTitle: string;
  contribution: number;
  participation: number;
  responsibility: number;
  avgRating: number;
  comment?: string;
  createdAt: string;
}

export interface WrittenReview extends ReceivedReview {
  targetUserId: number;
  targetNickname: string;
  targetProfileUrl?: string;
  hidden: boolean;
}

export interface ProjectWrittenReview {
  reviewId: number;
  targetUserId: number;
  nickname: string;
  recruitments: string[];
  profileUrl?: string;
  contribution: number;
  participation: number;
  responsibility: number;
  avgRating: number;
  comment?: string;
  createdAt: string;
  hidden: boolean;
}

export interface ProjectWrittenReviewsResponse {
  members: ProjectWrittenReview[];
}

export interface ReceivedReviewsResponse {
  ratingAvg: number;
  ratingCount: number;
  contributionAvg: number;
  participationAvg: number;
  responsibilityAvg: number;
  score5: number;
  score4: number;
  score3: number;
  score2: number;
  score1: number;
  reviews: PageResponse<ReceivedReview>;
}
