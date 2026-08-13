import { apiFetch } from "@/api/client";

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  recoveryRequired?: false;
}

export interface RecoveryResponse {
  recoveryRequired: true;
  recoveryToken: string;
  recoverableUntil: string;
}

export type LoginResponse = TokenResponse | RecoveryResponse;

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

export async function refreshTokens(refreshTokenValue: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/api/auth/refreshToken", {
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });
}

export async function sendUnivEmail(email: string): Promise<void> {
  await apiFetch<void>("/api/auth/email/send", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyUnivEmail(verifyEmail: string, code: string): Promise<void> {
  await apiFetch<void>("/api/auth/email/verify", {
    method: "POST",
    body: JSON.stringify({ verifyEmail, code }),
  });
}

export async function sendWithdrawEmail(): Promise<void> {
  await apiFetch<void>("/api/auth/withdraw", {
    method: "POST",
  });
}

export async function withdraw(code: string): Promise<void> {
  await apiFetch<void>("/api/auth/withdraw", {
    method: "DELETE",
    body: JSON.stringify({ code }),
  });
}

export async function linkAccount(data: {
  tempToken: string;
  password: string;
  provider: string;
  providerId: string;
}): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/api/auth/link-account", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function completeSocialSignup(data: {
  signupToken: string;
  nickName: string;
}): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/api/auth/social-signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function recoverAccount(recoveryToken?: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/api/auth/recover", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(recoveryToken ? { recoveryToken } : {}),
  });
}

export async function unlinkSocial(password: string): Promise<void> {
  await apiFetch<void>("/api/auth/social-link", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}
