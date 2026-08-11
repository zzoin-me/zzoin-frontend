import { apiBaseUrl } from "@/config";

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  result: T;
}

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refreshToken");
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

let tokenRefreshPromise: Promise<boolean> | null = null;

async function performTokenRefresh(): Promise<boolean> {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) return false;

  try {
    const res = await fetch(`${apiBaseUrl}/api/auth/refreshToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });
    const data: ApiResponse<{ accessToken: string; refreshToken: string }> = await res.json();
    if (data.success && data.result) {
      setTokens(data.result.accessToken, data.result.refreshToken);
      return true;
    }
  } catch {
    // refresh 실패
  }
  clearTokens();
  return false;
}

export function refreshStoredTokens(): Promise<boolean> {
  if (!tokenRefreshPromise) {
    tokenRefreshPromise = performTokenRefresh().finally(() => {
      tokenRefreshPromise = null;
    });
  }
  return tokenRefreshPromise;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const contentTypeHeaders: Record<string, string> = isFormData
    ? {}
    : { "Content-Type": "application/json" };
  const headers: Record<string, string> = {
    ...contentTypeHeaders,
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string>),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), isFormData ? 120_000 : 15_000);

  let res: Response;
  try {
    res = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers,
      signal: options.signal ?? controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  const data: ApiResponse<T> = await res.json();

  if (!data.success) {
    const isRetry = (options.headers as Record<string, string> | undefined)?.[RETRY_HEADER];
    if (res.status === 401 && !isRetry) {
      const refreshed = await refreshStoredTokens();
      if (refreshed) {
        return apiFetch<T>(path, {
          ...options,
          headers: { ...(options.headers as Record<string, string>), [RETRY_HEADER]: "1" },
        });
      }
    }
    throw new ApiError(data.code, data.message);
  }

  return data.result;
}

const RETRY_HEADER = "x-retry";
