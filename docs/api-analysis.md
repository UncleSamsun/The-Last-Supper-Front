# The Last Supper API 분석

분석 기준: `../The-Last-Supper-fork/src/main/java/com/goorm/thelastsupper` 하위의 Controller, DTO, Security 설정. 백엔드 코드는 읽기만 했고 수정하지 않았다.

## 공통 사항

- Base URL은 프론트에서 `VITE_API_BASE_URL`로 주입한다.
- SecurityConfig 기준 공개 API는 `POST /api/v1/signup`, `POST /api/v1/login`, `POST /api/v1/refresh`, actuator, Swagger 문서뿐이다. 그 외 API는 `Authorization: Bearer {accessToken}`이 필요하다.
- 로그인/갱신은 refreshToken을 `HttpOnly`, `Secure`, `SameSite=None` 쿠키로 내려준다. 프론트 fetch는 `credentials: "include"`가 필요하다.
- Swagger UI와 OpenAPI JSON은 `/swagger-ui/**`, `/v3/api-docs/**`로 열려 있으나, 별도 Swagger 설정 클래스는 발견되지 않았다.
- 일부 예약/웨이팅 API는 인증 Principal 대신 `accountId` 쿼리 파라미터를 받는다. 실제 운영 연동 전에는 백엔드와 인증 방식 통일을 확인해야 한다.
- `ApiResponse<T>` 래퍼를 쓰는 API와 raw DTO를 반환하는 API가 섞여 있다.

## 인증/계정

| Method | Path | Auth | Request | Response | 비고 |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/signup` | 공개 | `{ email, phone, nickName, password }` | 201 Created | phone은 `000-0000-0000`, nickName 2~8자, password 8~16자 영문+숫자 |
| POST | `/api/v1/login` | 공개 | `{ email, password }` | `{ tokenDTO: { accessToken, refreshToken }, accountResponse }` | 실제 refreshToken은 쿠키로도 전달 |
| POST | `/api/v1/refresh` | 공개 | Authorization header + refreshToken cookie | `{ accessToken, refreshToken: "cookie" }` | accessToken 문자열을 HeaderUtil로 파싱 |
| GET | `/api/v1/customers` | 필요 | 없음 | `{ email, nickName, phone }` | 현재 로그인 사용자 |
| PUT | `/api/v1/customers` | 필요 | `{ phone, nickName }` | AccountResponse | 프로필 수정 |
| PATCH | `/api/v1/customers` | 필요 | `{ curPassword, newPassword }` | AccountResponse | 비밀번호 변경 |

## 매장

| Method | Path | Auth | Request | Response | 비고 |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/restaurants/{restaurantId}` | 필요 | 없음 | RestaurantResponse | industry는 현재 `FINE_DINING` |
| PUT | `/api/v1/restaurants/{restaurantId}` | OWNER | RestaurantUpdateRequest | RestaurantResponse | `@PreAuthorize("hasAuthority('OWNER')")` |
| POST | `/api/v1/restaurants` | 필요 | 없음 | 200 OK | 임시 매장 생성성 메서드로 보임 |

RestaurantResponse:

```ts
{
  restaurantName: string;
  restaurantLocation: string;
  industry: "FINE_DINING";
  restaurantNumber: string;
  introduction: string;
  openTime: "HH:mm:ss";
  closeTime: "HH:mm:ss";
  openDays: DayOfWeek[];
}
```

## 예약 플랜/슬롯

| Method | Path | Auth | Request | Response | 비고 |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/reservations/restaurants/{restaurantId}/plans?startDate=yyyy-MM-dd&endDate=yyyy-MM-dd` | 필요 | 없음 | `ApiResponse<ReservationPlanResponse[]>` | 기간 내 플랜+슬롯 조회 |
| POST | `/api/v1/reservations/restaurants/{restaurantId}/slots/open` | 설정상 permitAll | OpenSlotsCommandRequest | `ApiResponse<ReservationPlanResponse[]>` | 점주 슬롯 오픈. path의 restaurantId는 현재 메서드에서 직접 받지 않음 |
| PATCH | `/api/v1/restaurants/restaurants/slots` | 필요 | `ReservationSlotUpdateRequest[]` | `ApiResponse<ReservationSlotResponse[]>` | 경로에 `restaurants/restaurants` 중복이 있어 확인 필요 |
| PUT | `/api/v1/reservations/restaurants/slots/{slotId}/status` | 필요 | `{ slotStatus }` | `ApiResponse<string[]>` | slotStatus: `OPEN`, `HOLD`, `BLOCK` |

OpenSlotsCommandRequest:

```ts
{
  ownerId: string;
  startDate: "yyyy-MM-dd";
  endDate: "yyyy-MM-dd";
  isExceptionDateEnabled: boolean;
  exceptionDates: string[];
  dayOfWeekBased: boolean;
  repeatDays: DayOfWeek[];
  openTime: "HH:mm:ss";
  closeTime: "HH:mm:ss";
  breakTimes: Array<{ start: "HH:mm:ss"; end: "HH:mm:ss" }>;
  slotDuration: number; // 1~120
  capacity: number; // min 1
}
```

ReservationPlanResponse:

```ts
{
  planDate: string;
  weekday: DayOfWeek;
  openTime: string;
  closeTime: string;
  breakOpenTime: string | null;
  breakCloseTime: string | null;
  turnTimeMinutes: number;
  slots: ReservationSlot[];
}
```

## 예약 이력

| Method | Path | Auth | Request | Response | 비고 |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/reservation?accountId={accountId}` | 필요 | ReservationRequest | ReservationResponse | 예약 생성 |
| PATCH | `/api/v1/reservation/{historyId}?accountId={accountId}` | 필요 | ReservationRequest | ReservationResponse | 예약 수정 |
| DELETE | `/api/v1/reservation/{historyId}?slotId={slotId}&accountId={accountId}` | 필요 | 없음 | 204 No Content | 예약 취소 |
| GET | `/api/v1/reservation/me?accountId={accountId}&date=yyyy-MM-dd&time=HH:mm:ss` | 필요 | 없음 | ReservationResponse | 특정 날짜/시간 조회 |
| GET | `/api/v1/reservation/me/all?accountId={accountId}` | 필요 | 없음 | ReservationResponse[] | 내 전체 예약 조회 |

