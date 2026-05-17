import { FormEvent, useEffect, useMemo, useState } from "react";
import { ApiError, getApiBaseUrl, hasApiBaseUrl, tokenStore } from "./api/client";
import { lastSupperApi } from "./api/theLastSupperApi";
import type {
  AccountResponse,
  DayOfWeek,
  ReservationPlan,
  ReservationResponse,
  ReservationSlot,
  RestaurantResponse,
  SlotStatus,
  WaitingQueueResponse,
  WaitingSetCategory,
} from "./api/types";

type Page = "session" | "reservations" | "waitlist" | "owner" | "lab";
type AuthMode = "login" | "signup";
type TestStatus = "idle" | "pass" | "fail" | "skip";

interface TestResult {
  name: string;
  method: string;
  path: string;
  status: TestStatus;
  message: string;
}

const nav: Array<{ id: Page; label: string; description: string }> = [
  { id: "session", label: "세션", description: "로그인, 회원가입, 계정" },
  { id: "reservations", label: "예약", description: "슬롯 조회와 예약" },
  { id: "waitlist", label: "웨이팅", description: "대기 등록과 호출" },
  { id: "owner", label: "점주 운영", description: "매장, 슬롯, 상태" },
  { id: "lab", label: "API 테스트", description: "전체 엔드포인트 점검" },
];

const demoAccountIds: Record<string, string> = {
  "haeun.kim@lumenmail.kr": "guest-kim-haeun",
  "minseo.lee@lumenmail.kr": "guest-lee-minseo",
  "jiho.park@lumenmail.kr": "guest-park-jiho",
  "seoyeon.choi@lumenmail.kr": "guest-choi-seoyeon",
  "hyunwoo.jung@lumenmail.kr": "guest-jung-hyunwoo",
  "seojin.yoon@lastsupper.kr": "owner-yoon-seojin",
};

const dayLabel: Record<DayOfWeek, string> = {
  MONDAY: "월",
  TUESDAY: "화",
  WEDNESDAY: "수",
  THURSDAY: "목",
  FRIDAY: "금",
  SATURDAY: "토",
  SUNDAY: "일",
};

const badgeTone: Record<string, string> = {
  OPEN: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  HOLD: "bg-amber-50 text-amber-700 ring-amber-200",
  BLOCK: "bg-stone-100 text-stone-600 ring-stone-200",
  WAITING: "bg-blue-50 text-blue-700 ring-blue-200",
  DELAY: "bg-rose-50 text-rose-700 ring-rose-200",
  SUCCESS: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCEL: "bg-stone-100 text-stone-600 ring-stone-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELED: "bg-stone-100 text-stone-600 ring-stone-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
  pass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  fail: "bg-rose-50 text-rose-700 ring-rose-200",
  skip: "bg-amber-50 text-amber-700 ring-amber-200",
  idle: "bg-stone-100 text-stone-500 ring-stone-200",
};

const initialTests: TestResult[] = [
  ["회원가입", "POST", "/api/v1/signup"],
  ["로그인", "POST", "/api/v1/login"],
  ["비밀번호 변경", "PATCH", "/api/v1/customers"],
  ["내 계정 조회", "GET", "/api/v1/customers"],
  ["내 계정 수정", "PUT", "/api/v1/customers"],
  ["매장 조회", "GET", "/api/v1/restaurants/{id}"],
  ["임시 매장 생성", "POST", "/api/v1/restaurants"],
  ["슬롯 오픈", "POST", "/api/v1/reservations/restaurants/{id}/slots/open"],
  ["예약 플랜 조회", "GET", "/api/v1/reservations/restaurants/{id}/plans"],
  ["예약 생성", "POST", "/api/v1/reservation"],
  ["내 예약 전체 조회", "GET", "/api/v1/reservation/me/all"],
  ["내 예약 단건 조회", "GET", "/api/v1/reservation/me"],
  ["예약 수정", "PATCH", "/api/v1/reservation/{historyId}"],
  ["예약 취소", "DELETE", "/api/v1/reservation/{historyId}"],
  ["웨이팅 등록", "POST", "/api/v1/waiting"],
  ["웨이팅 위치 조회", "GET", "/api/v1/waiting/position"],
  ["웨이팅 지연", "POST", "/api/v1/waiting/delay"],
  ["웨이팅 취소", "POST", "/api/v1/waiting/cancel"],
  ["웨이팅 큐 조회", "GET", "/api/v1/waitings/queue"],
  ["웨이팅 상세 조회", "GET", "/api/v1/waiting/get/waiting-queues"],
  ["웨이팅 히스토리", "GET", "/api/v1/waiting/get/waiting-histories"],
  ["다음 고객 호출", "POST", "/api/v1/waiting/call"],
  ["웨이팅 OPEN", "POST", "/api/v1/waitings/open"],
  ["웨이팅 PAUSE", "POST", "/api/v1/waitings/pause"],
  ["웨이팅 CLOSE", "POST", "/api/v1/waitings/close"],
  ["슬롯 상태 변경", "PUT", "/api/v1/reservations/restaurants/slots/{slotId}/status"],
  ["슬롯 일괄 수정", "PATCH", "/api/v1/restaurants/restaurants/slots"],
].map(([name, method, path]) => ({ name, method, path, status: "idle" as const, message: "대기" }));

