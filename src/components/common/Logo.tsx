import { Link } from "react-router";

type LogoProps = {
  to?: string;
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

export function Logo({
  to = "/",
  size = 46,
  showWordmark = true,
  className = "",
}: LogoProps) {
  const wordmarkHeight = Math.round(size * 0.6);
  return (
    <Link to={to} className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo.svg"
        alt="Zzoin logo"
        width={size}
        height={size}
        className="shrink-0"
      />
      {showWordmark && (
        <img
          src="/logo-wordmark.svg"
          alt="Zzoin"
          height={wordmarkHeight}
          style={{ width: "auto", height: `${wordmarkHeight}px` }}
          className="shrink-0"
        />
      )}
    </Link>
  );
}
