-- Chat MySQL 더미 (DB: valuehub_chat)
--
-- 방·메시지는 Mongo라서 이 파일만으로는 목록이 안 뜹니다.
-- 이어서 docs/chat-dummy-mongo.js 를 mongosh에 넣으세요.
--
-- 아래 UUID를 본인 로그인 memberUuid / 상대 / 실제 상품 UUID로 바꾸세요.
--   @buyer  = 지금 프론트에 로그인한 회원
--   @seller = 대화 상대 (상품 올린 사람)
--   @post   = product-post-service에 있는 게시글 UUID (없어도 목록은 뜸)

USE valuehub_chat;

-- 구매자 (나)
INSERT INTO chat_user_profiles
  (member_uuid, nickname, profile_image_url, member_grade, updated_at)
VALUES
  (
    '22222222-2222-4222-8222-222222222222',
    '테스트구매자',
    NULL,
    NULL,
    NOW()
  )
ON DUPLICATE KEY UPDATE
  nickname = VALUES(nickname),
  updated_at = NOW();

-- 판매자 (상대)
INSERT INTO chat_user_profiles
  (member_uuid, nickname, profile_image_url, member_grade, updated_at)
VALUES
  (
    '33333333-3333-4333-8333-333333333333',
    '테스트판매자',
    NULL,
    'GOLD',
    NOW()
  )
ON DUPLICATE KEY UPDATE
  nickname = VALUES(nickname),
  member_grade = VALUES(member_grade),
  updated_at = NOW();

-- 상품 스냅샷 (목록·방 상단)
INSERT INTO chat_product_posts
  (
    product_post_uuid,
    product_post_image_url,
    product_post_name,
    price,
    trade_status,
    updated_at
  )
VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'https://picsum.photos/seed/valuehub-chat/400/400',
    '중고 노트북',
    350000,
    'SELLING',
    NOW()
  )
ON DUPLICATE KEY UPDATE
  product_post_image_url = VALUES(product_post_image_url),
  product_post_name = VALUES(product_post_name),
  price = VALUES(price),
  trade_status = VALUES(trade_status),
  updated_at = NOW();
