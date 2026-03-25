import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const styles: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white shadow-soft hover:-translate-y-0.5 hover:bg-slate-900",
  secondary:
    "border border-ink/10 bg-white text-ink hover:-translate-y-0.5 hover:border-cyan/40 hover:text-cyan",
  ghost: "bg-transparent text-ink hover:bg-ink/5"
};

export function Button({
  children,
  className,
  fullWidth = false,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        styles[variant],
        fullWidth && "w-full",
        className
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

