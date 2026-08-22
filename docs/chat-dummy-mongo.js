/**
 * Chat Mongo 더미 (컬렉션: chat_rooms, chat_messages)
 *
 * mongosh "<mongodb-uri>" docs/chat-dummy-mongo.js
 *
 * buyer / seller / product UUID는 docs/chat-dummy-data.sql 과 같게 맞추고,
 * buyer는 지금 로그인한 memberUuid 로 바꾸세요.
 */

const buyerUuid = "22222222-2222-4222-8222-222222222222";
const sellerUuid = "33333333-3333-4333-8333-333333333333";
const productPostUuid = "11111111-1111-4111-8111-111111111111";
const roomId = ObjectId("67a1c2d3e4f5a6b7c8d9e0f1");
const now = new Date();
const earlier = new Date(now.getTime() - 60 * 60 * 1000);

db.chat_rooms.deleteOne({ _id: roomId });
db.chat_rooms.insertOne({
  _id: roomId,
  product_post_uuid: productPostUuid,
  seller_uuid: sellerUuid,
  participants: [
    {
      member_uuid: buyerUuid,
      is_in_room: false,
      joined_at: earlier,
      last_read_at: null,
    },
    {
      member_uuid: sellerUuid,
      is_in_room: false,
      joined_at: earlier,
      last_read_at: null,
    },
  ],
  last_message: {
    content: "안녕하세요, 아직 판매 중인가요?",
    created_at: now,
  },
  status: "ACTIVE",
  created_at: earlier,
  updated_at: now,
});

db.chat_messages.deleteMany({ room_id: roomId.toHexString() });
db.chat_messages.insertMany([
  {
    _id: ObjectId("67b1c2d3e4f5a6b7c8d9e0f1"),
    room_id: roomId.toHexString(),
    sender_uuid: sellerUuid,
    message_type: "TEXT",
    content: "네 아직 있습니다",
    metadata: null,
    created_at: earlier,
  },
  {
    _id: ObjectId("67b1c2d3e4f5a6b7c8d9e0f2"),
    room_id: roomId.toHexString(),
    sender_uuid: buyerUuid,
    message_type: "TEXT",
    content: "안녕하세요, 아직 판매 중인가요?",
    metadata: null,
    created_at: now,
  },
]);
