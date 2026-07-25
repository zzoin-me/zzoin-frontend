interface StatusBadgeProps {
  status: string;
  label?: string;
  variant?: "success" | "closed" | "pending" | "approved" | "rejected";
}

const variantClasses: Record<NonNullable<StatusBadgeProps["variant"]>, string> = {
  success: "bg-[#87D979]/20 text-[#247216] border-[#87D979]",
  closed: "bg-grey5 text-grey1 border-grey6",
  pending: "bg-grey3 text-grey7 border-grey5",
  approved: "bg-[#87D979]/20 text-[#247216] border-[#87D979]",
  rejected: "bg-red-50 text-red-600 border-red-200",
};

const defaultLabels: Record<
  string,
  { label: string; variant: NonNullable<StatusBadgeProps["variant"]> }
> = {
  RECRUITING: { label: "모집중", variant: "success" },
  IN_PROGRESS: { label: "진행중", variant: "pending" },
  COMPLETED: { label: "완료", variant: "closed" },
  RECRUITMENT_CLOSED: { label: "모집마감", variant: "closed" },
  PENDING: { label: "대기중", variant: "pending" },
  APPROVED: { label: "수락됨", variant: "approved" },
  REJECTED: { label: "거절됨", variant: "rejected" },
};

export function StatusBadge({ status, label, variant }: StatusBadgeProps) {
  const config = defaultLabels[status];
  const displayLabel = label ?? config?.label ?? status;
  const displayVariant = variant ?? config?.variant ?? "pending";

  return (
    <span
      className={`inline-flex items-center rounded-[20px] border px-2.5 py-[5px] font-medium text-[12px] ${variantClasses[displayVariant]}`}
    >
      {displayLabel}
    </span>
  );
}
