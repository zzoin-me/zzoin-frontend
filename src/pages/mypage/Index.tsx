import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  LogOut,
  UserX,
  FolderOpen,
  FileText,
  Heart,
  Edit3,
  Plus,
  PenSquare,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { WithdrawModal } from "@/components/auth/WithdrawModal";
import { Avatar } from "@/components/common/Avatar";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { getMyProjects, getMyApplications } from "@/api/user";
import { getPosts } from "@/api/community";

const mobileMenus = [
  { to: "/mypage/profile", label: "프로필 정보", desc: "닉네임 · 직군 · 기술 스택 · 소개" },
  { to: "/mypage/verify-univ", label: "대학 인증", desc: "학교 · 학과 · 학년 정보 관리" },
  { to: "/mypage/applications", label: "프로젝트 지원 현황", desc: "지원한 프로젝트 현황" },
  { to: "/mypage/projects", label: "내 프로젝트 관리", desc: "생성한 프로젝트 관리" },
  { to: "/mypage/reviews", label: "프로젝트 후기", desc: "참여한 팀원 평가" },
];

export default function MyPageIndexPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const { data: projectsData } = useQuery({
    queryKey: ["my-projects", { status: "RECRUITING", page: 0 }],
    queryFn: () => getMyProjects({ status: "RECRUITING", page: 0, size: 1 }),
    staleTime: 60_000,
  });

  const { data: applicationsData } = useQuery({
    queryKey: ["my-applications", "dashboard-count"],
    queryFn: () => getMyApplications({ size: 1 }),
    staleTime: 60_000,
  });

  const { data: postsData } = useQuery({
    queryKey: ["posts", { board: "mine", page: 0, size: 1 }],
    queryFn: () => getPosts({ board: "mine", page: 0, size: 1 }),
    staleTime: 60_000,
  });

  const activeProjects = projectsData?.totalElements ?? 0;
  const totalApplications = applicationsData?.totalElements ?? 0;
  const totalPosts = postsData?.totalElements ?? 0;

  const stats = [
    { label: "모집 중 프로젝트", value: activeProjects, icon: FolderOpen, to: "/mypage/projects" },
    { label: "지원 현황", value: totalApplications, icon: FileText, to: "/mypage/applications" },
    { label: "작성한 글", value: totalPosts, icon: Heart, to: "/community/mine" },
  ];

  const quickActions = [
    { label: "프로젝트 등록", desc: "새로운 프로젝트를 모집해보세요", icon: Plus, to: "/projects/create" },
    { label: "커뮤니티 글쓰기", desc: "궁금한 점이나 정보를 공유하세요", icon: PenSquare, to: "/community/new" },
  ];

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <Avatar
            nickname={user?.nickname}
            profileUrl={user?.profileImage}
            size="xl"
            className="h-[56px] w-[56px] text-[20px] md:h-[64px] md:w-[64px] lg:h-[76px] lg:w-[76px] lg:text-[28px]"
          />
          <div className="flex flex-col gap-1">
            <h1 className="font-bold text-[20px] text-grey9 md:text-[24px]">
              {user?.nickname ?? "사용자"}님, 반갑습니다!
            </h1>
            <p className="font-regular text-[13px] text-grey6 md:text-[14px]">
              {user?.verified ? "대학 인증 완료" : "대학 인증이 필요합니다"}
            </p>
          </div>
        </div>

        {!user?.verified && (
          <Link
            to="/mypage/verify-univ"
            className="flex items-center justify-between rounded-[20px] border border-primary bg-primary-light px-5 py-4 transition-opacity hover:opacity-90"
          >
            <div className="flex items-center gap-3">
              <Edit3 className="h-5 w-5 text-primary" aria-hidden />
              <span className="font-medium text-[15px] text-grey9">
                대학 인증을 완료하면 모든 기능을 사용할 수 있어요
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-primary" aria-hidden />
          </Link>
        )}

        <div className="hidden gap-4 sm:grid-cols-3 lg:grid">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                to={stat.to}
                className="flex items-center gap-3 rounded-[20px] border border-grey5 p-5 transition-shadow hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-primary-light text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[22px] text-grey9">{stat.value}</span>
                  <span className="font-regular text-[13px] text-grey6">{stat.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="hidden gap-4 lg:grid lg:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.to}
                className="group flex items-center gap-4 rounded-[20px] border border-primary-light bg-primary-light p-6 transition-all hover:shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-avatar-bg text-white transition-colors group-hover:bg-primary">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-[16px] text-grey9">{action.label}</span>
                  <span className="font-regular text-[13px] text-grey6">{action.desc}</span>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 text-grey4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            );
          })}
        </div>

        <div className="lg:hidden">
          <nav className="flex flex-col divide-y divide-grey3 overflow-hidden rounded-card border border-grey3 bg-bg">
            {mobileMenus.map((menu) => (
              <Link
                key={menu.to}
                to={menu.to}
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-grey1"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-[16px] text-grey9">{menu.label}</span>
                  <span className="font-regular text-[12px] text-grey5">{menu.desc}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-grey5" aria-hidden />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 lg:hidden">
          <div className="rounded-card border border-grey3 bg-bg p-4">
            <span className="mb-2 block font-bold text-[13px] tracking-wide text-grey5 uppercase">
              테마
            </span>
            <ThemeToggle />
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex items-center justify-center gap-2 rounded-card border border-grey3 bg-bg px-5 py-3 font-medium text-[15px] text-grey7 hover:text-grey9"
          >
            <LogOut className="h-5 w-5" aria-hidden />
            로그아웃
          </button>
          <button
            type="button"
            onClick={() => setWithdrawOpen(true)}
            className="flex items-center justify-center gap-2 rounded-card border border-grey3 bg-bg px-5 py-3 font-medium text-[15px] text-red-600 hover:text-red-700"
          >
            <UserX className="h-5 w-5" aria-hidden />
            회원 탈퇴
          </button>
        </div>
      </div>

      <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
    </>
  );
}
