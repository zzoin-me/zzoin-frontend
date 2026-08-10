import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ClipboardPenLine, Star } from "lucide-react";
import { CountTabs, type CountTab } from "@/components/common/CountTabs";
import { FilterDropdown, type FilterOption } from "@/components/common/FilterDropdown";
import { LoadingState } from "@/components/common/LoadingState";
import { Pagination } from "@/components/common/Pagination";
import { MyPageTitle } from "@/components/mypage/MyPageTitle";
import {
  getPendingReviewCount,
  getReceivedReviews,
  getReviewableProjects,
  getWrittenReviews,
} from "@/api/reviews";
import type { ReceivedReview, WrittenReview } from "@/types";

const PAGE_SIZE = 10;

const sortOptions: FilterOption[] = [
  { label: "최신순", value: null },
  { label: "오래된순", value: "oldest" },
];

type ReviewTab = "reviewable" | "received" | "written";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function StarRow({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating.toFixed(1)}점`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={
            index < Math.round(rating) ? "fill-primary text-primary" : "fill-grey2 text-grey5"
          }
          style={{ width: size, height: size }}
          aria-hidden
        />
      ))}
    </div>
  );
}

function ScoreDetails({ review }: { review: ReceivedReview | WrittenReview }) {
  return (
    <div className="flex flex-wrap gap-2 font-medium text-[12px] text-grey7 md:text-[13px]">
      <span className="rounded-tag bg-grey2 px-2.5 py-1">기여도 {review.contribution}</span>
      <span className="rounded-tag bg-grey2 px-2.5 py-1">소통·협업 {review.participation}</span>
      <span className="rounded-tag bg-grey2 px-2.5 py-1">책임감 {review.responsibility}</span>
    </div>
  );
}

function RatingDistribution({ scores }: { scores: number[] }) {
  const maxCount = Math.max(...scores, 1);
  return (
    <div className="flex w-full max-w-[190px] flex-col gap-2">
      {[5, 4, 3, 2, 1].map((score) => {
        const count = scores[score] ?? 0;
        return (
          <div key={score} className="flex items-center gap-2">
            <span className="w-6 font-medium text-[12px] text-grey7">{score}점</span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-grey3">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-grey7"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-5 text-right font-medium text-[12px] text-grey7">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function MyPageReviewsPage() {
  const [activeTab, setActiveTab] = useState<ReviewTab>("received");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<string | null>(null);
  const sortValue = sort === "oldest" ? "oldest" : "latest";

  useEffect(() => {
    setPage(1);
  }, [activeTab, sort]);

  const reviewableQuery = useQuery({
    queryKey: ["reviews", "reviewable", page],
    queryFn: () => getReviewableProjects({ page: page - 1, size: PAGE_SIZE }),
    enabled: activeTab === "reviewable",
  });
  const reviewableCountQuery = useQuery({
    queryKey: ["reviews", "reviewable", "count"],
    queryFn: getPendingReviewCount,
  });
  const receivedQuery = useQuery({
    queryKey: ["reviews", "received", page, sortValue],
    queryFn: () => getReceivedReviews({ page: page - 1, size: PAGE_SIZE, sort: sortValue }),
    enabled: activeTab === "received",
  });
  const receivedCountQuery = useQuery({
    queryKey: ["reviews", "received", "count"],
    queryFn: () => getReceivedReviews({ size: 1 }),
  });
  const writtenQuery = useQuery({
    queryKey: ["reviews", "written", page, sortValue],
    queryFn: () => getWrittenReviews({ page: page - 1, size: PAGE_SIZE, sort: sortValue }),
    enabled: activeTab === "written",
  });
  const writtenCountQuery = useQuery({
    queryKey: ["reviews", "written", "count"],
    queryFn: () => getWrittenReviews({ size: 1 }),
  });

  const tabs: CountTab[] = [
    {
      label: "받은 후기",
      value: "received",
      count: receivedCountQuery.data?.ratingCount ?? 0,
    },
    {
      label: "남긴 후기",
      value: "written",
      count: writtenCountQuery.data?.totalElements ?? 0,
    },
    {
      label: "후기 작성",
      value: "reviewable",
      count: reviewableCountQuery.data ?? 0,
    },
  ];

  const activeQuery =
    activeTab === "reviewable"
      ? reviewableQuery
      : activeTab === "received"
        ? receivedQuery
        : writtenQuery;
  const totalPages =
    activeTab === "reviewable"
      ? reviewableQuery.data?.totalPages
      : activeTab === "received"
        ? receivedQuery.data?.reviews.totalPages
        : writtenQuery.data?.totalPages;

  return (
    <div className="flex flex-col gap-6">
      <MyPageTitle>프로젝트 후기</MyPageTitle>
      <CountTabs
        tabs={tabs}
        active={activeTab}
        onChange={(value) => setActiveTab(value as ReviewTab)}
      />

      {activeTab === "received" && receivedQuery.data && (
        <div className="flex flex-col items-center gap-6 rounded-card border border-grey5 px-5 py-6 sm:flex-row sm:justify-center sm:gap-12 md:px-8">
          <div className="flex flex-col items-center gap-2">
            <span className="font-bold text-[36px] leading-none text-grey9">
              {receivedQuery.data.ratingAvg.toFixed(1)}
            </span>
            <StarRow rating={receivedQuery.data.ratingAvg} />
            <span className="font-medium text-[12px] text-grey6">
              받은 후기 {receivedQuery.data.ratingCount}개
            </span>
          </div>
          <RatingDistribution
            scores={[
              0,
              receivedQuery.data.score1,
              receivedQuery.data.score2,
              receivedQuery.data.score3,
              receivedQuery.data.score4,
              receivedQuery.data.score5,
            ]}
          />
          <div className="grid w-full max-w-[240px] grid-cols-3 gap-2 text-center">
            {[
              ["기여도", receivedQuery.data.contributionAvg],
              ["소통·협업", receivedQuery.data.participationAvg],
              ["책임감", receivedQuery.data.responsibilityAvg],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-[12px] bg-grey2 px-2 py-3">
                <strong className="block font-bold text-[18px] text-grey9">
                  {Number(value).toFixed(1)}
                </strong>
                <span className="font-medium text-[11px] text-grey6">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab !== "reviewable" && (
        <div className="flex items-center">
          <FilterDropdown label="최신순" options={sortOptions} value={sort} onChange={setSort} />
        </div>
      )}

      {activeQuery.isLoading ? (
        <LoadingState />
      ) : activeQuery.isError ? (
        <div className="flex min-h-64 items-center justify-center rounded-card border border-grey3">
          <p className="font-medium text-[15px] text-red-500">후기를 불러오지 못했습니다.</p>
        </div>
      ) : activeTab === "reviewable" ? (
        <div className="flex flex-col gap-4">
          {(reviewableQuery.data?.content ?? []).length === 0 ? (
            <EmptyReviews label="후기를 작성할 완료 프로젝트가 없어요." />
          ) : (
            reviewableQuery.data?.content.map((project) => (
              <div
                key={project.projectId}
                className="flex flex-col gap-4 rounded-card border border-grey5 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6"
              >
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-[17px] text-grey9 md:text-[19px]">
                    {project.title}
                  </h2>
                  <p className="mt-1 font-medium text-[13px] text-grey6">
                    {formatDate(project.completedAt)} 완료 · {project.recruitment}
                  </p>
                  <p className="mt-2 font-medium text-[13px] text-grey7">
                    {project.totalTargetCount === 0
                      ? "평가할 팀원이 없습니다."
                      : `${project.reviewedTargetCount}/${project.totalTargetCount}명 작성 완료`}
                  </p>
                </div>
                {project.totalTargetCount > 0 && (
                  <Link
                    to={`/mypage/reviews/${project.projectId}`}
                    className={`shrink-0 rounded-[10px] px-5 py-2.5 text-center font-bold text-[14px] ${
                      project.reviewCompleted
                        ? "border border-grey5 text-grey6"
                        : "bg-primary text-white"
                    }`}
                  >
                    {project.reviewCompleted ? "작성 내용 보기" : "후기 작성"}
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      ) : activeTab === "received" ? (
        <ReviewList reviews={receivedQuery.data?.reviews.content ?? []} type="received" />
      ) : (
        <ReviewList reviews={writtenQuery.data?.content ?? []} type="written" />
      )}

      <Pagination
        currentPage={page}
        totalPages={Math.max(totalPages ?? 1, 1)}
        onPageChange={setPage}
      />
    </div>
  );
}

function ReviewList({
  reviews,
  type,
}: {
  reviews: Array<ReceivedReview | WrittenReview>;
  type: "received" | "written";
}) {
  if (reviews.length === 0) {
    return (
      <EmptyReviews label={type === "received" ? "받은 후기가 없어요." : "남긴 후기가 없어요."} />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => {
        const written = type === "written" ? (review as WrittenReview) : null;
        return (
          <article key={review.reviewId} className="rounded-card border border-grey5 p-5 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="truncate font-bold text-[17px] text-grey9 md:text-[19px]">
                  {review.projectTitle}
                </h2>
                <p className="mt-1 font-medium text-[12px] text-grey5">
                  {written ? `${written.targetNickname}님에게 작성 · ` : ""}
                  {formatDate(review.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StarRow rating={review.avgRating} size={17} />
                <strong className="font-bold text-[21px] text-grey9">
                  {review.avgRating.toFixed(1)}
                </strong>
              </div>
            </div>
            <div className="mt-4">
              <ScoreDetails review={review} />
            </div>
            {(written?.hidden || review.comment) && (
              <p className="mt-4 whitespace-pre-wrap font-medium text-[14px] leading-6 text-grey7 md:text-[15px]">
                {written?.hidden ? "관리자에 의해 숨겨진 후기입니다." : review.comment}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}

function EmptyReviews({ label }: { label: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-card border border-grey3 text-center">
      <ClipboardPenLine className="h-8 w-8 text-grey5" aria-hidden />
      <p className="font-medium text-[15px] text-grey6">{label}</p>
    </div>
  );
}
