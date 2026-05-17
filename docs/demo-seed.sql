-- The Last Supper realistic seed data
-- Password for all seeded accounts: Password1!
-- Scope: curated guest/owner/restaurant ids for showroom-quality reservation and waiting flows.

SET NAMES utf8mb4;

DELETE FROM reservation_history
WHERE id LIKE 'reservation-supper-%'
   OR id LIKE 'demo-reservation-%'
   OR account_id IN (
     'account-demo',
     'demo-customer-001',
     'demo-customer-002',
     'demo-customer-003',
     'demo-customer-004',
     'demo-customer-005',
     'demo-customer-006',
     'demo-customer-007',
     'api-test-reservation',
     'api-test-waiting',
     'guest-kim-haeun',
     'guest-lee-minseo',
     'guest-park-jiho',
     'guest-choi-seoyeon',
     'guest-jung-hyunwoo',
     'guest-han-arin',
     'guest-oh-yujun',
     'guest-seo-nari',
     'guest-chae-rina',
     'guest-kang-doyun'
   );

DELETE FROM reservation_slot
WHERE id LIKE 'supper-slot-%'
   OR id LIKE 'demo-slot-%';

DELETE FROM reservation_plan
WHERE id LIKE 'supper-plan-%'
   OR id LIKE 'demo-plan-%';

DELETE FROM waiting_queue
WHERE id LIKE 'waiting-supper-queue-%'
   OR id LIKE 'demo-waiting-queue-%'
   OR account_id IN (
     'account-demo',
     'demo-customer-001',
     'demo-customer-002',
     'demo-customer-003',
     'demo-customer-004',
     'demo-customer-005',
     'demo-customer-006',
     'demo-customer-007',
     'api-test-reservation',
     'api-test-waiting',
     'guest-kim-haeun',
     'guest-lee-minseo',
     'guest-park-jiho',
     'guest-choi-seoyeon',
     'guest-jung-hyunwoo',
     'guest-han-arin',
     'guest-oh-yujun',
     'guest-seo-nari',
     'guest-chae-rina',
     'guest-kang-doyun'
   );

DELETE FROM waiting_history
WHERE id LIKE 'waiting-supper-history-%'
   OR id LIKE 'demo-waiting-history-%'
   OR account_id IN (
     'account-demo',
     'demo-customer-001',
     'demo-customer-002',
     'demo-customer-003',
     'demo-customer-004',
     'demo-customer-005',
     'demo-customer-006',
     'demo-customer-007',
     'api-test-reservation',
     'api-test-waiting',
     'guest-kim-haeun',
     'guest-lee-minseo',
     'guest-park-jiho',
     'guest-choi-seoyeon',
     'guest-jung-hyunwoo',
     'guest-han-arin',
     'guest-oh-yujun',
     'guest-seo-nari',
     'guest-chae-rina',
     'guest-kang-doyun'
   );

DELETE FROM waiting_setting
WHERE id LIKE 'waiting-supper-setting-%'
   OR id LIKE 'demo-waiting-setting-%';

DELETE FROM weekdays
WHERE plan_id IN ('restaurant-supper-seongsu', 'restaurant-demo');

DELETE FROM restaurant
WHERE id IN ('restaurant-supper-seongsu', 'restaurant-demo');

DELETE FROM account
WHERE id IN (
  'owner-demo',
  'account-demo',
  'demo-customer-001',
  'demo-customer-002',
  'demo-customer-003',
  'demo-customer-004',
  'demo-customer-005',
  'demo-customer-006',
  'demo-customer-007',
  'api-test-reservation',
  'api-test-waiting',
  'owner-yoon-seojin',
  'guest-kim-haeun',
  'guest-lee-minseo',
  'guest-park-jiho',
  'guest-choi-seoyeon',
  'guest-jung-hyunwoo',
  'guest-han-arin',
  'guest-oh-yujun',
  'guest-seo-nari',
  'guest-chae-rina',
  'guest-kang-doyun'
);

