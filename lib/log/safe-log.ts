import { sanitizeForLog } from "@/lib/log/sanitize";

function sanitizeArgs(args: unknown[]): unknown[] {
  return args.map((arg) => sanitizeForLog(arg));
}

/** console.error wrapper — never logs passwords, tokens, or raw session/cookie values. */
export function logSafeError(message: string, ...args: unknown[]): void {
  if (args.length === 0) {
    console.error(message);
    return;
  }
  console.error(message, ...sanitizeArgs(args));
}

/** console.warn wrapper — same redaction rules as logSafeError. */
export function logSafeWarn(message: string, ...args: unknown[]): void {
  if (args.length === 0) {
    console.warn(message);
    return;
  }
  console.warn(message, ...sanitizeArgs(args));
}
