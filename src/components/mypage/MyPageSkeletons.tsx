import { Skeleton } from "@/components/common/Skeleton";
import type { ReactNode } from "react";

function LoadingRegion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="status" aria-label={label} aria-live="polite">
      {children}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ApplicationListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <LoadingRegion label="프로젝트 지원 현황을 불러오는 중">
      <div className="flex flex-col gap-4 md:gap-5">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-[104px] items-center justify-between gap-4 rounded-[20px] border border-grey5 p-5 md:p-6 lg:p-8"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-2/5 md:h-6" />
                <Skeleton className="h-6 w-14 rounded-tag" />
              </div>
              <div className="mt-3 flex gap-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-9 w-20 shrink-0 rounded-tag" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

export function ManagedProjectListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <LoadingRegion label="내 프로젝트를 불러오는 중">
      <div className="flex flex-col gap-4 md:gap-5">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-[112px] items-center justify-between gap-4 rounded-[20px] border border-grey5 p-5 md:p-6 lg:p-8"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-1/2 md:h-6" />
                <Skeleton className="h-6 w-14 rounded-tag" />
              </div>
              <div className="mt-3 flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Skeleton className="h-10 w-10 rounded-[14px] md:h-14 md:w-14" />
              <Skeleton className="h-10 w-16 rounded-[14px] md:h-14 md:w-20" />
            </div>
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

export function NotificationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <LoadingRegion label="알림을 불러오는 중">
      <div className="overflow-hidden rounded-card border border-grey3 bg-bg">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-[88px] items-start gap-4 border-b border-grey3 px-5 py-4 last:border-b-0"
          >
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-2 h-3.5 w-4/5" />
              <Skeleton className="mt-2 h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

export function ProfileInfoSkeleton() {
  return (
    <LoadingRegion label="프로필 정보를 불러오는 중">
      <div className="mt-5 flex flex-col gap-4 md:mt-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <Skeleton className="h-4 w-20 md:h-5" />
            <Skeleton className={`h-4 md:h-5 ${index === 2 ? "w-3/5" : "w-2/5"}`} />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

export function ApplicantListSkeleton({ count = 2, className = "" }: { count?: number; className?: string }) {
  return (
    <LoadingRegion label="지원자 목록을 불러오는 중">
      <div className={`flex flex-col gap-3 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-[76px] items-center justify-between gap-3 rounded-[16px] border border-grey3 bg-bg p-4"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-2 h-3.5 w-20" />
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Skeleton className="h-8 w-14 rounded-tag" />
              <Skeleton className="h-8 w-14 rounded-tag" />
            </div>
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

export function ChatRoomListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <LoadingRegion label="프로젝트 대화를 불러오는 중">
      <div className="overflow-hidden rounded-card border border-grey3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex min-h-[84px] items-center gap-4 border-b border-grey3 p-4 last:border-b-0 md:p-5">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-[18px] w-2/5" />
              <Skeleton className="mt-2 h-3.5 w-3/5" />
            </div>
            <Skeleton className="h-3 w-14 shrink-0" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

export function ReviewListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <LoadingRegion label="프로젝트 후기를 불러오는 중">
      <div className="flex flex-col gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="min-h-[150px] rounded-card border border-grey5 p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-2/5" />
                <Skeleton className="mt-2 h-3.5 w-32" />
              </div>
              <Skeleton className="h-5 w-28 shrink-0" />
            </div>
            <div className="mt-5 flex gap-2">
              <Skeleton className="h-7 w-20 rounded-tag" />
              <Skeleton className="h-7 w-20 rounded-tag" />
              <Skeleton className="h-7 w-20 rounded-tag" />
            </div>
            <Skeleton className="mt-4 h-4 w-4/5" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

export function ReviewSummarySkeleton() {
  return (
    <LoadingRegion label="후기 요약을 불러오는 중">
      <div className="flex min-h-[170px] flex-col items-center gap-6 rounded-card border border-grey5 px-5 py-6 sm:flex-row sm:justify-center sm:gap-12 md:px-8">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex w-full max-w-[190px] flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-full" />
          ))}
        </div>
        <div className="grid w-full max-w-[240px] grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[62px] rounded-[12px]" />
          ))}
        </div>
      </div>
    </LoadingRegion>
  );
}
