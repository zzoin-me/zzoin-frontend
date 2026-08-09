export interface CountTab {
  label: string;
  value: string;
  count: number;
}

interface CountTabsProps {
  tabs: CountTab[];
  active: string;
  onChange: (value: string) => void;
}

export function CountTabs({ tabs, active, onChange }: CountTabsProps) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto border-b border-grey3 md:gap-8 lg:gap-[80px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`flex shrink-0 items-center gap-2 border-b-2 py-3 transition-colors md:gap-3 ${
              isActive ? "border-grey9" : "border-transparent hover:border-grey5"
            }`}
          >
            <span
              className={`text-[15px] md:text-[18px] lg:text-[20px] ${
                isActive ? "font-bold text-grey9" : "font-medium text-grey9"
              }`}
            >
              {tab.label}
            </span>
            <span
              className={`flex min-w-[28px] items-center justify-center rounded-[10px] bg-grey3 px-2 py-[3px] text-[13px] md:px-2.5 md:py-[5px] md:text-[16px] ${
                isActive ? "font-bold text-grey9" : "font-medium text-grey6"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
