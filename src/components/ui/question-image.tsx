/* eslint-disable @next/next/no-img-element */

import { cn } from "@/lib/utils";

export function QuestionImage({
  src,
  alt,
  className,
  imageClassName
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-3xl border border-ink/10 bg-pearl", className)}>
      <img
        alt={alt}
        className={cn("h-auto max-h-[28rem] w-full object-contain", imageClassName)}
        loading="lazy"
        src={src}
      />
    </div>
  );
}
