export function ProjectCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card border border-grey4 bg-white">
      <div className="h-[113px] w-full animate-pulse rounded-t-card bg-grey3" />
      <div className="flex flex-1 flex-col gap-[19px] px-4 pb-4 pt-1">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-3/4 animate-pulse rounded bg-grey3" />
          <div className="h-4 w-full animate-pulse rounded bg-grey3" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-grey3" />
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex flex-row gap-2">
            <div className="h-5 w-10 animate-pulse rounded-[16px] bg-grey3" />
            <div className="h-5 w-14 animate-pulse rounded-[16px] bg-grey3" />
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-5">
              <div className="h-4 w-12 animate-pulse rounded bg-grey3" />
              <div className="h-5 w-10 animate-pulse rounded-[16px] bg-grey3" />
            </div>
            <div className="h-[26px] w-[26px] animate-pulse rounded-card bg-grey3" />
          </div>
        </div>
      </div>
    </div>
  );
}
