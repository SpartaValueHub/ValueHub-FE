const REDACTED_KEYS = new Set([
  "password",
  "passwordconfirm",
  "accesstoken",
  "refreshtoken",
  "captchatoken",
  "requesttoken",
  "identityverificationtoken",
  "identityverificationid",
  "authsecret",
  "nextauthsecret",
  "authorization",
  "cookie",
  "setcookie",
  "ci",
  "secret",
]);

const MASKED_KEYS = new Set(["loginid"]);

const JWT_PATTERN = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/;
const BEARER_PATTERN = /Bearer\s+[A-Za-z0-9._-]+/gi;

const SENSITIVE_COOKIE_NAMES = [
  "accessToken",
  "refreshToken",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function normalizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

/** PII — first 2 chars + *** (or full id when shorter than 2) */
export function maskLoginId(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "***";
  if (trimmed.length <= 2) return `${trimmed}***`;
  return `${trimmed.slice(0, 2)}***`;
}

function redactCookieValues(value: string): string {
  let result = value;
  for (const name of SENSITIVE_COOKIE_NAMES) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(
      new RegExp(`(${escaped})=[^;\\s]+`, "gi"),
      "$1=[REDACTED]"
    );
  }
  return result;
}

function sanitizeString(value: string): string {
  const trimmed = value.trim();
  if (JWT_PATTERN.test(trimmed)) {
    return "[REDACTED:JWT]";
  }

  let result = redactCookieValues(value);
  result = result.replace(BEARER_PATTERN, "Bearer [REDACTED]");

  if (
    (result.startsWith("{") && result.endsWith("}")) ||
    (result.startsWith("[") && result.endsWith("]"))
  ) {
    try {
      return JSON.stringify(sanitizeForLog(JSON.parse(result)));
    } catch {
      // not JSON — keep redacted string
    }
  }

  return result;
}

function sanitizeField(
  key: string,
  value: unknown,
  seen: WeakSet<object>
): unknown {
  const normalized = normalizeKey(key);

  if (REDACTED_KEYS.has(normalized)) {
    return "[REDACTED]";
  }

  if (MASKED_KEYS.has(normalized) && typeof value === "string") {
    return maskLoginId(value);
  }

  if (normalized === "token" && typeof value === "string") {
    return JWT_PATTERN.test(value.trim())
      ? "[REDACTED:JWT]"
      : sanitizeString(value);
  }

  return sanitizeForLog(value, seen);
}

/** Recursively redact sensitive keys and mask loginId before logging. */
export function sanitizeForLog(
  value: unknown,
  seen: WeakSet<object> = new WeakSet()
): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (value instanceof Error) {
    const sanitized: Record<string, unknown> = {
      name: value.name,
      message:
        typeof value.message === "string"
          ? sanitizeString(value.message)
          : value.message,
    };
    if (value.cause !== undefined) {
      sanitized.cause = sanitizeForLog(value.cause, seen);
    }
    return sanitized;
  }

  if (typeof FormData !== "undefined" && value instanceof FormData) {
    const entries: Record<string, unknown> = {};
    for (const [key, entryValue] of value.entries()) {
      entries[key] = sanitizeField(key, entryValue, seen);
    }
    return { FormData: entries };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLog(item, seen));
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[Circular]";
    }
    seen.add(value);

    const result: Record<string, unknown> = {};
    for (const [key, entryValue] of Object.entries(value)) {
      result[key] = sanitizeField(key, entryValue, seen);
    }
    return result;
  }

  return String(value);
}
