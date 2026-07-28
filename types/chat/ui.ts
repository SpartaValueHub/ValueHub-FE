/** UI 모델 — services 매핑 결과, 컴포넌트에서 사용 */

export interface UiChatMessage {
  chatMessageUuid: string;
  chatRoomUuid: string;
  messageType: string;
  message: string;
  senderUuid: string;
  createdAt: string;
  updatedAt: string;
  isMine: boolean;
}

export interface UiChatRoom {
  chatRoomUuid: string;
  title: string;
  lastMessage?: string;
}
