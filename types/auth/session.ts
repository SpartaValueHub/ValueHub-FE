/** Auth.js 세션에 노출되는 사용자 필드 */
export type SessionUser = {
  memberUuid: string;
  nickname: string;
  role: string;
};

/** 클라이언트 UI용 — memberUuid는 서버 전용, nickname·role만 노출 */
export type ClientSessionUser = {
  nickname: string;
  role: string;
};

export function toClientSessionUser(user: SessionUser): ClientSessionUser {
  return {
    nickname: user.nickname,
    role: user.role,
  };
}
