/** HttpOnly JWT 쿠키 이름 — auth-service·Gateway와 동기화 */
export const AUTH_COOKIE_ACCESS =
  process.env.AUTH_COOKIE_ACCESS_NAME ?? "vh_access_token";

export const AUTH_COOKIE_REFRESH =
  process.env.AUTH_COOKIE_REFRESH_NAME ?? "vh_refresh_token";

export type ParsedSetCookie = {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
};

/** Set-Cookie 헤더 문자열 파싱 */
export function parseSetCookie(header: string): ParsedSetCookie | null {
  const segments = header.split(";").map((part) => part.trim());
  if (segments.length === 0) return null;

  const nameValue = segments[0];
  const eqIndex = nameValue.indexOf("=");
  if (eqIndex <= 0) return null;

  const parsed: ParsedSetCookie = {
    name: nameValue.slice(0, eqIndex),
    value: nameValue.slice(eqIndex + 1),
  };

  for (const segment of segments.slice(1)) {
    const lower = segment.toLowerCase();
    if (lower === "httponly") {
      parsed.httpOnly = true;
    } else if (lower === "secure") {
      parsed.secure = true;
    } else if (lower.startsWith("path=")) {
      parsed.path = segment.slice(5);
    } else if (lower.startsWith("domain=")) {
      parsed.domain = segment.slice(7);
    } else if (lower.startsWith("max-age=")) {
      parsed.maxAge = Number.parseInt(segment.slice(8), 10);
    } else if (lower.startsWith("samesite=")) {
      const site = segment.slice(9).toLowerCase();
      if (site === "lax" || site === "strict" || site === "none") {
        parsed.sameSite = site;
      }
    }
  }

  return parsed;
}
