'use client';

import { useLayoutEffect } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getImageSrc } from '@/app/lib/utils';

function getFaviconMimeType(url: string): string | undefined {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
  if (ext === 'svg') return 'image/svg+xml';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'ico') return 'image/x-icon';
  return undefined;
}

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

function removeDefaultIconLinks() {
  document.head
    .querySelectorAll<HTMLLinkElement>(
      'link[rel="icon"]:not([data-site-favicon]), link[rel="shortcut icon"]:not([data-site-favicon]), link[rel="apple-touch-icon"]:not([data-site-favicon])'
    )
    .forEach((el) => el.remove());
}

function removeSiteFaviconLinks() {
  document.head.querySelectorAll('link[data-site-favicon]').forEach((el) => el.remove());
}

export function SiteFavicon() {
  const { site, loading } = useWebBuilder();
  const href = getImageSrc(site?.seo?.faviconUrl);

  useLayoutEffect(() => {
    if (loading && !href) return;

    if (href) {
      const type = getFaviconMimeType(href);
      upsertLink('icon', href, type);
      upsertLink('shortcut icon', href, type);
      upsertLink('apple-touch-icon', href);
    } else {
      removeSiteFaviconLinks();
    }

    removeDefaultIconLinks();
  }, [href, loading]);

  return null;
}
