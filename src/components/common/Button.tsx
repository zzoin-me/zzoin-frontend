import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-grey9 text-white hover:bg-grey8",
  outline: "border border-grey3 bg-white text-grey9 hover:bg-grey1",
  ghost: "bg-transparent text-grey9 hover:bg-grey2",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-2 text-[14px]",
  md: "px-5 py-3 text-[16px]",
  lg: "px-6 py-4 text-[18px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-tag font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
