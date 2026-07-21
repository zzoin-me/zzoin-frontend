import { apiFetch } from "@/api/client";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface EmailVerifyResponse {
  token: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(data: {
  nickName: string;
  email: string;
  password: string;
  signupToken: string;
}): Promise<void> {
  await apiFetch<void>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function sendSignupEmail(email: string): Promise<void> {
  await apiFetch<void>("/api/auth/signup/email/send", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifySignupEmail(
  verifyEmail: string,
  code: string,
): Promise<EmailVerifyResponse> {
  return apiFetch<EmailVerifyResponse>("/api/auth/signup/email/verify", {
    method: "POST",
    body: JSON.stringify({ verifyEmail, code }),
  });
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/api/auth/logout", {
    method: "POST",
  });
}

export async function refreshTokens(refreshTokenValue: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/refreshToken", {
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });
}