ReservationRequest:

```ts
{
  slotId: string;
  representativeName: string;
  representativePhone: string;
  isProxyAttendee: boolean;
  totalVisitors: number; // 1~20
  request: string; // max 200
}
```

## 웨이팅

| Method | Path | Auth | Request | Response | 비고 |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/waiting?accountId={accountId}` | 필요 | `{ headCount }` | 202 Accepted body 없음 | DTO상 WaitingResponse이나 컨트롤러는 empty accepted |
| POST | `/api/v1/waiting/cancel?accountId={accountId}` | 필요 | 없음 | WaitingResponse | 고객 웨이팅 취소 |
| POST | `/api/v1/waiting/delay?accountId={accountId}` | 필요 | 없음 | 202 Accepted body 없음 | 고객 순번 미루기 |
| GET | `/api/v1/waiting/position?accountId={accountId}` | 필요 | 없음 | `{ position }` | 내 앞 대기팀 수 |
| POST | `/api/v1/waiting/call` | 필요 | 없음 | WaitingResponse | 다음 고객 호출 |
| GET | `/api/v1/waitings/queue` | 필요 | 없음 | WaitingResponse[] | 대기중 팀 리스트 |
| GET | `/api/v1/waiting/get/waiting-queues` | 필요 | 없음 | WaitingQueueResponse[] | 큐 상세 조회 |
| GET | `/api/v1/waiting/get/waiting-histories` | 필요 | 없음 | WaitingHistoryResponse[] | 히스토리 상세 조회 |
| POST | `/api/v1/waitings/open` | 필요 | `{ restaurantId, category }` | WaitingSettingResponse | category: `OPEN` |
| POST | `/api/v1/waitings/pause` | 필요 | `{ restaurantId, category }` | WaitingSettingResponse | category: `PAUSE` |
| POST | `/api/v1/waitings/close` | 필요 | `{ restaurantId, category }` | WaitingSettingResponse | category: `CLOSE` |

웨이팅 enum:

- WaitingStatus: `WAITING`, `CANCEL`, `SUCCESS`, `DELAY`
- WaitingSetCategory: `OPEN`, `PAUSE`, `CLOSE`

## 구현 제안 화면

1. 인증/세션 패널
   - 로그인, accessToken 저장/삭제, refresh 연동 자리 마련
   - 토큰 저장 방식은 현재 localStorage로 최소 구현, 보안 요구에 따라 메모리 저장으로 교체 가능

2. 고객 예약 화면
   - 매장 상세 조회
   - 기간별 예약 플랜/슬롯 조회
   - OPEN 슬롯 선택 후 예약 생성
   - 내 예약 목록 조회/취소

3. 고객 웨이팅 화면
   - 인원 입력 후 웨이팅 등록
   - 내 앞 대기팀 조회
   - 웨이팅 취소/미루기

4. 점주 운영 화면
   - 웨이팅 OPEN/PAUSE/CLOSE 전환
   - 대기 큐 조회와 다음 고객 호출
   - 예약 슬롯 오픈, 슬롯 상태 변경, capacity/status 일괄 변경

## 프론트 구현 메모

- API 래퍼는 `src/api/theLastSupperApi.ts`에 집중시켰다.
- 타입은 `src/api/types.ts`에 DTO 이름과 최대한 맞춰 정의했다.
- `VITE_API_BASE_URL`이 없으면 `src/api/mockData.ts`의 mock 데이터로 동작한다. 값이 있으면 실제 백엔드 실패를 그대로 화면에 노출해 연동 오류를 숨기지 않는다.
- 확인 필요 경로와 응답 형식 차이는 API 래퍼 내부에서만 조정하면 되도록 화면 컴포넌트와 분리했다.
- API 테스트 화면은 현재 분석한 27개 엔드포인트/기능을 순차 실행한다. 중복 제약이 있는 예약/웨이팅/슬롯 API는 `docs/demo-seed.sql`의 고정 테스트 계정과 매 실행마다 달라지는 미래 날짜를 사용한다.
