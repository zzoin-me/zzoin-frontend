interface AvatarProps {
  nickname?: string;
  profileUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-[14px]",
  md: "h-10 w-10 text-[16px]",
  lg: "h-12 w-12 text-[18px]",
  xl: "h-[64px] w-[64px] text-[24px] md:h-[76px] md:w-[76px] md:text-[28px]",
};

export function Avatar({ nickname, profileUrl, size = "sm", className = "" }: AvatarProps) {
  const initial = nickname?.charAt(0)?.toUpperCase() ?? "?";

  if (profileUrl) {
    return (
      <img
        src={profileUrl}
        alt={nickname ?? "프로필"}
        className={`${sizeClasses[size]} shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-full bg-avatar-bg font-bold text-white ${className}`}
    >
      {initial}
    </div>
  );
}
