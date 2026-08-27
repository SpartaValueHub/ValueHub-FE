/** BE fieldErrors에서 documents 관련 첫 메시지 */
export function pickDocumentsFieldError(
  fieldErrors?: Record<string, string[]>
): string | null {
  if (!fieldErrors) return null;

  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (!key.startsWith("documents")) continue;
    const msg = messages.find((m) => m.trim());
    if (msg) return msg;
  }

  return null;
}
