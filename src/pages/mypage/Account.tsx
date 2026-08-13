import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Mail } from "lucide-react";
import { getMyProfile } from "@/api/user";
import { SocialUnlinkModal } from "@/components/auth/SocialUnlinkModal";
import { InlineLoading } from "@/components/common/InlineLoading";
import { QueryErrorState } from "@/components/common/QueryErrorState";
import { MyPageTitle } from "@/components/mypage/MyPageTitle";
import { useAuthStore } from "@/stores/authStore";

function getProviderLabel(provider?: string): string {
  if (provider === "kakao") return "카카오";
  if (provider === "google") return "구글";
  return "소셜";
}

type AccountStatusTone = "primary" | "success" | "info" | "neutral";

const accountStatusClasses: Record<AccountStatusTone, string> = {
  primary: "border-primary bg-primary-light text-grey9",
  success:
    "border-green-600 bg-green-600/10 text-grey9 dark:border-green-400 dark:bg-green-400/20",
  info: "border-blue-600 bg-blue-600/10 text-grey9 dark:border-blue-400 dark:bg-blue-400/20",
  neutral: "border-grey6 bg-grey6/10 text-grey9 dark:bg-grey6/20",
};

function statusBadgeClass(tone: AccountStatusTone): string {
  return `inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1 font-medium text-[12px] ${accountStatusClasses[tone]}`;
}

export default function MyPageAccountPage() {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const queryClient = useQueryClient();
  const [unlinkOpen, setUnlinkOpen] = useState(false);
  const [accountNotice, setAccountNotice] = useState("");

  const profileQuery = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile(),
    staleTime: 60_000,
  });

  const profile = profileQuery.data;
  const socialProviderLabel = getProviderLabel(profile?.socialProvider);
  const localLoginStatus: { label: string; tone: AccountStatusTone } =
    profile?.localLoginEnabled === true
      ? { label: "사용 중", tone: "success" }
      : profile?.localLoginEnabled === false
        ? { label: "소셜 전용", tone: "info" }
        : { label: "확인 필요", tone: "primary" };
  const socialLoginStatus: { label: string; tone: AccountStatusTone } =
    profile?.socialLinked === true
      ? {
          label: `${socialProviderLabel} 계정 연결됨`,
          tone:
            profile.socialProvider === "kakao"
              ? "primary"
              : profile.socialProvider === "google"
                ? "info"
                : "success",
        }
      : profile?.socialLinked === false
        ? { label: "연결된 계정 없음", tone: "neutral" }
        : { label: "확인 필요", tone: "primary" };

  const reloadProfile = () => {
    queryClient.invalidateQueries({ queryKey: ["my-profile"] });
  };

  return (
    <div className="flex flex-col gap-6">
      <MyPageTitle>계정 정보</MyPageTitle>

      <section className="rounded-[20px] border border-grey5 px-5 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-[16px] text-grey9 md:text-[18px]">로그인 방법</h2>
            <p className="mt-1 font-regular text-[13px] text-grey6">
              이메일과 소셜 계정 연결 상태를 관리해요.
            </p>
          </div>
          {profileQuery.isFetching && <InlineLoading label="계정 정보 갱신 중" />}
        </div>

        {profileQuery.isError && !profile ? (
          <QueryErrorState
            compact
            className="mt-5"
            message="계정 정보를 불러오지 못했습니다."
            onRetry={() => void profileQuery.refetch()}
          />
        ) : (
          <div className="mt-5 flex flex-col divide-y divide-grey3 rounded-[14px] border border-grey3">
            <div className="flex items-center gap-3 px-4 py-4 md:px-5">
              <Mail className="h-5 w-5 shrink-0 text-grey6" aria-hidden />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-medium text-[14px] text-grey9">이메일 로그인</span>
                <span className="truncate font-regular text-[12px] text-grey5">
                  {profile?.email ?? "불러오는 중"}
                </span>
              </div>
              <span className={statusBadgeClass(localLoginStatus.tone)}>
                {localLoginStatus.label}
              </span>
            </div>

            <div className="flex items-center gap-3 px-4 py-4 md:px-5">
              <Link2 className="h-5 w-5 shrink-0 text-grey6" aria-hidden />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-medium text-[14px] text-grey9">소셜 로그인</span>
                <span className={statusBadgeClass(socialLoginStatus.tone)}>
                  {socialLoginStatus.label}
                </span>
              </div>
              {profile?.socialLinked && profile.canUnlinkSocial && (
                <button
                  type="button"
                  onClick={() => setUnlinkOpen(true)}
                  className="shrink-0 rounded-tag border border-grey3 px-3 py-2 font-medium text-[13px] text-grey7 transition-colors hover:bg-grey1 hover:text-grey9"
                >
                  연동 해제
                </button>
              )}
              {profile?.socialLinked && !profile.canUnlinkSocial && (
                <span className={statusBadgeClass("primary")}>
                  기본 로그인
                </span>
              )}
            </div>
          </div>
        )}

        {profile?.localLoginEnabled == null && (
          <p className="mt-3 font-regular text-[12px] leading-5 text-grey5">
            기존 계정은 이메일 로그인 가능 여부를 확인할 수 없어 상태가 확정되지 않았어요.
          </p>
        )}
        {profile?.socialLinked && !profile.canUnlinkSocial && (
          <p className="mt-3 font-regular text-[12px] leading-5 text-grey5">
            소셜 전용 계정은 로그인 방법이 없어지므로 연동을 해제할 수 없어요.
          </p>
        )}
        {accountNotice && (
          <p className="mt-3 font-medium text-[13px] text-green-600">{accountNotice}</p>
        )}
      </section>

      <SocialUnlinkModal
        isOpen={unlinkOpen}
        providerLabel={socialProviderLabel}
        onClose={() => setUnlinkOpen(false)}
        onUnlinked={() => {
          setUnlinkOpen(false);
          setAccountNotice(`${socialProviderLabel} 계정 연동을 해제했습니다.`);
          reloadProfile();
          restoreSession();
        }}
      />
    </div>
  );
}
