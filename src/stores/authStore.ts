import { create } from "zustand";
import type { User } from "@/types";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/api/client";
import * as authApi from "@/api/auth";
import { getMyProfile } from "@/api/user";

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  initialized: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupAndLogin: (data: {
    nickName: string;
    email: string;
    password: string;
    signupToken: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

function hasStoredTokens(): boolean {
  return !!getAccessToken() && !!getRefreshToken();
}

async function fetchProfileAndSet(): Promise<void> {
  const profile = await getMyProfile();
  useAuthStore.setState({
    isLoggedIn: true,
    user: {
      id: "",
      email: profile.email,
      nickname: profile.name,
      profileImage: profile.profileUrl,
      verified: profile.verified,
      verifiedEmail: profile.verifiedEmail,
    },
  });
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  initialized: false,

  loginWithEmail: async (email, password) => {
    const res = await authApi.login(email, password);
    setTokens(res.accessToken, res.refreshToken);
    await fetchProfileAndSet();
  },

  signupAndLogin: async (data) => {
    await authApi.signup(data);
    const res = await authApi.login(data.email, data.password);
    setTokens(res.accessToken, res.refreshToken);
    await fetchProfileAndSet();
  },

  logout: async () => {
    try {
      if (hasStoredTokens()) {
        await authApi.logout();
      }
    } catch {
      // 네트워크 에러는 무시하고 로컬 로그아웃 진행
    }
    clearTokens();
    set({ isLoggedIn: false, user: null });
  },

  restoreSession: async () => {
    if (hasStoredTokens()) {
      try {
        await fetchProfileAndSet();
      } catch {
        clearTokens();
        set({ isLoggedIn: false, user: null });
      }
    }
    set({ initialized: true });
  },
}));
