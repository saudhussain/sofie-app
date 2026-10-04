/**
 * Gateway frames and Nora payloads arrive as `unknown`.
 * `typeof null` is `"object"`, so null is rejected before any field is read.
 */
export const isJsonObject = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
