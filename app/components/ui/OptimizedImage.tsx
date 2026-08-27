'use client';

import React from 'react';
import Image, { type ImageProps } from 'next/image';
import { getImageSrc, cn } from '@/app/lib/utils';

export const IMAGE_QUALITY_HIGH = 80;
export const IMAGE_QUALITY_DEFAULT = 70;

export const IMAGE_SIZES = {
  hero: '(max-width: 768px) 100vw, 50vw',
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  sectionWide: '(max-width: 1024px) 100vw, 66vw',
  sectionHalf: '(max-width: 1024px) 100vw, 50vw',
  fullWidth: '100vw',
} as const;

type OptimizedImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src: string | null | undefined | { url?: string; src?: string; path?: string };
  alt?: string;
};

function toImageSrc(src: OptimizedImageProps['src']): string {
  const resolved = getImageSrc(src);
  if (!resolved) return '';

  // Route uploads through same-origin so Next.js can optimize + cache via rewrites
  try {
    if (/^https?:\/\//i.test(resolved)) {
      const url = new URL(resolved);
      if (url.pathname.startsWith('/api/uploads/')) {
        return url.pathname + url.search;
      }
      if (url.pathname.startsWith('/uploads/')) {
        return `/api${url.pathname}` + url.search;
      }
    }
  } catch {
    // fall through
  }

  if (resolved.startsWith('/uploads/')) {
    return `/api${resolved}`;
  }

  return resolved;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt = '',
  className,
  quality,
  priority = false,
  loading,
  ...props
}) => {
  const resolved = toImageSrc(src);
  if (!resolved) return null;

  const isLocalhost =
    /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\b/i.test(resolved);

  const resolvedQuality =
    quality ?? (priority ? IMAGE_QUALITY_HIGH : IMAGE_QUALITY_DEFAULT);

  return (
    <Image
      src={resolved}
      alt={alt}
      quality={resolvedQuality}
      priority={priority}
      loading={priority ? undefined : (loading ?? 'lazy')}
      className={cn(className)}
      {...props}
      unoptimized={isLocalhost || props.unoptimized}
    />
  );
};

export default OptimizedImage;