function today(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function routeToPage(): Page {
  const route = window.location.pathname.slice(1);
  return nav.some((item) => item.id === route) ? (route as Page) : "session";
}

function isFutureSlot(slot: Pick<ReservationSlot, "date" | "startTime">) {
  return slot.date > today(0);
}

function Badge({ value }: { value: string }) {
  return <span className={`inline-flex h-7 items-center rounded-full px-2.5 text-xs font-bold ring-1 ${badgeTone[value] ?? "bg-white text-stone-600 ring-stone-200"}`}>{value}</span>;
}

function Button({
  children,
  onClick,
  type = "button",
  variant = "dark",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "dark" | "light" | "danger" | "green";
  disabled?: boolean;
}) {
  const variants = {
    dark: "bg-stone-950 text-white hover:bg-stone-800",
    light: "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50",
    danger: "bg-[#b94d3f] text-white hover:bg-[#a44337]",
    green: "bg-[#365443] text-white hover:bg-[#2d4638]",
  };
  return (
    <button className={`h-10 rounded-md px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  name,
  type = "text",
  min,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  name?: string;
  type?: string;
  min?: number;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
      {label}
      <input className="h-10 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-950 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200" min={min} name={name ?? label} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (value: T) => void }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
      {label}
      <select className="h-10 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-950 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200" value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      {eyebrow ? <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">{eyebrow}</p> : null}
      <h2 className="mb-4 text-lg font-bold text-stone-950">{title}</h2>
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-500">{text}</div>;
}

export default function App() {
  const [page, setPage] = useState<Page>(routeToPage);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [loginEmail, setLoginEmail] = useState("haeun.kim@lumenmail.kr");
  const [loginPassword, setLoginPassword] = useState("Password1!");
  const [signupEmail, setSignupEmail] = useState(`daon${Date.now().toString().slice(-5)}@lumenmail.kr`);
  const [signupPhone, setSignupPhone] = useState("010-9000-2026");
  const [signupNickName, setSignupNickName] = useState("정다온");
  const [signupPassword, setSignupPassword] = useState("Password1!");
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const [accountId, setAccountId] = useState("guest-kim-haeun");
  const [restaurantId, setRestaurantId] = useState("restaurant-supper-seongsu");
  const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
  const [plans, setPlans] = useState<ReservationPlan[]>([]);
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [waitingQueues, setWaitingQueues] = useState<WaitingQueueResponse[]>([]);
  const [waitingPosition, setWaitingPosition] = useState<number | null>(null);
  const [headCount, setHeadCount] = useState(2);
  const [slotStatus, setSlotStatus] = useState<SlotStatus>("HOLD");
  const [tests, setTests] = useState<TestResult[]>(initialTests);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("세션을 준비해 주세요.");
  const [error, setError] = useState<string | null>(null);

  const slots = useMemo(() => plans.flatMap((plan) => plan.slots.map((slot) => ({ ...slot, weekday: plan.weekday }))), [plans]);
  const openSlots = slots.filter((slot) => slot.status === "OPEN");
  const bookableSlots = openSlots.filter(isFutureSlot);
  const selectedSlot = bookableSlots[0] ?? openSlots[0] ?? slots[0];
  const waitingCount = waitingQueues.filter((queue) => queue.waitingStatus === "WAITING").length;
  const accountIdMismatch = !!loggedInEmail && demoAccountIds[loggedInEmail] && demoAccountIds[loggedInEmail] !== accountId;
  const canUseAccountScopedApi = !!accountId && !accountIdMismatch;

  function navigate(next: Page) {
    setPage(next);
    window.history.pushState({}, "", `/${next}`);
  }

  function explain(errorValue: unknown) {
    if (errorValue instanceof ApiError) {
      return `HTTP ${errorValue.status ?? "?"}: ${JSON.stringify(errorValue.detail ?? errorValue.message).slice(0, 220)}`;
    }
    return errorValue instanceof Error ? errorValue.message : String(errorValue);
  }

  function requireSession() {
    if (!hasApiBaseUrl()) return true;
    if (!tokenStore.get()) {
      setError("로그인이 필요합니다.");
      navigate("session");
      return false;
    }
    return true;
  }

  function requireAccountId() {
    if (!accountId) {
      setError("이 API는 백엔드가 accountId 쿼리 파라미터를 요구합니다. accountId를 입력하세요.");
      return false;
    }
    if (accountIdMismatch) {
      setError(`현재 로그인(${loggedInEmail})과 accountId(${accountId})가 맞지 않습니다. 시드 계정은 ${demoAccountIds[loggedInEmail]}를 사용해야 합니다.`);
      return false;
    }
    return true;
  }

  async function runAction<T>(label: string, action: () => Promise<T>, after?: (result: T) => void | Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      const result = await action();
      await after?.(result);
      setMessage(`${label} 완료`);
      return result;
    } catch (caught) {
      const detail = explain(caught);
      setError(detail);
      setMessage(`${label} 실패`);
      throw caught;
    } finally {
      setBusy(false);
    }
  }

  async function refreshDashboard(context?: { accountId?: string; restaurantId?: string }) {
    if (!requireSession()) return;
    const nextAccountId = context?.accountId ?? accountId;
    const nextRestaurantId = context?.restaurantId ?? restaurantId;
    await runAction("대시보드 동기화", async () => {
      const [accountData, restaurantData, planData, reservationData, queueData, positionData] = await Promise.all([
        lastSupperApi.getAccount(),
        lastSupperApi.getRestaurant(nextRestaurantId),
        lastSupperApi.getReservationPlans(nextRestaurantId, today(0), today(14)),
        nextAccountId ? lastSupperApi.getMyReservations(nextAccountId) : Promise.resolve([]),
        lastSupperApi.getWaitingQueues(),
        nextAccountId ? lastSupperApi.getWaitingPosition(nextAccountId).catch(() => ({ position: 0 })) : Promise.resolve({ position: 0 }),
      ]);
      return { accountData, restaurantData, planData, reservationData, queueData, positionData };
    }, ({ accountData, restaurantData, planData, reservationData, queueData, positionData }) => {
      setAccount(accountData);
      setRestaurant(restaurantData);
      setPlans(planData);
      setReservations(reservationData);
      setWaitingQueues(queueData);
      setWaitingPosition(positionData.position);
    }).catch(() => undefined);
  }

  useEffect(() => {
    const onPopState = () => setPage(routeToPage());
    window.addEventListener("popstate", onPopState);
    if (tokenStore.get()) void refreshDashboard();
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction("로그인", () => lastSupperApi.login({ email: loginEmail, password: loginPassword }), async () => {
      const nextAccountId = demoAccountIds[loginEmail] ?? "";
      setLoggedInEmail(loginEmail);
      setAccountId(nextAccountId);
      setMessage(demoAccountIds[loginEmail] ? "로그인 완료. 시드 accountId를 자동으로 맞췄습니다." : "로그인 완료. 이 계정은 백엔드에서 id 조회 API가 없어 accountId를 직접 입력해야 합니다.");
      await refreshDashboard({ accountId: nextAccountId });
      navigate("reservations");
    }).catch(() => undefined);
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction("회원가입", () => lastSupperApi.signup({ email: signupEmail, phone: signupPhone, nickName: signupNickName, password: signupPassword }), () => {
      setLoginEmail(signupEmail);
      setLoginPassword(signupPassword);
      setAuthMode("login");
      setAccountId("");
      setMessage("회원가입 완료. 로그인 후 accountId는 백엔드 조회 API가 없어 직접 입력해야 합니다.");
    }).catch(() => undefined);
  }

  async function handleWaiting() {
    if (!requireSession() || !requireAccountId()) return;
    await runAction("웨이팅 등록", () => lastSupperApi.createWaiting(accountId, headCount), async () => {
      const [queues, position] = await Promise.all([lastSupperApi.getWaitingQueues(), lastSupperApi.getWaitingPosition(accountId).catch(() => ({ position: 0 }))]);
      setWaitingQueues(queues);
      setWaitingPosition(position.position);
    }).catch(() => undefined);
  }

  async function handleReservation(slot?: ReservationSlot) {
    if (!requireSession() || !requireAccountId()) return;
    const targetSlot = slot ?? selectedSlot;
    if (!targetSlot || targetSlot.status !== "OPEN" || !isFutureSlot(targetSlot)) {
      setError("예약 가능한 미래 OPEN 슬롯이 없습니다.");
      return;
    }
    await runAction("예약 생성", () => lastSupperApi.createReservation(accountId, {
      slotId: targetSlot.slotId,
      representativeName: account?.nickName ?? "예약자",
      representativePhone: account?.phone ?? "010-0000-0000",
      isProxyAttendee: false,
      totalVisitors: headCount,
      request: "조용한 좌석 요청",
    }), () => refreshDashboard()).catch(() => undefined);
  }

  async function handleCancelWaiting() {
    if (!requireSession() || !requireAccountId()) return;
    await runAction("웨이팅 취소", () => lastSupperApi.cancelWaiting(accountId), () => refreshDashboard()).catch(() => undefined);
  }

  async function handleDelayWaiting() {
    if (!requireSession() || !requireAccountId()) return;
    await runAction("웨이팅 미루기", () => lastSupperApi.delayWaiting(accountId), () => refreshDashboard()).catch(() => undefined);
  }

  async function handleSetting(category: WaitingSetCategory) {
    if (!requireSession()) return;
    await runAction(`웨이팅 ${category}`, () => lastSupperApi.updateWaitingSetting(restaurantId, category)).catch(() => undefined);
  }

  async function runApiTests() {
    if (!requireSession()) return;
    setTests(initialTests);
    const unique = Date.now().toString().slice(-6);
    const openSlotStartOffset = 40 + Number(unique.slice(-2));
    const signupEmailForTest = `ian${unique}@lumenmail.kr`;
    const reservationAccountId = "guest-chae-rina";
    const waitingAccountId = "guest-kang-doyun";
    const waitingDelayAccountId = "guest-choi-seoyeon";
    const waitingCancelAccountId = "guest-park-jiho";
    const modifyHistoryId = "reservation-supper-008";
    const cancelHistoryId = "reservation-supper-007";
    let apiReservationSlot: ReservationSlot | null = null;
    const futureReservedSlotId = "supper-slot-20260521-1900";
    const cancelSlotId = "supper-slot-20260520-1700";
    const ownerSlotId = "supper-slot-20260520-1700";
    const update = async (name: string, status: TestStatus, messageText: string) => {
      setTests((prev) => prev.map((item) => item.name === name ? { ...item, status, message: messageText } : item));
      await new Promise((resolve) => window.setTimeout(resolve, 80));
    };
    const hasErrorText = (caught: unknown, patterns: string[]) => {
      const text = explain(caught);
      return patterns.some((pattern) => text.includes(pattern));
    };
    const test = async (name: string, fn: () => Promise<unknown>, options?: { skipWhen?: (caught: unknown) => string | false }) => {
      try {
        await fn();
        await update(name, "pass", "성공");
      } catch (caught) {
        const skipMessage = options?.skipWhen?.(caught);
        if (skipMessage) {
          await update(name, "skip", skipMessage);
          return;
        }
        await update(name, "fail", explain(caught));
      }
    };

    await test("회원가입", () => lastSupperApi.signup({ email: signupEmailForTest, phone: "010-7777-2026", nickName: "문이안", password: "Password1!" }));
    await test("비밀번호 변경", async () => {
      await lastSupperApi.login({ email: signupEmailForTest, password: "Password1!" });
      await lastSupperApi.updatePassword({ curPassword: "Password1!", newPassword: "Password2!" });
      return lastSupperApi.login({ email: "haeun.kim@lumenmail.kr", password: "Password1!" });
    });
    await test("로그인", () => lastSupperApi.login({ email: "haeun.kim@lumenmail.kr", password: "Password1!" }));
    await test("내 계정 조회", () => lastSupperApi.getAccount());
    await test("내 계정 수정", () => lastSupperApi.updateAccount({ phone: "010-4821-7305", nickName: "김하은" }));
    await test("매장 조회", () => lastSupperApi.getRestaurant(restaurantId));
    await test("임시 매장 생성", () => lastSupperApi.createTempRestaurant());
    await test("슬롯 오픈", async () => {
      const openedPlans = await lastSupperApi.openSlots(restaurantId, {
      ownerId: "owner-yoon-seojin",
      startDate: today(openSlotStartOffset),
      endDate: today(openSlotStartOffset + 1),
      isExceptionDateEnabled: false,
      exceptionDates: [],
      dayOfWeekBased: false,
      repeatDays: ["MONDAY"],
      openTime: "17:00:00",
      closeTime: "21:00:00",
      breakTimes: [{ start: "19:00:00", end: "19:30:00" }],
      slotDuration: 60,
      capacity: 4,
      });
      apiReservationSlot = openedPlans.flatMap((plan) => plan.slots).find((slot) => slot.status === "OPEN") ?? null;
      if (!apiReservationSlot) throw new Error("오픈된 예약 테스트 슬롯을 찾지 못했습니다.");
    }, {
      skipWhen: (caught) => hasErrorText(caught, ["DUPLICATE_SLOT_EXISTS", "이미 존재합니다"]) ? "이미 같은 테스트 슬롯이 있습니다. 다른 시각에 다시 실행하거나 DB seed 후 전체 검증하세요." : false,
    });
    await test("예약 플랜 조회", () => lastSupperApi.getReservationPlans(restaurantId, today(0), today(14)));
    await test("예약 생성", () => {
      if (!apiReservationSlot) throw new Error("예약 생성용 동적 슬롯이 없습니다.");
      return lastSupperApi.createReservation(reservationAccountId, { slotId: apiReservationSlot.slotId, representativeName: "채리나", representativePhone: "010-8888-2026", isProxyAttendee: false, totalVisitors: 1, request: "늦은 생일 식사라 조용한 좌석을 부탁드립니다." });
    }, {
      skipWhen: (caught) => hasErrorText(caught, ["동적 슬롯이 없습니다", "RESERVATION_DUPLICATE_RESERVATION", "이미 예약이 존재합니다"]) ? "예약 생성용 슬롯이 없거나 이미 예약된 상태입니다. seed 후 전체 검증하면 생성까지 재확인됩니다." : false,
    });
    await test("내 예약 전체 조회", () => lastSupperApi.getMyReservations(reservationAccountId));
    await test("내 예약 단건 조회", () => {
      if (!apiReservationSlot) throw new Error("단건 조회용 동적 슬롯이 없습니다.");
      return lastSupperApi.getReservationByDate({ accountId: reservationAccountId, date: apiReservationSlot.date, time: apiReservationSlot.startTime });
    }, {
      skipWhen: (caught) => hasErrorText(caught, ["동적 슬롯이 없습니다", "RESERVATION_NOT_FOUND", "예약을 찾을 수 없습니다"]) ? "생성 테스트가 건너뛰어 단건 조회 대상이 없습니다." : false,
    });
    await test("예약 수정", () => lastSupperApi.modifyReservation(modifyHistoryId, "guest-seo-nari", { slotId: futureReservedSlotId, representativeName: "서나리", representativePhone: "010-8777-2643", isProxyAttendee: false, totalVisitors: 4, request: "와인 페어링은 2인만 추가하고 싶습니다." }), {
      skipWhen: (caught) => hasErrorText(caught, ["RESERVATION_NOT_FOUND", "RESERVATION_ACCOUNT_NOT_FOUND", "예약을 찾을 수 없습니다"]) ? "수정 대상 seed 예약이 이미 처리됐습니다. seed 후 재검증하세요." : false,
    });
    await test("예약 취소", () => lastSupperApi.cancelReservation(cancelHistoryId, cancelSlotId, "guest-oh-yujun"), {
      skipWhen: (caught) => hasErrorText(caught, ["RESERVATION_NOT_FOUND", "이미 취소", "예약을 찾을 수 없습니다"]) ? "취소 대상 seed 예약이 이미 처리됐습니다. seed 후 재검증하세요." : false,
    });
    await test("웨이팅 등록", async () => {
      await lastSupperApi.updateWaitingSetting(restaurantId, "OPEN").catch(() => undefined);
      await lastSupperApi.cancelWaiting(waitingAccountId).catch(() => undefined);
      return lastSupperApi.createWaiting(waitingAccountId, 2);
    }, {
      skipWhen: (caught) => hasErrorText(caught, ["ALREADY_WAITING", "이미 웨이팅"]) ? "이미 웨이팅 중인 테스트 계정입니다. 취소 후 다시 실행하세요." : false,
    });
    await test("웨이팅 위치 조회", () => lastSupperApi.getWaitingPosition(waitingAccountId), {
      skipWhen: (caught) => hasErrorText(caught, ["WAITING_NOT_FOUND", "웨이팅을 찾을 수 없습니다"]) ? "현재 웨이팅이 없어 위치 조회 대상이 없습니다." : false,
    });
    await test("웨이팅 지연", async () => {
      await lastSupperApi.updateWaitingSetting(restaurantId, "OPEN").catch(() => undefined);
      await lastSupperApi.cancelWaiting(waitingDelayAccountId).catch(() => undefined);
      await lastSupperApi.createWaiting(waitingDelayAccountId, 2);
      return lastSupperApi.delayWaiting(waitingDelayAccountId);
    }, {
      skipWhen: (caught) => hasErrorText(caught, ["WAITING_NOT_FOUND", "웨이팅을 찾을 수 없습니다", "ALREADY_LAST_WAITING", "이전 웨이팅이 없습니다"]) ? "지연 가능한 앞 대기팀이 없어 이 케이스는 건너뜁니다." : false,
    });
    await test("웨이팅 취소", async () => {
      await lastSupperApi.updateWaitingSetting(restaurantId, "OPEN").catch(() => undefined);
      await lastSupperApi.cancelWaiting(waitingCancelAccountId).catch(() => undefined);
      await lastSupperApi.createWaiting(waitingCancelAccountId, 2);
      return lastSupperApi.cancelWaiting(waitingCancelAccountId);
    }, {
      skipWhen: (caught) => hasErrorText(caught, ["WAITING_NOT_FOUND", "웨이팅을 찾을 수 없습니다"]) ? "취소할 웨이팅 대상이 없습니다. seed 후 재검증하세요." : false,
    });
    await test("웨이팅 큐 조회", () => lastSupperApi.getWaitingQueues());
    await test("웨이팅 상세 조회", () => lastSupperApi.getWaitingQueueDetails());
    await test("웨이팅 히스토리", () => lastSupperApi.getWaitingHistories());
    await test("다음 고객 호출", () => lastSupperApi.callWaiting());
    await test("웨이팅 OPEN", async () => {
      await lastSupperApi.updateWaitingSetting(restaurantId, "PAUSE").catch(() => undefined);
      return lastSupperApi.updateWaitingSetting(restaurantId, "OPEN");
    });
    await test("웨이팅 PAUSE", () => lastSupperApi.updateWaitingSetting(restaurantId, "PAUSE"));
    await test("웨이팅 CLOSE", () => lastSupperApi.updateWaitingSetting(restaurantId, "CLOSE"));
    await test("슬롯 상태 변경", () => lastSupperApi.changeSlotStatus(ownerSlotId, slotStatus));
    await test("슬롯 일괄 수정", () => lastSupperApi.updateSlots([{ slotId: ownerSlotId, capacityTotal: 8, status: "OPEN" }]));
    await refreshDashboard();
  }

  return (
    <main className="min-h-screen bg-[#f5f4f0] text-stone-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-stone-200 bg-[#101714] p-5 text-white lg:block">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d0a85a]">The Last Supper</p>
        <h1 className="mt-3 text-2xl font-bold leading-tight">예약·웨이팅 테스트 콘솔</h1>
        <div className="mt-6 grid gap-1">
          {nav.map((item) => (
            <button key={item.id} className={`rounded-md px-4 py-3 text-left ${page === item.id ? "bg-white text-stone-950" : "text-white/70 hover:bg-white/10 hover:text-white"}`} onClick={() => navigate(item.id)}>
              <span className="block text-sm font-bold">{item.label}</span>
              <span className="text-xs opacity-70">{item.description}</span>
            </button>
          ))}
        </div>
        <div className="mt-6 rounded-md border border-white/10 bg-white/5 p-3 text-xs leading-5 text-white/70">
          <b className="text-white">주의</b><br />
          백엔드 일부 API는 JWT 대신 accountId 쿼리를 요구합니다. 로그인 계정과 accountId가 다르면 프론트가 요청을 막습니다.
        </div>
      </aside>

      <section className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-stone-500">{restaurant?.restaurantName ?? "라스트 서퍼 성수"}</p>
              <h2 className="text-2xl font-bold">{nav.find((item) => item.id === page)?.label}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge value={hasApiBaseUrl() ? `API ${getApiBaseUrl()}` : "Mock"} />
              <Button onClick={refreshDashboard} variant="light" disabled={busy}>{busy ? "요청 중" : "동기화"}</Button>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
            {nav.map((item) => <Button key={item.id} variant={page === item.id ? "dark" : "light"} onClick={() => navigate(item.id)}>{item.label}</Button>)}
          </nav>
        </header>

        <div className="grid gap-4 px-4 py-5 lg:px-8">
          <div className="grid gap-3 md:grid-cols-4">
            <Panel title="오픈 슬롯"><b className="text-3xl">{openSlots.length}</b></Panel>
            <Panel title="대기팀"><b className="text-3xl">{waitingCount}</b></Panel>
            <Panel title="내 앞 대기"><b className="text-3xl">{waitingPosition ?? "-"}</b></Panel>
            <Panel title="내 예약"><b className="text-3xl">{reservations.length}</b></Panel>
          </div>

          {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{error}</div> : null}
          {accountIdMismatch ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">현재 로그인 이메일과 accountId가 맞지 않습니다. 이전 계정의 웨이팅/예약 요청을 막았습니다.</div> : null}

          {page === "session" ? (
            <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
              <Panel title={authMode === "login" ? "로그인" : "회원가입"} eyebrow="Session">
                <div className="mb-4 grid grid-cols-2 gap-2 rounded-md bg-stone-100 p-1">
                  <Button variant={authMode === "login" ? "dark" : "light"} onClick={() => setAuthMode("login")}>로그인</Button>
                  <Button variant={authMode === "signup" ? "dark" : "light"} onClick={() => setAuthMode("signup")}>회원가입</Button>
                </div>
                {authMode === "login" ? (
                  <form className="grid gap-3" onSubmit={handleLogin}>
                    <Field label="email" name="email" value={loginEmail} onChange={setLoginEmail} />
                    <Field label="password" name="password" type="password" value={loginPassword} onChange={setLoginPassword} />
                    <Button type="submit" disabled={busy}>로그인</Button>
                    <Button variant="light" onClick={() => { tokenStore.clear(); setAccount(null); setLoggedInEmail(""); setAccountId(""); setPlans([]); setReservations([]); setWaitingQueues([]); setWaitingPosition(null); setMessage("세션과 화면 상태를 초기화했습니다."); }}>로그아웃/상태 초기화</Button>
                  </form>
                ) : (
                  <form className="grid gap-3" onSubmit={handleSignup}>
                    <Field label="email" name="email" value={signupEmail} onChange={setSignupEmail} />
                    <Field label="phone" name="phone" value={signupPhone} onChange={setSignupPhone} />
                    <Field label="nickName" name="nickName" value={signupNickName} onChange={setSignupNickName} />
                    <Field label="password" name="password" type="password" value={signupPassword} onChange={setSignupPassword} />
                    <Button type="submit" variant="green" disabled={busy}>회원가입</Button>
                    <p className="rounded-md bg-stone-100 p-3 text-xs leading-5 text-stone-600">새 계정은 백엔드 응답에 accountId가 없어 예약/웨이팅 테스트 전 DB id를 직접 입력해야 합니다.</p>
                  </form>
                )}
              </Panel>
              <Panel title="연결 상태" eyebrow="Context">
                <div className="grid gap-3">
                  <p className="text-sm text-stone-600"><b className="text-stone-950">계정</b> {account ? `${account.nickName} · ${account.email}` : "로그인 필요"}</p>
                  <Field label="accountId" value={accountId} onChange={setAccountId} />
                  <Field label="restaurantId" value={restaurantId} onChange={setRestaurantId} />
                  <Button onClick={refreshDashboard} variant="light">현재 컨텍스트로 동기화</Button>
                </div>
              </Panel>
            </div>
          ) : null}

          {page === "reservations" ? (
            <div className="grid gap-4 xl:grid-cols-[1.4fr_.8fr]">
              <Panel title="예약 슬롯" eyebrow="Reservation book">
                <div className="grid gap-3 md:grid-cols-2">
                  {slots.length ? slots.map((slot) => (
                    <button key={slot.slotId} className="rounded-md border border-stone-200 bg-white p-4 text-left hover:border-stone-400 disabled:opacity-60" disabled={slot.status !== "OPEN" || !isFutureSlot(slot) || !canUseAccountScopedApi} onClick={() => handleReservation(slot)}>
                      <div className="flex items-center justify-between gap-3">
                        <div><p className="text-sm text-stone-500">{slot.date} ({dayLabel[slot.weekday]})</p><p className="text-2xl font-bold">{slot.startTime.slice(0, 5)}</p></div>
                        <Badge value={slot.status} />
                      </div>
                      <p className="mt-3 text-sm text-stone-500">잔여 {slot.remaining} / 전체 {slot.capacityTotal}</p>
                    </button>
                  )) : <EmptyState text="슬롯 데이터가 없습니다. 세션에서 로그인 후 동기화하세요." />}
                </div>
              </Panel>
              <Panel title="예약 액션" eyebrow="Guest">
                <div className="grid gap-3">
                  <Field label="예약 인원" type="number" min={1} value={headCount} onChange={(value) => setHeadCount(Number(value))} />
                  <Button disabled={!canUseAccountScopedApi || !bookableSlots.length} onClick={() => handleReservation()}>첫 예약 가능 슬롯 예약</Button>
                  <Button variant="light" onClick={() => accountId && lastSupperApi.getMyReservations(accountId).then(setReservations).catch((caught) => setError(explain(caught)))}>내 예약 다시 조회</Button>
                </div>
                <div className="mt-5 grid gap-2">
                  {reservations.map((reservation, index) => (
                    <div key={`${reservation.slotId}-${index}`} className="flex items-center justify-between rounded-md border border-stone-200 px-3 py-3 text-sm">
                      <span>{reservation.slotId} · {reservation.reservedPeople}명</span><Badge value={reservation.status} />
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          ) : null}

          {page === "waitlist" ? (
            <div className="grid gap-4 xl:grid-cols-[.8fr_1.4fr]">
              <Panel title="고객 웨이팅" eyebrow="Guest waitlist">
                <div className="grid gap-3">
                  <Field label="인원" type="number" min={1} value={headCount} onChange={(value) => setHeadCount(Number(value))} />
                  <Button variant="danger" disabled={!canUseAccountScopedApi} onClick={handleWaiting}>웨이팅 등록</Button>
                  <Button variant="light" disabled={!canUseAccountScopedApi} onClick={handleDelayWaiting}>내 웨이팅 미루기</Button>
                  <Button variant="light" disabled={!canUseAccountScopedApi} onClick={handleCancelWaiting}>내 웨이팅 취소</Button>
                </div>
              </Panel>
              <Panel title="서버 대기 큐" eyebrow="Live">
                <div className="grid gap-2">
                  {waitingQueues.length ? waitingQueues.map((queue) => (
                    <div key={queue.waitingQueueId} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded-md border border-stone-200 px-4 py-3">
                      <b>{queue.number}번</b><span className="text-sm text-stone-600">{queue.accountId} · {queue.headCount}명</span><Badge value={queue.waitingStatus} />
                    </div>
                  )) : <EmptyState text="대기 큐가 없습니다." />}
                </div>
              </Panel>
            </div>
          ) : null}

          {page === "owner" ? (
            <div className="grid gap-4 xl:grid-cols-3">
              <Panel title="웨이팅 상태" eyebrow="Owner">
                <div className="grid gap-2">
                  {(["OPEN", "PAUSE", "CLOSE"] as WaitingSetCategory[]).map((value) => <Button key={value} variant="light" onClick={() => handleSetting(value)}>{value}</Button>)}
                  <Button onClick={() => runAction("다음 고객 호출", () => lastSupperApi.callWaiting(), () => refreshDashboard()).catch(() => undefined)}>다음 고객 호출</Button>
                </div>
              </Panel>
              <Panel title="슬롯 상태" eyebrow="Owner">
                <div className="grid gap-3">
                  <SelectField label="변경 상태" value={slotStatus} options={["OPEN", "HOLD", "BLOCK"]} onChange={setSlotStatus} />
                  <Button variant="green" disabled={!selectedSlot} onClick={() => selectedSlot && runAction("슬롯 상태 변경", () => lastSupperApi.changeSlotStatus(selectedSlot.slotId, slotStatus), () => refreshDashboard()).catch(() => undefined)}>선택 슬롯 상태 변경</Button>
                  <Button variant="light" disabled={!selectedSlot} onClick={() => selectedSlot && runAction("슬롯 일괄 수정", () => lastSupperApi.updateSlots([{ slotId: selectedSlot.slotId, capacityTotal: Math.max(1, selectedSlot.capacityTotal), status: "OPEN" }]), () => refreshDashboard()).catch(() => undefined)}>선택 슬롯 OPEN 일괄수정</Button>
                </div>
              </Panel>
              <Panel title="매장 정보" eyebrow="Restaurant">
                <p className="mb-3 text-sm leading-6 text-stone-600">{restaurant?.restaurantLocation ?? "매장 정보 없음"}</p>
                <Button variant="light" onClick={() => restaurant && runAction("매장 정보 저장", () => lastSupperApi.updateRestaurant(restaurantId, restaurant)).catch(() => undefined)}>현재 매장 정보 저장 테스트</Button>
              </Panel>
            </div>
          ) : null}

          {page === "lab" ? (
            <Panel title="전체 API 테스트" eyebrow="Integration">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-stone-600">파괴적/중복 제약이 있는 API는 실패할 수 있습니다. 실패 메시지는 백엔드 실제 응답입니다.</p>
                <Button onClick={runApiTests} disabled={busy}>전체 테스트 실행</Button>
              </div>
              <div className="overflow-hidden rounded-md border border-stone-200">
                {tests.map((test) => (
                  <div key={test.name} className="grid grid-cols-[120px_1fr_90px] items-center gap-3 border-b border-stone-200 px-4 py-3 text-sm last:border-0 md:grid-cols-[180px_90px_1fr_90px]">
                    <b>{test.name}</b><span className="hidden text-stone-500 md:block">{test.method}</span><span className="truncate text-stone-500">{test.path}<br />{test.message}</span><Badge value={test.status} />
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}
        </div>

        <footer className="sticky bottom-0 border-t border-stone-200 bg-white/95 px-4 py-3 text-sm text-stone-700 backdrop-blur lg:px-8">{message}</footer>
      </section>
    </main>
  );
}
