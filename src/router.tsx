import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MyPageLayout } from "@/layouts/MyPageLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import HomePage from "@/pages/main/HomePage";
import ProjectsPage from "@/pages/projects/ProjectsPage";
import ProjectDetailPage from "@/pages/projects/ProjectDetailPage";
import ProjectCreatePage from "@/pages/projects/ProjectCreatePage";
import ProjectManagePage from "@/pages/projects/ProjectManagePage";
import CommunityPage from "@/pages/community/CommunityPage";
import CommunityDetailPage from "@/pages/community/CommunityDetailPage";
import CommunityNewPage from "@/pages/community/CommunityNewPage";
import CommunityBoardPage from "@/pages/community/CommunityBoardPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import OnboardingPage from "@/pages/OnboardingPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import LinkAccountPage from "@/pages/LinkAccountPage";
import MyPageIndexPage from "@/pages/mypage/Index";
import MyPageProfilePage from "@/pages/mypage/Profile";
import MyPageApplicationsPage from "@/pages/mypage/Applications";
import MyPageProjectsPage from "@/pages/mypage/Projects";
import MyPageReviewsPage from "@/pages/mypage/Reviews";
import VerifyUnivPage from "@/pages/mypage/VerifyUniv";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/projects", element: <ProjectsPage /> },
      { path: "/projects/:id", element: <ProjectDetailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/projects/create", element: <ProjectCreatePage /> },
          { path: "/projects/:id/manage", element: <ProjectManagePage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/community", element: <CommunityPage /> },
          { path: "/community/all", element: <CommunityBoardPage board="all" /> },
          { path: "/community/popular", element: <CommunityBoardPage board="popular" /> },
          { path: "/community/mine", element: <CommunityBoardPage board="mine" /> },
          { path: "/community/comments", element: <CommunityBoardPage board="comments" /> },
          { path: "/community/likes", element: <CommunityBoardPage board="likes" /> },
          { path: "/community/saved", element: <CommunityBoardPage board="saved" /> },
          { path: "/community/:id", element: <CommunityDetailPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/community/new", element: <CommunityNewPage /> },
          { path: "/community/:id/edit", element: <CommunityNewPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/mypage",
            element: <MyPageLayout />,
            children: [
              { index: true, element: <MyPageIndexPage /> },
              { path: "profile", element: <MyPageProfilePage /> },
              { path: "verify-univ", element: <VerifyUnivPage /> },
              { path: "applications", element: <MyPageApplicationsPage /> },
              { path: "projects", element: <MyPageProjectsPage /> },
              { path: "reviews", element: <MyPageReviewsPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/link-account", element: <LinkAccountPage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: "/onboarding", element: <OnboardingPage /> }],
      },
    ],
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
