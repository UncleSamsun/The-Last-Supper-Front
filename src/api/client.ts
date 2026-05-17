const ACCESS_TOKEN_KEY = "last-supper-access-token";

export const getApiBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export const hasApiBaseUrl = () => getApiBaseUrl().length > 0;

export const tokenStore = {
  get: () => window.localStorage.getItem(ACCESS_TOKEN_KEY),
  set: (token: string) => window.localStorage.setItem(ACCESS_TOKEN_KEY, token),
  clear: () => window.localStorage.removeItem(ACCESS_TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly detail?: unknown,
  ) {
    super(message);
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new ApiError("VITE_API_BASE_URL is not configured.");
  }

  const query = new URLSearchParams();
  Object.entries(options.query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });

  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined;
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = tokenStore.get();
  if (options.auth !== false && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path}${query.size ? `?${query}` : ""}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const rawPayload = await response.text();
  const payload = contentType.includes("application/json") && rawPayload ? JSON.parse(rawPayload) : rawPayload;

  if (!response.ok) {
    if (response.status === 401) {
      tokenStore.clear();
    }
    throw new ApiError(`API request failed with status ${response.status}`, response.status, payload);
  }

  return payload as T;
}
