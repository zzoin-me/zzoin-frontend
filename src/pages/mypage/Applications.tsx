const tabs = ["전체", "대기중", "수락", "거절"];
const filterChips = ["임시저장", "영구저장"];

export default function MyPageApplicationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-bold text-[28px] text-grey9">프로젝트 지원 현황</h1>

      <div className="flex gap-20 border-b border-grey3">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={`py-3 font-medium text-[16px] ${
              i === 0 ? "border-b-2 border-grey9 text-grey9" : "text-grey7 hover:text-grey9"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {filterChips.map((c) => (
          <span
            key={c}
            className="rounded-tag border border-grey5 px-5 py-2 font-medium text-[14px] text-grey7"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-card border border-grey5 p-8 font-medium text-[16px] text-grey9"
          >
            지원한 프로젝트 {i}
          </div>
        ))}
      </div>
    </div>
  );
}
