const tabs = ["작성 가능한 후기", "작성한 후기"];

export default function MyPageReviewsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-bold text-[28px] text-grey9">프로젝트 후기</h1>

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

      <div className="flex flex-col gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-card border border-grey5 p-8 font-medium text-[16px] text-grey9"
          >
            프로젝트 후기 {i}
          </div>
        ))}
      </div>
    </div>
  );
}
