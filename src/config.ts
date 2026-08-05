export const apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL ?? "";

export function socialLoginUrl(provider: "google" | "kakao"): string {
  return `${apiBaseUrl}/oauth2/authorization/${provider}`;
}
