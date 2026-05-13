import { timingSafeEqual as nodeTimingSafeEqual } from "node:crypto";

/** Constant-time string comparison to prevent timing side-channel attacks. */
export function timingSafeEqualStr(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.byteLength !== bb.byteLength) return false;
  return nodeTimingSafeEqual(ab, bb);
}
