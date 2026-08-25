/** auth UI 모델 — Service·Action 경계 */

export type UiAuthAccount = {
  logInId: string;
  email: string;
  phoneNumber: string;
  /** ISO-8601 (원본). 화면 표시 포맷은 mypage 등에서 변환 */
  joinedAt: string;
};
