export const TRACKING_QUERY_KEYS = [
  "click_id",
  "sid",
  "fbclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
] as const;

export type TrackingQueryKey = (typeof TRACKING_QUERY_KEYS)[number];

function isSafeTrackingValue(v: string): boolean {
  return v.length > 0 && v.length < 800;
}

export function parseTrackingFromRequestBody(
  body: Record<string, unknown>,
): Record<string, string> | undefined {
  const out: Record<string, string> = {};
  for (const k of TRACKING_QUERY_KEYS) {
    const v = body[k];
    if (typeof v === "string" && isSafeTrackingValue(v)) out[k] = v;
  }
  const nested = body.tracking;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    for (const [k, v] of Object.entries(nested)) {
      if (typeof v === "string" && isSafeTrackingValue(v)) out[k] = v;
    }
  }
  return Object.keys(out).length ? out : undefined;
}
