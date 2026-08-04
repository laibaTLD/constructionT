export type SeoImage = {
  url: string;
  alt?: string;
};

function isLocalHttp(url: string): boolean {
  return /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\b/i.test(url);
}

export function toHttpsExceptLocal(url: string): string {
  if (!url) return url;
  if (!/^https?:\/\//i.test(url)) return url;
  if (isLocalHttp(url)) return url;
  return url.replace(/^http:\/\//i, 'https://');
}

export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return toHttpsExceptLocal(fromEnv.replace(/\/$/, ''));
  if (typeof window !== 'undefined' && window.location?.origin) {
    return toHttpsExceptLocal(window.location.origin);
  }
  return '';
}

export function buildCanonicalUrl(pathname: string): string {
  const origin = getSiteOrigin();
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return origin ? `${origin}${cleanPath}` : cleanPath;
}

export function truncate(text: string, max = 160): string {
  const t = (text || '').trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + '…';
}

export function stripHtml(input: string): string {
  return (input || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function tiptapToText(content: any): string {
  if (!content) return '';

  try {
    const doc = typeof content === 'string' ? JSON.parse(content) : content;
    const parts: string[] = [];

    const walk = (node: any) => {
      if (!node) return;
      if (typeof node === 'string') {
        parts.push(node);
        return;
      }
      if (node.type === 'text' && typeof node.text === 'string') {
        parts.push(node.text);
      }
      if (Array.isArray(node.content)) {
        node.content.forEach((child: any, index: number) => {
          if (
            index > 0 &&
            child?.type &&
            ['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote'].includes(child.type)
          ) {
            parts.push(' ');
          }
          walk(child);
        });
      }
    };

    walk(doc);
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  } catch {
    return typeof content === 'string' ? stripHtml(content) : '';
  }
}

export function normalizeSeoImage(url?: string | null, alt?: string | null): SeoImage | null {
  if (!url) return null;
  return { url: toHttpsExceptLocal(url), alt: alt || undefined };
}
