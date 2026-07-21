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

async function refreshTokens(): Promise<boolean> {
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

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await res.json();

  if (!data.success) {
    if (res.status === 401) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        return apiFetch<T>(path, options);
      }
    }
    throw new ApiError(data.code, data.message);
  }

  return data.result;
}