INSERT INTO account (
  id,
  email,
  nick_name,
  phone_number,
  password,
  role,
  is_deleted,
  deleted_at,
  deletion_scheduled_at,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES
  ('owner-yoon-seojin', 'seojin.yoon@lastsupper.kr', '윤서진', '010-2401-1984', '$2a$10$cMfNR4E3MIUtKEtC4e6MgOnq1gX175kXGUHKDsioAyKtCke.rw69W', 'OWNER', b'0', NULL, NULL, '2026-05-01 09:00:00', '2026-05-17 17:00:00', 'seed', 'seed'),
  ('guest-kim-haeun', 'haeun.kim@lumenmail.kr', '김하은', '010-4821-7305', '$2a$10$cMfNR4E3MIUtKEtC4e6MgOnq1gX175kXGUHKDsioAyKtCke.rw69W', 'CUSTOMER', b'0', NULL, NULL, '2026-05-02 11:20:00', '2026-05-17 16:45:00', 'seed', 'seed'),
  ('guest-lee-minseo', 'minseo.lee@lumenmail.kr', '이민서', '010-2111-3141', '$2a$10$cMfNR4E3MIUtKEtC4e6MgOnq1gX175kXGUHKDsioAyKtCke.rw69W', 'CUSTOMER', b'0', NULL, NULL, '2026-05-05 12:10:00', '2026-05-17 18:10:00', 'seed', 'seed'),
  ('guest-park-jiho', 'jiho.park@lumenmail.kr', '박지호', '010-3222-4159', '$2a$10$cMfNR4E3MIUtKEtC4e6MgOnq1gX175kXGUHKDsioAyKtCke.rw69W', 'CUSTOMER', b'0', NULL, NULL, '2026-05-06 15:35:00', '2026-05-17 18:12:00', 'seed', 'seed'),
  ('guest-choi-seoyeon', 'seoyeon.choi@lumenmail.kr', '최서연', '010-4333-9265', '$2a$10$cMfNR4E3MIUtKEtC4e6MgOnq1gX175kXGUHKDsioAyKtCke.rw69W', 'CUSTOMER', b'0', NULL, NULL, '2026-05-07 10:05:00', '2026-05-17 18:14:00', 'seed', 'seed'),
  ('guest-jung-hyunwoo', 'hyunwoo.jung@lumenmail.kr', '정현우', '010-5444-3589', '$2a$10$cMfNR4E3MIUtKEtC4e6MgOnq1gX175kXGUHKDsioAyKtCke.rw69W', 'CUSTOMER', b'0', NULL, NULL, '2026-05-08 14:42:00', '2026-05-17 18:16:00', 'seed', 'seed'),
  ('guest-han-arin', 'arin.han@lumenmail.kr', '한아린', '010-6555-7932', '$2a$10$cMfNR4E3MIUtKEtC4e6MgOnq1gX175kXGUHKDsioAyKtCke.rw69W', 'CUSTOMER', b'0', NULL, NULL, '2026-05-09 13:18:00', '2026-05-17 18:18:00', 'seed', 'seed'),
  ('guest-oh-yujun', 'yujun.oh@lumenmail.kr', '오유준', '010-7666-3846', '$2a$10$cMfNR4E3MIUtKEtC4e6MgOnq1gX175kXGUHKDsioAyKtCke.rw69W', 'CUSTOMER', b'0', NULL, NULL, '2026-05-10 16:00:00', '2026-05-17 18:20:00', 'seed', 'seed'),
  ('guest-seo-nari', 'nari.seo@lumenmail.kr', '서나리', '010-8777-2643', '$2a$10$cMfNR4E3MIUtKEtC4e6MgOnq1gX175kXGUHKDsioAyKtCke.rw69W', 'CUSTOMER', b'0', NULL, NULL, '2026-05-11 09:30:00', '2026-05-17 18:22:00', 'seed', 'seed'),
  ('guest-chae-rina', 'rina.chae@lumenmail.kr', '채리나', '010-8888-2026', '$2a$10$cMfNR4E3MIUtKEtC4e6MgOnq1gX175kXGUHKDsioAyKtCke.rw69W', 'CUSTOMER', b'0', NULL, NULL, '2026-05-12 09:30:00', '2026-05-17 18:24:00', 'seed', 'seed'),
  ('guest-kang-doyun', 'doyun.kang@lumenmail.kr', '강도윤', '010-9999-2026', '$2a$10$cMfNR4E3MIUtKEtC4e6MgOnq1gX175kXGUHKDsioAyKtCke.rw69W', 'CUSTOMER', b'0', NULL, NULL, '2026-05-12 09:35:00', '2026-05-17 18:25:00', 'seed', 'seed');

INSERT INTO restaurant (
  id,
  account_id,
  restaurant_name,
  restaurant_location,
  industry,
  restaurant_number,
  introduction,
  open_time,
  close_time,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  'restaurant-supper-seongsu',
  'owner-yoon-seojin',
  '라스트 서퍼 성수',
  '서울 성동구 연무장길 42, 3층',
  'FINE_DINING',
  '02-517-2026',
  '제철 해산물과 한우를 중심으로 한 7코스 테이스팅 메뉴를 예약과 현장 웨이팅으로 운영합니다.',
  '17:00:00',
  '23:00:00',
  '2026-05-01 09:10:00',
  '2026-05-17 17:30:00',
  'seed',
  'seed'
);

INSERT INTO weekdays (plan_id, weekday) VALUES
  ('restaurant-supper-seongsu', 'MONDAY'),
  ('restaurant-supper-seongsu', 'TUESDAY'),
  ('restaurant-supper-seongsu', 'WEDNESDAY'),
  ('restaurant-supper-seongsu', 'THURSDAY'),
  ('restaurant-supper-seongsu', 'FRIDAY'),
  ('restaurant-supper-seongsu', 'SATURDAY');

INSERT INTO reservation_plan (
  id,
  restaurant_id,
  plan_date,
  weekday,
  open_time,
  close_time,
  break_open_time,
  break_close_time,
  turn_time_minutes,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES
  ('supper-plan-20260518', 'restaurant-supper-seongsu', '2026-05-18', 'MONDAY', '17:00:00', '23:00:00', '19:00:00', '19:30:00', 90, '2026-05-17 09:00:00', '2026-05-17 09:00:00', 'seed', 'seed'),
  ('supper-plan-20260519', 'restaurant-supper-seongsu', '2026-05-19', 'TUESDAY', '17:00:00', '23:00:00', '19:00:00', '19:30:00', 90, '2026-05-17 09:02:00', '2026-05-17 09:02:00', 'seed', 'seed'),
  ('supper-plan-20260520', 'restaurant-supper-seongsu', '2026-05-20', 'WEDNESDAY', '17:00:00', '23:00:00', NULL, NULL, 90, '2026-05-17 09:04:00', '2026-05-17 09:04:00', 'seed', 'seed'),
  ('supper-plan-20260521', 'restaurant-supper-seongsu', '2026-05-21', 'THURSDAY', '18:00:00', '23:00:00', NULL, NULL, 60, '2026-05-17 09:06:00', '2026-05-17 09:06:00', 'seed', 'seed');

INSERT INTO reservation_slot (
  id,
  plan_id,
  date,
  start_time,
  slot_date_time,
  capacity_total,
  remaining,
  status,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES
  ('supper-slot-20260518-1700', 'supper-plan-20260518', '2026-05-18', '17:00:00', '2026-05-18 17:00:00', 8, 2, 'OPEN', '2026-05-17 09:10:00', '2026-05-17 18:00:00', 'seed', 'seed'),
  ('supper-slot-20260518-1830', 'supper-plan-20260518', '2026-05-18', '18:30:00', '2026-05-18 18:30:00', 8, 0, 'HOLD', '2026-05-17 09:10:00', '2026-05-17 18:00:00', 'seed', 'seed'),
  ('supper-slot-20260518-2000', 'supper-plan-20260518', '2026-05-18', '20:00:00', '2026-05-18 20:00:00', 8, 8, 'OPEN', '2026-05-17 09:10:00', '2026-05-17 18:00:00', 'seed', 'seed'),
  ('supper-slot-20260518-2130', 'supper-plan-20260518', '2026-05-18', '21:30:00', '2026-05-18 21:30:00', 0, 0, 'BLOCK', '2026-05-17 09:10:00', '2026-05-17 18:00:00', 'seed', 'seed'),
  ('supper-slot-20260519-1700', 'supper-plan-20260519', '2026-05-19', '17:00:00', '2026-05-19 17:00:00', 10, 4, 'OPEN', '2026-05-17 09:12:00', '2026-05-17 18:00:00', 'seed', 'seed'),
  ('supper-slot-20260519-1830', 'supper-plan-20260519', '2026-05-19', '18:30:00', '2026-05-19 18:30:00', 10, 1, 'OPEN', '2026-05-17 09:12:00', '2026-05-17 18:00:00', 'seed', 'seed'),
  ('supper-slot-20260519-2000', 'supper-plan-20260519', '2026-05-19', '20:00:00', '2026-05-19 20:00:00', 10, 10, 'OPEN', '2026-05-17 09:12:00', '2026-05-17 18:00:00', 'seed', 'seed'),
  ('supper-slot-20260520-1700', 'supper-plan-20260520', '2026-05-20', '17:00:00', '2026-05-20 17:00:00', 8, 6, 'OPEN', '2026-05-17 09:14:00', '2026-05-17 18:00:00', 'seed', 'seed'),
  ('supper-slot-20260520-1830', 'supper-plan-20260520', '2026-05-20', '18:30:00', '2026-05-20 18:30:00', 8, 8, 'OPEN', '2026-05-17 09:14:00', '2026-05-17 18:00:00', 'seed', 'seed'),
  ('supper-slot-20260521-1800', 'supper-plan-20260521', '2026-05-21', '18:00:00', '2026-05-21 18:00:00', 6, 6, 'OPEN', '2026-05-17 09:16:00', '2026-05-17 18:00:00', 'seed', 'seed'),
  ('supper-slot-20260521-1900', 'supper-plan-20260521', '2026-05-21', '19:00:00', '2026-05-21 19:00:00', 6, 2, 'OPEN', '2026-05-17 09:16:00', '2026-05-17 18:00:00', 'seed', 'seed'),
  ('supper-slot-20260521-2000', 'supper-plan-20260521', '2026-05-21', '20:00:00', '2026-05-21 20:00:00', 6, 0, 'HOLD', '2026-05-17 09:16:00', '2026-05-17 18:00:00', 'seed', 'seed');

INSERT INTO reservation_history (
  id,
  account_id,
  reservation_slot_id,
  request,
  reserved_status,
  rejection_reason,
  reserved_people,
  is_visible,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES
  ('reservation-supper-001', 'guest-han-arin', 'supper-slot-20260518-1700', '창가 쪽 조용한 2인석이면 좋겠습니다.', 'CONFIRMED', NULL, 2, b'1', '2026-05-17 10:15:00', '2026-05-17 10:15:00', 'seed', 'seed'),
  ('reservation-supper-002', 'guest-lee-minseo', 'supper-slot-20260518-1700', '결혼기념일 방문입니다. 디저트 메시지 가능 여부 확인 부탁드립니다.', 'CONFIRMED', NULL, 4, b'1', '2026-05-17 10:22:00', '2026-05-17 10:22:00', 'seed', 'seed'),
  ('reservation-supper-003', 'guest-park-jiho', 'supper-slot-20260518-1830', '레드 와인 1병 콜키지 예정입니다.', 'CONFIRMED', NULL, 4, b'1', '2026-05-17 11:05:00', '2026-05-17 11:05:00', 'seed', 'seed'),
  ('reservation-supper-004', 'guest-choi-seoyeon', 'supper-slot-20260518-1830', '동반자 1명 갑각류 알레르기가 있습니다.', 'CONFIRMED', NULL, 4, b'1', '2026-05-17 11:20:00', '2026-05-17 11:20:00', 'seed', 'seed'),
  ('reservation-supper-005', 'guest-jung-hyunwoo', 'supper-slot-20260519-1700', '바 좌석도 괜찮고 코스 시작 시간을 맞춰 방문하겠습니다.', 'CONFIRMED', NULL, 6, b'1', '2026-05-17 12:30:00', '2026-05-17 12:30:00', 'seed', 'seed'),
  ('reservation-supper-006', 'guest-han-arin', 'supper-slot-20260519-1830', '유아 의자 1개와 입구와 먼 좌석을 부탁드립니다.', 'CONFIRMED', NULL, 9, b'1', '2026-05-17 13:10:00', '2026-05-17 13:10:00', 'seed', 'seed'),
  ('reservation-supper-007', 'guest-oh-yujun', 'supper-slot-20260520-1700', '예약자보다 동반자가 먼저 도착할 수 있습니다.', 'CONFIRMED', NULL, 2, b'1', '2026-05-17 14:40:00', '2026-05-17 14:40:00', 'seed', 'seed'),
  ('reservation-supper-008', 'guest-seo-nari', 'supper-slot-20260521-1900', '와인 페어링 4인 포함으로 준비 부탁드립니다.', 'CONFIRMED', NULL, 4, b'1', '2026-05-17 15:00:00', '2026-05-17 15:00:00', 'seed', 'seed'),
  ('reservation-supper-009', 'guest-park-jiho', 'supper-slot-20260520-1830', '출장 일정 변경으로 취소된 예약입니다.', 'CANCELED', NULL, 2, b'1', '2026-05-16 19:20:00', '2026-05-17 09:30:00', 'seed', 'seed'),
  ('reservation-supper-010', 'guest-choi-seoyeon', 'supper-slot-20260521-1800', '소규모 대관 문의성 요청으로 보류 후 거절된 예약입니다.', 'REJECTED', 'STORE_ISSUE', 10, b'1', '2026-05-16 20:10:00', '2026-05-17 10:00:00', 'seed', 'seed');

INSERT INTO waiting_setting (
  id,
  restaurant_id,
  waiting_set_category,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES
  ('waiting-supper-setting-open', 'restaurant-supper-seongsu', 'OPEN', '2026-05-17 17:00:00', '2026-05-17 17:00:00', 'seed', 'seed');

INSERT INTO waiting_queue (
  id,
  account_id,
  waiting_status,
  head_count,
  number,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES
  ('waiting-supper-queue-017', 'guest-lee-minseo', 'WAITING', 2, 17, '2026-05-17 18:10:00', '2026-05-17 18:10:00', 'seed', 'seed'),
  ('waiting-supper-queue-018', 'guest-park-jiho', 'WAITING', 4, 18, '2026-05-17 18:13:00', '2026-05-17 18:13:00', 'seed', 'seed'),
  ('waiting-supper-queue-019', 'guest-seo-nari', 'WAITING', 2, 19, '2026-05-17 18:18:00', '2026-05-17 18:18:00', 'seed', 'seed'),
  ('waiting-supper-queue-020', 'guest-choi-seoyeon', 'WAITING', 3, 20, '2026-05-17 18:22:00', '2026-05-17 18:22:00', 'seed', 'seed'),
  ('waiting-supper-queue-021', 'guest-jung-hyunwoo', 'DELAY', 2, 21, '2026-05-17 18:30:00', '2026-05-17 18:45:00', 'seed', 'seed');

INSERT INTO waiting_history (
  id,
  account_id,
  waiting_status,
  head_count,
  number,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES
  ('waiting-supper-history-011', 'guest-han-arin', 'SUCCESS', 2, 11, '2026-05-17 17:15:00', '2026-05-17 17:42:00', 'seed', 'seed'),
  ('waiting-supper-history-012', 'guest-oh-yujun', 'SUCCESS', 3, 12, '2026-05-17 17:20:00', '2026-05-17 17:55:00', 'seed', 'seed'),
  ('waiting-supper-history-013', 'guest-seo-nari', 'CANCEL', 2, 13, '2026-05-17 17:28:00', '2026-05-17 17:33:00', 'seed', 'seed'),
  ('waiting-supper-history-014', 'guest-jung-hyunwoo', 'SUCCESS', 4, 14, '2026-05-17 17:36:00', '2026-05-17 18:05:00', 'seed', 'seed');
