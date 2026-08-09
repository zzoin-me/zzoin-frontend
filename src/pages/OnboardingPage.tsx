import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { FieldSelect } from "@/components/common/FieldSelect";
import { StackSelector } from "@/components/common/StackSelector";
import { ApiError } from "@/api/client";
import { updateProfile, getStacks } from "@/api/user";
import type { StackInfo } from "@/types";

type Step = "field" | "stacks" | "bio" | "done";

const STEP_ORDER: Step[] = ["field", "stacks", "bio", "done"];
const STEP_INDEX: Record<Step, number> = {
  field: 0,
  stacks: 1,
  bio: 2,
  done: 3,
};

export default function OnboardingPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("field");
  const [fields, setFields] = useState<string[]>([]);
  const [selectedStackIds, setSelectedStackIds] = useState<number[]>([]);
  const [bio, setBio] = useState("");
  const [stacks, setStacks] = useState<StackInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getStacks()
      .then(setStacks)
      .catch((err) => console.error("[Onboarding] stacks load failed:", err));
  }, []);

  const saveCurrentStep = async (data: {
    fields?: string[];
    stackIds?: number[];
    bio?: string;
  }) => {
    setLoading(true);
    setError("");
    try {
      await updateProfile(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "저장에 실패했습니다.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleNextFromField = async () => {
    try {
      if (fields.length > 0) {
        await saveCurrentStep({ fields });
      }
      setStep("stacks");
    } catch {
      // error already set
    }
  };

  const handleNextFromStacks = async () => {
    try {
      if (selectedStackIds.length > 0) {
        await saveCurrentStep({ stackIds: selectedStackIds });
      }
      setStep("bio");
    } catch {
      // error already set
    }
  };

  const handleFinishFromBio = async () => {
    try {
      if (bio.trim()) {
        await saveCurrentStep({ bio: bio.trim() });
      }
      setStep("done");
    } catch {
      // error already set
    }
  };

  const skipTo = (next: Step) => setStep(next);

  return (
    <div className="flex w-full max-w-[400px] flex-col md:max-w-[480px]">
      <header className="mb-6 flex flex-col items-center gap-3 text-center">
        <img src="/logo.svg" alt="Zzoin logo" width={40} height={40} />
        <h1 className="font-bold text-[22px] text-grey9 md:text-[24px]">환영합니다!</h1>
        <p className="font-regular text-[14px] text-grey6">
          프로필을 완성하고 더 나은 매칭을 받아보세요
        </p>
      </header>

      <div className="mb-8 flex items-center justify-center gap-2">
        {STEP_ORDER.filter((s) => s !== "done").map((s, i) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all ${
              i <= STEP_INDEX[step] ? "w-8 bg-primary" : "w-4 bg-grey3"
            }`}
          />
        ))}
      </div>

      {step !== "done" && (
        <p className="mb-4 text-center font-regular text-[13px] text-grey6">
          언제든 내 프로필에서 수정할 수 있어요!
        </p>
      )}

      {error && (
        <p className="mb-4 text-center font-regular text-[13px] text-red-500">{error}</p>
      )}

      {step === "field" && (
        <div className="flex flex-col gap-5">
          <FieldSelect value={fields} onChange={setFields} />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="flex-1 border border-[#F97316] text-[#F97316] hover:bg-[#F97316]/5"
              onClick={() => skipTo("stacks")}
              disabled={loading}
            >
              건너뛰기
            </Button>
            <Button
              type="button"
              size="lg"
              className="flex-1"
              onClick={handleNextFromField}
              disabled={loading}
            >
              {loading ? "저장 중..." : "다음"}
            </Button>
          </div>
        </div>
      )}

      {step === "stacks" && (
        <div className="flex flex-col gap-5">
          <StackSelector
            selectedIds={selectedStackIds}
            onChange={setSelectedStackIds}
            stacks={stacks}
            label="관심 있는 기술 스택"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="flex-1 border border-[#F97316] text-[#F97316] hover:bg-[#F97316]/5"
              onClick={() => skipTo("bio")}
              disabled={loading}
            >
              건너뛰기
            </Button>
            <Button
              type="button"
              size="lg"
              className="flex-1"
              onClick={handleNextFromStacks}
              disabled={loading}
            >
              {loading ? "저장 중..." : "다음"}
            </Button>
          </div>
        </div>
      )}

      {step === "bio" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="onboarding-bio" className="font-medium text-[14px] text-grey8">
              한줄 소개
            </label>
            <textarea
              id="onboarding-bio"
              placeholder="본인을 한줄로 소개해주세요"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full resize-none rounded-tag border border-grey3 bg-bg px-4 py-3 font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
            />
            <p className="text-right font-regular text-[12px] text-grey6">{bio.length}/500</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="flex-1 border border-[#F97316] text-[#F97316] hover:bg-[#F97316]/5"
              onClick={() => skipTo("done")}
              disabled={loading}
            >
              건너뛰기
            </Button>
            <Button
              type="button"
              size="lg"
              className="flex-1"
              onClick={handleFinishFromBio}
              disabled={loading}
            >
              {loading ? "저장 중..." : "완료"}
            </Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-light">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-bold text-[22px] text-grey9 md:text-[24px]">
              가입을 환영합니다!
            </h2>
            <p className="font-regular text-[14px] text-grey6">
              프로필 설정이 완료되었어요. 이제 프로젝트를 탐색해보세요.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2">
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => navigate("/projects", { replace: true })}
            >
              프로젝트 둘러보기
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate("/mypage", { replace: true })}
            >
              프로필로 가기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
