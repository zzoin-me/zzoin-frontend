import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Star, UserRound } from "lucide-react";
import { ApiError } from "@/api/client";
import { createReview, getMyProjectReviews, getReviewTargets } from "@/api/reviews";
import { LoadingState } from "@/components/common/LoadingState";
import { MyPageTitle } from "@/components/mypage/MyPageTitle";
import { ReviewListSkeleton } from "@/components/mypage/MyPageSkeletons";

type ScoreKey = "contribution" | "participation" | "responsibility";

const criteria: Array<{ key: ScoreKey; label: string; description: string }> = [
  { key: "contribution", label: "기여도", description: "결과물과 업무에 기여한 정도" },
  { key: "participation", label: "소통·협업", description: "의견 공유와 협업이 원활했던 정도" },
  { key: "responsibility", label: "책임감", description: "일정과 맡은 업무를 지킨 정도" },
];

export default function ReviewWritePage() {
  const projectId = Number(useParams().projectId);
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<ScoreKey, number>>({
    contribution: 0,
    participation: 0,
    responsibility: 0,
  });
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reviews", "targets", projectId],
    queryFn: () => getReviewTargets(projectId),
    enabled: Number.isFinite(projectId),
  });

  const unreviewedTargets = useMemo(
    () => data?.targets.filter((target) => !target.reviewed) ?? [],
    [data],
  );

  const writtenReviewsQuery = useQuery({
    queryKey: ["reviews", "project-written", projectId],
    queryFn: () => getMyProjectReviews(projectId),
    enabled: !!data && unreviewedTargets.length === 0,
  });

  useEffect(() => {
    if (!selectedUserId || !unreviewedTargets.some((target) => target.userId === selectedUserId)) {
      setSelectedUserId(unreviewedTargets[0]?.userId ?? null);
    }
  }, [selectedUserId, unreviewedTargets]);

  const selectedTarget = unreviewedTargets.find((target) => target.userId === selectedUserId);
  const canSubmit =
    selectedTarget &&
    scores.contribution > 0 &&
    scores.participation > 0 &&
    scores.responsibility > 0;

  const handleSubmit = async () => {
    if (!selectedTarget || !canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await createReview(projectId, {
        targetUserId: selectedTarget.userId,
        ...scores,
        comment: comment.trim() || undefined,
      });
      setScores({ contribution: 0, participation: 0, responsibility: 0 });
      setComment("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["reviews"] }),
        queryClient.invalidateQueries({ queryKey: ["reviews", "targets", projectId] }),
      ]);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "후기 등록에 실패했습니다. 다시 시도해주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState />;

  if (isError || !data) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center text-center">
        <p className="font-medium text-[15px] text-red-500">
          후기 작성 정보를 불러오지 못했습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <MyPageTitle backTo="/mypage/reviews">팀원 후기 작성</MyPageTitle>
      <div>
        <h2 className="font-bold text-[19px] text-grey9 md:text-[22px]">{data.projectTitle}</h2>
        <p className="mt-1 font-medium text-[13px] text-grey6">
          {data.reviewedTargetCount}/{data.totalTargetCount}명 작성 완료 · 등록 후에는 수정할 수
          없어요.
        </p>
      </div>

      {unreviewedTargets.length === 0 ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-grey3 px-5 py-7 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
              <Check className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <div>
              <p className="font-bold text-[18px] text-grey9">모든 팀원 후기를 작성했습니다.</p>
              <p className="mt-1 font-medium text-[14px] text-grey6">
                내가 작성한 내용을 확인할 수 있어요.
              </p>
            </div>
          </div>

          {writtenReviewsQuery.isLoading ? (
            <ReviewListSkeleton count={2} />
          ) : writtenReviewsQuery.isError ? (
            <p className="py-8 text-center font-medium text-[14px] text-red-500">
              작성한 후기를 불러오지 못했습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {(writtenReviewsQuery.data?.members ?? []).map((review) => (
                <article
                  key={review.reviewId}
                  className="rounded-card border border-grey5 p-5 md:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[17px] text-grey9">{review.nickname}</h3>
                      <p className="mt-1 font-medium text-[12px] text-grey6">
                        {review.recruitments.join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-5 w-5 fill-primary text-primary" aria-hidden />
                      <strong className="font-bold text-[18px] text-grey9">
                        {review.avgRating.toFixed(1)}
                      </strong>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 font-medium text-[12px] text-grey7">
                    <span className="rounded-tag bg-grey2 px-2.5 py-1">
                      기여도 {review.contribution}
                    </span>
                    <span className="rounded-tag bg-grey2 px-2.5 py-1">
                      소통·협업 {review.participation}
                    </span>
                    <span className="rounded-tag bg-grey2 px-2.5 py-1">
                      책임감 {review.responsibility}
                    </span>
                  </div>
                  {(review.hidden || review.comment) && (
                    <p className="mt-4 whitespace-pre-wrap font-medium text-[14px] leading-6 text-grey7">
                      {review.hidden ? "관리자에 의해 숨겨진 후기입니다." : review.comment}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}

          <Link
            to="/mypage/reviews"
            className="self-center rounded-[10px] bg-primary px-5 py-2.5 font-bold text-[14px] text-white"
          >
            후기 목록으로
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] native:grid-cols-1">
          <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible native:flex-row native:overflow-x-auto">
            {data.targets.map((target) => (
              <button
                key={target.userId}
                type="button"
                disabled={target.reviewed}
                onClick={() => setSelectedUserId(target.userId)}
                className={`flex min-w-[220px] items-center gap-3 rounded-[16px] border p-4 text-left transition-colors lg:min-w-0 native:min-w-[220px] ${
                  target.reviewed
                    ? "border-grey3 bg-grey1 opacity-60"
                    : selectedUserId === target.userId
                      ? "border-grey9 bg-grey1"
                      : "border-grey3 bg-bg hover:border-grey5"
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-grey3">
                  {target.profileUrl ? (
                    <img src={target.profileUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <UserRound className="h-5 w-5 text-grey6" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-[15px] text-grey9">{target.nickname}</p>
                  <p className="truncate font-medium text-[12px] text-grey6">
                    {target.recruitment}
                  </p>
                </div>
                {target.reviewed && <Check className="h-5 w-5 text-grey7" aria-hidden />}
              </button>
            ))}
          </div>

          {selectedTarget && (
            <section className="rounded-card border border-grey5 p-5 md:p-7">
              <div className="flex items-center gap-3 border-b border-grey3 pb-5">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-grey3">
                  {selectedTarget.profileUrl ? (
                    <img
                      src={selectedTarget.profileUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-5 w-5 text-grey6" aria-hidden />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-[18px] text-grey9">{selectedTarget.nickname}</h3>
                  <p className="font-medium text-[13px] text-grey6">{selectedTarget.recruitment}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-6">
                {criteria.map((criterion) => (
                  <div
                    key={criterion.key}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-bold text-[15px] text-grey9">{criterion.label}</p>
                      <p className="font-medium text-[12px] text-grey6">{criterion.description}</p>
                    </div>
                    <div
                      className="flex items-center gap-1"
                      role="radiogroup"
                      aria-label={criterion.label}
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          role="radio"
                          aria-checked={scores[criterion.key] === score}
                          onClick={() =>
                            setScores((current) => ({ ...current, [criterion.key]: score }))
                          }
                          className="flex h-11 w-11 items-center justify-center rounded-full"
                          aria-label={`${score}점`}
                        >
                          <Star
                            className={`h-7 w-7 ${
                              score <= scores[criterion.key]
                                ? "fill-primary text-primary"
                                : "fill-grey2 text-grey5"
                            }`}
                            aria-hidden
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <label className="mt-7 block">
                <span className="font-bold text-[15px] text-grey9">팀원 후기 (선택)</span>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value.slice(0, 200))}
                  rows={5}
                  placeholder="함께 프로젝트를 진행하며 좋았던 점이나 도움이 될 피드백을 작성해주세요."
                  className="mt-3 w-full resize-none rounded-[14px] border border-grey5 bg-bg p-4 font-medium text-[14px] leading-6 text-grey9 outline-none transition-colors placeholder:text-grey5 focus:border-grey9"
                />
                <span className="mt-1 block text-right font-medium text-[11px] text-grey5">
                  {comment.length}/200
                </span>
              </label>

              {error && <p className="mt-3 font-medium text-[13px] text-red-500">{error}</p>}
              <button
                type="button"
                disabled={!canSubmit || submitting}
                onClick={handleSubmit}
                className="mt-5 w-full rounded-[12px] bg-primary py-3.5 font-bold text-[15px] text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "등록 중..." : `${selectedTarget.nickname}님 후기 등록`}
              </button>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
