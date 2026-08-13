import { Copyright } from "lucide-react";

const inactiveLinks = ["개인정보 처리방침", "서비스 이용약관", "문의하기"];

export function DesktopFooter() {
  return (
    <footer className="hidden border-t border-grey3 bg-grey1 lg:block native:hidden">
      <div className="mx-auto flex min-h-20 w-full max-w-[1440px] items-center justify-between gap-6 px-[120px] py-5">
        <div className="flex shrink-0 items-center gap-2 font-medium text-[14px] text-grey7">
          <Copyright className="h-4 w-4" aria-hidden />
          <span className="font-bold text-grey9">Zzoin</span>
        </div>

        <nav aria-label="서비스 안내" className="flex flex-wrap items-center justify-end gap-1">
          {inactiveLinks.map((label) => (
            <button
              key={label}
              type="button"
              disabled
              className="min-h-10 cursor-default rounded-tag px-3 font-medium text-[13px] text-grey6"
            >
              {label}
            </button>
          ))}
          <a
            href="https://github.com/zzoin-me"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-tag px-3 font-medium text-[13px] text-grey8 transition-colors hover:bg-grey2 hover:text-grey9"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
