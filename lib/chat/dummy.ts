/**
 * 인증/세션 연동 전까지 사용하는 더미 UUID.
 * senderUuid · chatRoomUuid 는 이 값을 사용합니다.
 */
export const DUMMY_SENDER_UUID = "11111111-1111-4111-8111-111111111111";

export const DUMMY_CHAT_ROOMS = [
  {
    chatRoomUuid: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    title: "일반 채팅방",
    lastMessage: "안녕하세요!",
  },
  {
    chatRoomUuid: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    title: "프로젝트 채팅방",
    lastMessage: "회의 일정 공유합니다.",
  },
  {
    chatRoomUuid: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    title: "문의 채팅방",
    lastMessage: "문의 남겨주세요.",
  },
] as const;

export const DUMMY_CHAT_ROOM_UUID = DUMMY_CHAT_ROOMS[0].chatRoomUuid;
