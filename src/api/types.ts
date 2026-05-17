export type SlotStatus = "OPEN" | "HOLD" | "BLOCK";
export type ReservedStatus = "CONFIRMED" | "REJECTED" | "CANCELED";
export type RejectionReason =
  | "STORE_ISSUE"
  | "INGREDIENT_SHORTAGE"
  | "SCHEDULE_CHANGE"
  | "PERSONAL_REASON"
  | null;
export type WaitingStatus = "WAITING" | "CANCEL" | "SUCCESS" | "DELAY";
export type WaitingSetCategory = "OPEN" | "PAUSE" | "CLOSE";
export type Industry = "FINE_DINING";
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface ApiEnvelope<T> {
  result: "SUCCESS" | "ERROR";
  httpStatus: number;
  message: string;
  errorDetail: string[] | null;
  data: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest extends LoginRequest {
  phone: string;
  nickName: string;
}

export interface TokenDto {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  tokenDTO: TokenDto;
  accountResponse: AccountResponse;
}

export interface AccountResponse {
  email: string;
  nickName: string;
  phone: string;
}

export interface AccountUpdateRequest {
  phone: string;
  nickName: string;
}

export interface PasswordRequest {
  curPassword: string;
  newPassword: string;
}

export interface RestaurantResponse {
  restaurantName: string;
  restaurantLocation: string;
  industry: Industry;
  restaurantNumber: string;
  introduction: string;
  openTime: string;
  closeTime: string;
  openDays: DayOfWeek[];
}

export type RestaurantUpdateRequest = RestaurantResponse;

export interface ReservationSlot {
  slotId: string;
  planId: string;
  date: string;
  startTime: string;
  capacityTotal: number;
  remaining: number;
  status: SlotStatus;
}

export interface ReservationPlan {
  planDate: string;
  weekday: DayOfWeek;
  openTime: string;
  closeTime: string;
  breakOpenTime: string | null;
  breakCloseTime: string | null;
  turnTimeMinutes: number;
  slots: ReservationSlot[];
}

export interface ReservationRequest {
  slotId: string;
  representativeName: string;
  representativePhone: string;
  isProxyAttendee: boolean;
  totalVisitors: number;
  request: string;
}

export interface ReservationResponse {
  accountId: string;
  slotId: string;
  request: string;
  status: ReservedStatus;
  rejectionReason: RejectionReason;
  reservedPeople: number;
  visible: boolean;
}

export interface ReservationLookupQuery {
  accountId: string;
  date: string;
  time: string;
}

export interface WaitingResponse {
  waitingQueueId: string;
  accountId: string;
  waitingStatus: WaitingStatus;
  headCount: number;
  number: number;
}

export interface WaitingQueueResponse extends WaitingResponse {
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface WaitingPositionResponse {
  position: number;
}

export interface WaitingSettingResponse {
  restaurantId: string;
  category: string;
  updateAt: string;
}

export interface WaitingHistoryResponse extends WaitingQueueResponse {}

export interface ReservationSlotUpdateRequest {
  slotId: string;
  capacityTotal: number;
  status: SlotStatus;
}

export interface OpenSlotsCommandRequest {
  ownerId: string;
  startDate: string;
  endDate: string;
  isExceptionDateEnabled: boolean;
  exceptionDates: string[];
  dayOfWeekBased: boolean;
  repeatDays: DayOfWeek[];
  openTime: string;
  closeTime: string;
  breakTimes: Array<{ start: string; end: string }>;
  slotDuration: number;
  capacity: number;
}
