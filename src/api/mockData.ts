import type {
  AccountResponse,
  ReservationPlan,
  ReservationResponse,
  RestaurantResponse,
  WaitingPositionResponse,
  WaitingQueueResponse,
  WaitingResponse,
  WaitingSettingResponse,
} from "./types";

export const mockAccount: AccountResponse = {
  id: "guest-kim-haeun",
  email: "haeun.kim@lumenmail.kr",
  nickName: "김하은",
  phone: "010-4821-7305",
};

export const mockRestaurant: RestaurantResponse = {
  restaurantName: "라스트 서퍼 성수",
  restaurantLocation: "서울 성동구 연무장길 42, 3층",
  industry: "FINE_DINING",
  restaurantNumber: "02-517-2026",
  introduction: "제철 해산물과 한우를 중심으로 한 7코스 테이스팅 메뉴를 예약과 현장 웨이팅으로 운영합니다.",
  openTime: "17:00:00",
  closeTime: "23:00:00",
  openDays: ["TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
};

export const mockPlans: ReservationPlan[] = [
  {
    planDate: "2026-05-18",
    weekday: "MONDAY",
    openTime: "17:00:00",
    closeTime: "22:00:00",
    breakOpenTime: "19:00:00",
    breakCloseTime: "19:30:00",
    turnTimeMinutes: 90,
    slots: [
      {
        slotId: "slot-1700",
        planId: "plan-0518",
        date: "2026-05-18",
        startTime: "17:00:00",
        capacityTotal: 8,
        remaining: 2,
        status: "OPEN",
      },
      {
        slotId: "slot-2030",
        planId: "plan-0518",
        date: "2026-05-18",
        startTime: "20:30:00",
        capacityTotal: 8,
        remaining: 0,
        status: "HOLD",
      },
    ],
  },
  {
    planDate: "2026-05-19",
    weekday: "TUESDAY",
    openTime: "17:00:00",
    closeTime: "22:00:00",
    breakOpenTime: null,
    breakCloseTime: null,
    turnTimeMinutes: 90,
    slots: [
      {
        slotId: "slot-1900",
        planId: "plan-0519",
        date: "2026-05-19",
        startTime: "19:00:00",
        capacityTotal: 10,
        remaining: 5,
        status: "OPEN",
      },
    ],
  },
];

export const mockReservations: ReservationResponse[] = [
  {
    accountId: "guest-kim-haeun",
    slotId: "slot-1700",
    request: "창가 쪽 조용한 2인석이면 좋겠습니다.",
    status: "CONFIRMED",
    rejectionReason: null,
    reservedPeople: 2,
    visible: true,
  },
];

export const mockWaiting: WaitingResponse = {
  waitingQueueId: "waiting-101",
  accountId: "guest-kim-haeun",
  waitingStatus: "WAITING",
  headCount: 2,
  number: 17,
};

export const mockWaitingPosition: WaitingPositionResponse = {
  position: 3,
};

export const mockWaitingQueues: WaitingQueueResponse[] = [
  {
    ...mockWaiting,
    createdAt: "2026-05-17T18:20:00",
    updatedAt: "2026-05-17T18:20:00",
    createdBy: "system",
    updatedBy: "system",
  },
  {
    waitingQueueId: "waiting-102",
    accountId: "guest-lee-minseo",
    waitingStatus: "WAITING",
    headCount: 4,
    number: 18,
    createdAt: "2026-05-17T18:25:00",
    updatedAt: "2026-05-17T18:25:00",
    createdBy: "system",
    updatedBy: "system",
  },
];

export const mockWaitingSetting: WaitingSettingResponse = {
  restaurantId: "restaurant-supper-seongsu",
  category: "열림",
  updateAt: "2026-05-17T18:00:00",
};
