import { apiRequest, hasApiBaseUrl, tokenStore } from "./client";
import {
  mockAccount,
  mockPlans,
  mockReservations,
  mockRestaurant,
  mockWaiting,
  mockWaitingPosition,
  mockWaitingQueues,
  mockWaitingSetting,
} from "./mockData";
import type {
  ApiEnvelope,
  AccountResponse,
  AccountUpdateRequest,
  LoginResponse,
  LoginRequest,
  OpenSlotsCommandRequest,
  PasswordRequest,
  ReservationPlan,
  ReservationLookupQuery,
  ReservationRequest,
  ReservationResponse,
  ReservationSlotUpdateRequest,
  RestaurantResponse,
  RestaurantUpdateRequest,
  SignupRequest,
  SlotStatus,
  TokenDto,
  WaitingHistoryResponse,
  WaitingPositionResponse,
  WaitingQueueResponse,
  WaitingResponse,
  WaitingSetCategory,
  WaitingSettingResponse,
} from "./types";

const sleep = (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms));

async function withMockFallback<T>(request: () => Promise<T>, mock: T): Promise<T> {
  if (!hasApiBaseUrl()) {
    await sleep();
    return mock;
  }

  return request();
}

export const lastSupperApi = {
  async signup(payload: SignupRequest) {
    return withMockFallback(() => apiRequest<void>("/api/v1/signup", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }), undefined);
  },

  async login(payload: LoginRequest) {
    const response = await withMockFallback(
      () =>
        apiRequest<LoginResponse>("/api/v1/login", {
          method: "POST",
          auth: false,
          body: JSON.stringify(payload),
        }),
      { tokenDTO: { accessToken: "mock-access-token", refreshToken: "cookie" }, accountResponse: mockAccount },
    );
    const token = response.tokenDTO;
    tokenStore.set(token.accessToken);
    return token;
  },

  async getAccount() {
    return withMockFallback(() => apiRequest<AccountResponse>("/api/v1/customers"), mockAccount);
  },

  async updateAccount(payload: AccountUpdateRequest) {
    return withMockFallback(
      () => apiRequest<AccountResponse>("/api/v1/customers", { method: "PUT", body: JSON.stringify(payload) }),
      { ...mockAccount, ...payload },
    );
  },

  async updatePassword(payload: PasswordRequest) {
    return withMockFallback(
      () => apiRequest<AccountResponse>("/api/v1/customers", { method: "PATCH", body: JSON.stringify(payload) }),
      mockAccount,
    );
  },

  async getRestaurant(restaurantId: string) {
    return withMockFallback(
      () => apiRequest<RestaurantResponse>(`/api/v1/restaurants/${restaurantId}`),
      mockRestaurant,
    );
  },

  async updateRestaurant(restaurantId: string, payload: RestaurantUpdateRequest) {
    return withMockFallback(
      () => apiRequest<RestaurantResponse>(`/api/v1/restaurants/${restaurantId}`, { method: "PUT", body: JSON.stringify(payload) }),
      payload,
    );
  },

  async createTempRestaurant() {
    return withMockFallback(() => apiRequest<void>("/api/v1/restaurants", { method: "POST" }), undefined);
  },

  async getReservationPlans(restaurantId: string, startDate: string, endDate: string) {
    return withMockFallback(
      async () => {
        const response = await apiRequest<ApiEnvelope<ReservationPlan[]>>(
          `/api/v1/reservations/restaurants/${restaurantId}/plans`,
          { query: { startDate, endDate } },
        );
        return response.data;
      },
      mockPlans,
    );
  },

  async createReservation(accountId: string, payload: ReservationRequest) {
    return withMockFallback(
      () =>
        apiRequest<ReservationResponse>("/api/v1/reservation", {
          method: "POST",
          query: { accountId },
          body: JSON.stringify(payload),
        }),
      {
        accountId,
        slotId: payload.slotId,
        request: payload.request,
        status: "CONFIRMED",
        rejectionReason: null,
        reservedPeople: payload.totalVisitors,
        visible: true,
      },
    );
  },

  async getMyReservations(accountId: string) {
    return withMockFallback(
      () => apiRequest<ReservationResponse[]>("/api/v1/reservation/me/all", { query: { accountId } }),
      mockReservations,
    );
  },

  async getReservationByDate(query: ReservationLookupQuery) {
    return withMockFallback(
      () => apiRequest<ReservationResponse>("/api/v1/reservation/me", { query: { accountId: query.accountId, date: query.date, time: query.time } }),
      mockReservations[0],
    );
  },

  async modifyReservation(historyId: string, accountId: string, payload: ReservationRequest) {
    return withMockFallback(
      () =>
        apiRequest<ReservationResponse>(`/api/v1/reservation/${historyId}`, {
          method: "PATCH",
          query: { accountId },
          body: JSON.stringify(payload),
        }),
      { accountId, slotId: payload.slotId, request: payload.request, status: "CONFIRMED", rejectionReason: null, reservedPeople: payload.totalVisitors, visible: true },
    );
  },

  async cancelReservation(historyId: string, slotId: string, accountId: string) {
    return withMockFallback(
      () => apiRequest<void>(`/api/v1/reservation/${historyId}`, { method: "DELETE", query: { slotId, accountId } }),
      undefined,
    );
  },

  async createWaiting(accountId: string, headCount: number) {
    return withMockFallback(
      async () => {
        await apiRequest<void>("/api/v1/waiting", {
          method: "POST",
          query: { accountId },
          body: JSON.stringify({ headCount }),
        });

        for (let attempt = 0; attempt < 10; attempt += 1) {
          const queues = await this.getWaitingQueues();
          const current = queues.find((queue) => queue.accountId === accountId && queue.waitingStatus === "WAITING");
          if (current) return current;
          await sleep(250);
        }

        return { ...mockWaiting, accountId, headCount };
      },
      { ...mockWaiting, accountId, headCount },
    );
  },

  async getWaitingPosition(accountId: string) {
    return withMockFallback(
      () => apiRequest<WaitingPositionResponse>("/api/v1/waiting/position", { query: { accountId } }),
      mockWaitingPosition,
    );
  },

  async cancelWaiting(accountId: string) {
    return withMockFallback(
      () =>
        apiRequest<WaitingResponse>("/api/v1/waiting/cancel", {
          method: "POST",
          query: { accountId },
        }),
      { ...mockWaiting, accountId, waitingStatus: "CANCEL" },
    );
  },

  async delayWaiting(accountId: string) {
    return withMockFallback(
      () => apiRequest<void>("/api/v1/waiting/delay", { method: "POST", query: { accountId } }),
      undefined,
    );
  },

  async getWaitingQueues() {
    return withMockFallback(() => apiRequest<WaitingQueueResponse[]>("/api/v1/waitings/queue"), mockWaitingQueues);
  },

  async getWaitingQueueDetails() {
    return withMockFallback(() => apiRequest<WaitingQueueResponse[]>("/api/v1/waiting/get/waiting-queues"), mockWaitingQueues);
  },

  async getWaitingHistories() {
    return withMockFallback(() => apiRequest<WaitingHistoryResponse[]>("/api/v1/waiting/get/waiting-histories"), mockWaitingQueues);
  },

  async callWaiting() {
    return withMockFallback(
      () => apiRequest<WaitingResponse>("/api/v1/waiting/call", { method: "POST" }),
      { ...mockWaiting, waitingStatus: "SUCCESS" },
    );
  },

  async updateWaitingSetting(restaurantId: string, category: WaitingSetCategory) {
    const endpoint = category === "OPEN" ? "open" : category === "PAUSE" ? "pause" : "close";
    return withMockFallback(
      () =>
        apiRequest<WaitingSettingResponse>(`/api/v1/waitings/${endpoint}`, {
          method: "POST",
          body: JSON.stringify({ restaurantId, category }),
        }),
      { ...mockWaitingSetting, restaurantId, category: category === "OPEN" ? "열림" : category === "PAUSE" ? "중단" : "종료" },
    );
  },

  async openSlots(restaurantId: string, payload: OpenSlotsCommandRequest) {
    return withMockFallback(
      async () => {
        const response = await apiRequest<ApiEnvelope<ReservationPlan[]>>(
          `/api/v1/reservations/restaurants/${restaurantId}/slots/open`,
          { method: "POST", body: JSON.stringify(payload) },
        );
        return response.data;
      },
      mockPlans,
    );
  },

  async updateSlots(payload: ReservationSlotUpdateRequest[]) {
    return withMockFallback(
      async () => {
        const response = await apiRequest<ApiEnvelope<unknown[]>>("/api/v1/restaurants/restaurants/slots", {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        return response.data;
      },
      [],
    );
  },

  async changeSlotStatus(slotId: string, slotStatus: SlotStatus) {
    return withMockFallback(
      async () => {
        const response = await apiRequest<ApiEnvelope<string[]>>(`/api/v1/reservations/restaurants/slots/${slotId}/status`, {
          method: "PUT",
          body: JSON.stringify({ slotStatus }),
        });
        return response.data;
      },
      [slotId],
    );
  },
};
