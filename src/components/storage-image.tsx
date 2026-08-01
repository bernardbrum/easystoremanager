import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAssetUrl } from "@/lib/db";

type Props = {
  path?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};

/** Renders an image stored in the private assets bucket (resolved to a signed URL). */
export function StorageImage({ path, alt, className, width, height }: Props) {
  const { data: url, isLoading } = useAssetUrl(path);

  if (!path || (!url && !isLoading)) {
    return (
      <div
        className={cn(
          "grid place-items-center bg-muted text-muted-foreground",
          className,
        )}
        aria-label={alt}
        role="img"
      >
        <ImageOff className="size-1/4 max-h-8 min-h-4" />
      </div>
    );
  }

  if (!url) return <div className={cn("animate-pulse bg-muted", className)} aria-hidden />;

  return (
    <img
      src={url}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      crossOrigin="anonymous"
      className={className}
    />
  );
}
