import { stripHtml, tiptapToText } from '@/app/lib/seo';

type LegalDoc = {
  content?: unknown;
} | null | undefined;

/** Parse Tiptap JSON (object or string). HTML strings are returned unchanged. Invalid JSON is missing. */
export function parseTiptapContent(content: unknown): unknown | null {
  if (content == null) return null;

  if (typeof content === 'string') {
    const trimmed = content.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return null;
      }
    }
    if (trimmed.startsWith('<')) return trimmed;
    return null;
  }

  if (typeof content === 'object') return content;
  return null;
}

export function isHtmlContent(content: unknown): content is string {
  return typeof content === 'string' && content.trim().startsWith('<');
}

/** True when the legal body has visible text. A heading or description alone does not count. */
export function hasLegalBody(doc: LegalDoc): boolean {
  const parsed = parseTiptapContent(doc?.content);
  if (parsed == null) return false;
  if (typeof parsed === 'string') return stripHtml(parsed).length > 0;
  return tiptapToText(parsed).length > 0;
}

/** Studio `files.schemaJson` is a stringified JSON array. Never throws. */
export function parseSchemaArray(schemaJson?: string | null): unknown[] {
  const trimmed = (schemaJson || '').trim();
  if (!trimmed || trimmed === '[]') return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && typeof item === 'object');
    }
    if (parsed && typeof parsed === 'object') return [parsed];
    return [];
  } catch {
    return [];
  }
}
