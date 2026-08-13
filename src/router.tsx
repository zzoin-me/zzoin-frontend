import { createBrowserRouter, Navigate } from "react-router";
import { lazy, Suspense, type ReactNode } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MyPageLayout } from "@/layouts/MyPageLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingState } from "@/components/common/LoadingState";

const HomePage = lazy(() => import("@/pages/main/HomePage"));
const ProjectsPage = lazy(() => import("@/pages/projects/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("@/pages/projects/ProjectDetailPage"));
const ProjectCreatePage = lazy(() => import("@/pages/projects/ProjectCreatePage"));
const ProjectManagePage = lazy(() => import("@/pages/projects/ProjectManagePage"));
const ProjectChatPage = lazy(() => import("@/pages/projects/ProjectChatPage"));
const CommunityPage = lazy(() => import("@/pages/community/CommunityPage"));
const CommunityDetailPage = lazy(() => import("@/pages/community/CommunityDetailPage"));
const CommunityNewPage = lazy(() => import("@/pages/community/CommunityNewPage"));
const CommunityBoardPage = lazy(() => import("@/pages/community/CommunityBoardPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const AuthCallbackPage = lazy(() => import("@/pages/AuthCallbackPage"));
const LinkAccountPage = lazy(() => import("@/pages/LinkAccountPage"));
const SocialSignupPage = lazy(() => import("@/pages/SocialSignupPage"));
const AccountRecoveryPage = lazy(() => import("@/pages/AccountRecoveryPage"));
const MyPageIndexPage = lazy(() => import("@/pages/mypage/Index"));
const MyPageProfilePage = lazy(() => import("@/pages/mypage/Profile"));
const MyPageAccountPage = lazy(() => import("@/pages/mypage/Account"));
const MyPageApplicationsPage = lazy(() => import("@/pages/mypage/Applications"));
const MyPageProjectsPage = lazy(() => import("@/pages/mypage/Projects"));
const MyPageReviewsPage = lazy(() => import("@/pages/mypage/Reviews"));
const ReviewWritePage = lazy(() => import("@/pages/mypage/ReviewWrite"));
const MyPageNotificationsPage = lazy(() => import("@/pages/mypage/Notifications"));
const VerifyUnivPage = lazy(() => import("@/pages/mypage/VerifyUniv"));
const MyPageChatsPage = lazy(() => import("@/pages/mypage/Chats"));

function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingState />}>{children}</Suspense>;
}

function lazyRoute(children: ReactNode) {
  return <LazyRoute>{children}</LazyRoute>;
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: lazyRoute(<HomePage />) },
      { path: "/projects", element: lazyRoute(<ProjectsPage />) },
      { path: "/projects/:id", element: lazyRoute(<ProjectDetailPage />) },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/projects/create", element: lazyRoute(<ProjectCreatePage />) },
          { path: "/projects/:id/manage", element: lazyRoute(<ProjectManagePage />) },
          { path: "/projects/:id/chat", element: lazyRoute(<ProjectChatPage />) },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/community",
            element: (
              <LazyRoute>
                <CommunityPage />
              </LazyRoute>
            ),
          },
          {
            path: "/community/all",
            element: (
              <LazyRoute>
                <CommunityBoardPage board="all" />
              </LazyRoute>
            ),
          },
          {
            path: "/community/popular",
            element: (
              <LazyRoute>
                <CommunityBoardPage board="popular" />
              </LazyRoute>
            ),
          },
          {
            path: "/community/mine",
            element: (
              <LazyRoute>
                <CommunityBoardPage board="mine" />
              </LazyRoute>
            ),
          },
          {
            path: "/community/comments",
            element: (
              <LazyRoute>
                <CommunityBoardPage board="comments" />
              </LazyRoute>
            ),
          },
          {
            path: "/community/likes",
            element: (
              <LazyRoute>
                <CommunityBoardPage board="likes" />
              </LazyRoute>
            ),
          },
          {
            path: "/community/saved",
            element: (
              <LazyRoute>
                <CommunityBoardPage board="saved" />
              </LazyRoute>
            ),
          },
          {
            path: "/community/:id",
            element: (
              <LazyRoute>
                <CommunityDetailPage />
              </LazyRoute>
            ),
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/community/new",
            element: (
              <LazyRoute>
                <CommunityNewPage />
              </LazyRoute>
            ),
          },
          {
            path: "/community/:id/edit",
            element: (
              <LazyRoute>
                <CommunityNewPage />
              </LazyRoute>
            ),
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/mypage",
            element: <MyPageLayout />,
            children: [
              { index: true, element: lazyRoute(<MyPageIndexPage />) },
              { path: "profile", element: lazyRoute(<MyPageProfilePage />) },
              { path: "account", element: lazyRoute(<MyPageAccountPage />) },
              { path: "verify-univ", element: lazyRoute(<VerifyUnivPage />) },
              { path: "applications", element: lazyRoute(<MyPageApplicationsPage />) },
              { path: "projects", element: lazyRoute(<MyPageProjectsPage />) },
              { path: "reviews", element: lazyRoute(<MyPageReviewsPage />) },
              { path: "reviews/:projectId", element: lazyRoute(<ReviewWritePage />) },
              { path: "notifications", element: lazyRoute(<MyPageNotificationsPage />) },
              { path: "chats", element: lazyRoute(<MyPageChatsPage />) },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: lazyRoute(<LoginPage />) },
      { path: "/signup", element: lazyRoute(<SignupPage />) },
      { path: "/link-account", element: lazyRoute(<LinkAccountPage />) },
      { path: "/social-signup", element: lazyRoute(<SocialSignupPage />) },
      { path: "/account-recovery", element: lazyRoute(<AccountRecoveryPage />) },
      {
        element: <ProtectedRoute />,
        children: [{ path: "/onboarding", element: lazyRoute(<OnboardingPage />) }],
      },
    ],
  },
  {
    path: "/auth/callback",
    element: lazyRoute(<AuthCallbackPage />),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
