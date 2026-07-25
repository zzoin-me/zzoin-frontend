import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { CountTabs, type CountTab } from "@/components/common/CountTabs";
import { FilterDropdown, type FilterOption } from "@/components/common/FilterDropdown";
import { mockReviews, mockReviewSummary } from "@/data/mockReviews";

const sortOptions: FilterOption[] = [
  { label: "최신순", value: null },
  { label: "오래된순", value: "old" },
];

const ratingOptions: FilterOption[] = [
  { label: "별점 전체", value: null },
  { label: "5점", value: "5" },
  { label: "4점", value: "4" },
  { label: "3점", value: "3" },
  { label: "2점", value: "2" },
  { label: "1점", value: "1" },
];

type ReviewFilter = "received" | "written";

function StarRow({ rating, size = 24 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < Math.round(rating) ? "fill-grey9 text-grey9" : "fill-grey2 text-grey5"}
          style={{ width: size, height: size }}
          aria-hidden
        />
      ))}
    </div>
  );
}

function RatingDistribution() {
  const { distribution } = mockReviewSummary;
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className="flex h-[116px] w-full max-w-[160px] flex-col justify-between sm:w-[134px]">
      {([5, 4, 3, 2, 1] as const).map((score) => {
        const count = distribution[score];
        const widthPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
        return (
          <div key={score} className="flex items-center gap-2">
            <span className="font-medium text-[12px] text-grey7">{score}점</span>
            <div className="relative h-[7px] flex-1 overflow-hidden rounded-[20px] bg-grey3">
              <div
                className="absolute left-0 top-0 h-full rounded-[20px] bg-grey7"
                style={{ width: `${widthPercent}%` }}
              />
            </div>
            <span className="font-medium text-[12px] text-grey7">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function MyPageReviewsPage() {
  const [activeTab, setActiveTab] = useState<ReviewFilter>("received");
  const [sort, setSort] = useState<string | null>(null);
  const [rating, setRating] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = mockReviews.filter((r) => r.type === activeTab);
    if (rating) {
      list = list.filter((r) => r.rating === Number(rating));
    }
    if (sort === "old") {
      list = [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } else {
      list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return list;
  }, [activeTab, sort, rating]);

  const tabs: CountTab[] = [
    {
      label: "받은 후기",
      value: "received",
      count: mockReviews.filter((r) => r.type === "received").length,
    },
    {
      label: "남긴 후기",
      value: "written",
      count: mockReviews.filter((r) => r.type === "written").length,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-bold text-[22px] text-grey9 md:text-[26px] lg:text-[28px]">
        프로젝트 후기
      </h1>

      {activeTab === "received" && (
        <div className="flex flex-col items-center gap-6 rounded-[20px] border border-grey5 px-5 py-6 sm:flex-row sm:items-center sm:gap-10 md:gap-12 md:px-8 md:py-5 lg:gap-16">
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-[32px] leading-none text-grey9 md:text-[36px]">
              {mockReviewSummary.avgRating.toFixed(1)}
            </span>
            <StarRow rating={mockReviewSummary.avgRating} size={20} />
            <span className="font-medium text-[12px] text-grey7">받은 후기 평균</span>
          </div>
          <RatingDistribution />
        </div>
      )}

      <CountTabs tabs={tabs} active={activeTab} onChange={(v) => setActiveTab(v as ReviewFilter)} />

      <div className="flex flex-wrap items-center gap-3 lg:gap-6">
        <FilterDropdown label="최신순" options={sortOptions} value={sort} onChange={setSort} />
        <FilterDropdown
          label="별점 전체"
          options={ratingOptions}
          value={rating}
          onChange={setRating}
        />
      </div>

      <div className="flex flex-col gap-4 md:gap-5">
        {filtered.length === 0 ? (
          <p className="py-20 text-center font-regular text-[16px] text-grey6">
            {activeTab === "received" ? "받은 후기가 없어요." : "남긴 후기가 없어요."}
          </p>
        ) : (
          filtered.map((review) => (
            <div
              key={review.id}
              className="flex flex-col gap-3 rounded-[20px] border border-grey5 p-5 md:p-6 lg:p-8"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-[16px] text-grey9 md:text-[18px] lg:text-[20px]">
                    {review.projectTitle}
                  </h3>
                  <span className="font-medium text-[12px] leading-none text-grey5">
                    {review.createdAt} 작성
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StarRow rating={review.rating} size={18} />
                  <span className="font-bold text-[20px] leading-none text-grey9 md:text-[24px] lg:text-[26px]">
                    {review.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <p className="font-medium text-[14px] text-grey7 md:text-[16px]">{review.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
