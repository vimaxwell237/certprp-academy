import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-white/60 bg-white/90 p-4 shadow-soft backdrop-blur sm:rounded-3xl sm:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
