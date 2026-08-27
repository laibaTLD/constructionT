'use client';

import { useEffect } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getImageSrc } from '@/app/lib/utils';

function upsertLink(rel: string, href: string, type?: string) {
  const selector = `link[rel="${rel}"][data-site-favicon]`;
  let link = document.head.querySelector<HTMLLinkElement>(selector);

  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    link.setAttribute('data-site-favicon', 'true');
    document.head.appendChild(link);
  }

  link.href = href;
  if (type) {
    link.type = type;
  } else {
    link.removeAttribute('type');
  }
}

export function SiteFavicon() {
  const { site } = useWebBuilder();
  const href = getImageSrc(site?.seo?.faviconUrl);

  useEffect(() => {
    if (!href) return;

    const ext = href.split('?')[0].split('.').pop()?.toLowerCase();
    const type =
      ext === 'svg' ? 'image/svg+xml' :
      ext === 'png' ? 'image/png' :
      ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
      ext === 'webp' ? 'image/webp' :
      ext === 'gif' ? 'image/gif' :
      ext === 'ico' ? 'image/x-icon' :
      undefined;

    upsertLink('icon', href, type);
    upsertLink('shortcut icon', href, type);
    upsertLink('apple-touch-icon', href);

    document.head
      .querySelectorAll<HTMLLinkElement>('link[rel="icon"]:not([data-site-favicon])')
      .forEach((el) => el.remove());
  }, [href]);

  return null;
}
