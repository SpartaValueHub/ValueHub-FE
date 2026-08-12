/** 서버 전용 — JWT token / getAuthUser */
export type SessionUser = {
  memberUuid: string;
  nickname: string;
  role: string;
};

/** 클라이언트 UI용 — nickname만 노출 (memberUuid·role 미포함) */
export type ClientSessionUser = {
  nickname: string;
};

export function toClientSessionUser(user: SessionUser): ClientSessionUser {
  return {
    nickname: user.nickname,
  };
}
