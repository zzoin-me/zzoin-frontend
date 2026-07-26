const tabs = ["모집중", "진행중", "완료"];
const filterChips = ["임시저장", "영구저장"];

export default function MyPageProjectsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-bold text-[28px] text-grey9">내 프로젝트 관리</h1>
      <p className="font-medium text-[14px] text-grey7">
        내가 생성한 프로젝트예요. 클릭하면 상세 관리 화면으로 이동해요.
      </p>

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
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-card border border-grey5 p-8"
          >
            <span className="font-bold text-[20px] text-grey9">프로젝트 {i}</span>
            <span className="font-medium text-[14px] text-grey6">3/5명 · D-13</span>
          </div>
        ))}
      </div>
    </div>
  );
}
