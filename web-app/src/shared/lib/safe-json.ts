// typeof null is "object", so null has to be rejected before any field is read.
export const isJsonObject = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
