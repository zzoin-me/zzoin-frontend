import { createBrowserRouter } from "react-router";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MyPageLayout } from "@/layouts/MyPageLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import HomePage from "@/pages/main/HomePage";
import ProjectsPage from "@/pages/projects/ProjectsPage";
import ProjectDetailPage from "@/pages/projects/ProjectDetailPage";
import ProjectCreatePage from "@/pages/projects/ProjectCreatePage";
import CommunityPage from "@/pages/community/CommunityPage";
import CommunityDetailPage from "@/pages/community/CommunityDetailPage";
import CommunityNewPage from "@/pages/community/CommunityNewPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
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
      { path: "/projects/create", element: <ProjectCreatePage /> },
      { path: "/projects/:id", element: <ProjectDetailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/community", element: <CommunityPage /> },
          { path: "/community/new", element: <CommunityNewPage /> },
          { path: "/community/:id", element: <CommunityDetailPage /> },
        ],
      },
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
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
    ],
  },
]);
