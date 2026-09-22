import { parseSchemaArray } from '@/app/lib/legal';

export function JsonLd({ schemaJson }: { schemaJson?: string | null }) {
  const parsed = parseSchemaArray(schemaJson);
  if (!parsed.length) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(parsed).replace(/</g, '\\u003c'),
      }}
    />
  );
}
