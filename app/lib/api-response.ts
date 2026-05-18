/** Unwrap `{ success, data }` (fetch-api) or pass through arrays / entities. */
export function unwrapApiPayload<T>(response: unknown): T {
  if (response == null) return response as T;
  if (Array.isArray(response)) return response as T;
  if (typeof response !== 'object') return response as T;

  const record = response as Record<string, unknown>;
  if (record.data !== undefined && record.data !== null) {
    return record.data as T;
  }

  return response as T;
}
