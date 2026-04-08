import { cn } from "@/lib/utils";

import { QuestionImage } from "@/components/ui/question-image";

type QuestionImageGalleryItem = {
  src: string | null;
  alt: string;
  key?: string;
};

export function QuestionImageGallery({
  images,
  className,
  itemClassName,
  imageClassName
}: {
  images: QuestionImageGalleryItem[];
  className?: string;
  itemClassName?: string;
  imageClassName?: string;
}) {
  const visibleImages = images.filter(
    (
      image
    ): image is {
      src: string;
      alt: string;
      key?: string;
    } => Boolean(image.src)
  );

  if (visibleImages.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {visibleImages.map((image, index) => (
        <QuestionImage
          alt={image.alt || `Question reference image ${index + 1}`}
          className={cn("bg-white", itemClassName)}
          imageClassName={imageClassName}
          key={image.key ?? `${index}-${image.src}`}
          src={image.src}
        />
      ))}
    </div>
  );
}
