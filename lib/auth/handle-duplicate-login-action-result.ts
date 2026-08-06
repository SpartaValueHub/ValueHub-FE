import {
  AUTH_SESSION_TERMINATED,
  isDuplicateLoginActionFailure,
} from "@/lib/auth/duplicate-login";
import { dispatchDuplicateLoginEvent } from "@/lib/auth/duplicate-login-event";

export type SessionEventPayload = {
  duplicateLogin?: boolean;
  code?: string;
};

/** session-event·BFF 응답 — duplicate login이면 이벤트 dispatch */
export function notifyDuplicateLoginFromSessionEvent(
  data: SessionEventPayload
): boolean {
  const isDuplicate =
    data.duplicateLogin === true || data.code === AUTH_SESSION_TERMINATED;
  if (!isDuplicate) return false;

  dispatchDuplicateLoginEvent();
  return true;
}

/** Server Action 결과 — AUTH_SESSION_TERMINATED이면 이벤트 dispatch, toast 생략용 true */
export function handleDuplicateLoginActionResult(result: {
  ok: boolean;
  code?: string;
}): boolean {
  if (!isDuplicateLoginActionFailure(result)) {
    return false;
  }

  dispatchDuplicateLoginEvent();
  return true;
}
