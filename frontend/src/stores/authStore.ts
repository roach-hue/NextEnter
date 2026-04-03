import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  userId: number;
  email: string;
  name: string;
  userType?: "personal" | "company";
  companyId?: number;
  companyName?: string;
  businessNumber?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

const isCompanyPath = () => window.location.pathname.startsWith("/company");

const getStorageKeys = (userType: "personal" | "company") => {
  if (userType === "company") {
    return { tokenKey: "company_token", userKey: "company_user" };
  }
  return { tokenKey: "user_token", userKey: "user_user" };
};

// 초기 로드: localStorage에서 현재 경로에 맞는 인증 정보 복원
const loadInitialAuth = (): { user: User | null; token: string | null } => {
  try {
    const isCompany = isCompanyPath();
    const { tokenKey, userKey } = getStorageKeys(
      isCompany ? "company" : "personal",
    );

    const storedToken = localStorage.getItem(tokenKey);
    const storedUser = localStorage.getItem(userKey);

    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);

      if (isCompany && parsedUser.userType !== "company") {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        return { user: null, token: null };
      }

      if (!isCompany && parsedUser.userType === "company") {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        return { user: null, token: null };
      }

      return { user: parsedUser, token: storedToken };
    }
  } catch {
    const isCompany = isCompanyPath();
    const { tokenKey, userKey } = getStorageKeys(
      isCompany ? "company" : "personal",
    );
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
  }
  return { user: null, token: null };
};

const initial = loadInitialAuth();

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: initial.user,
  token: initial.token,
  isAuthenticated: !!initial.user && !!initial.token,
  isLoading: false,

  login: (userData, userToken) => {
    if (!userData.userType) {
      userData.userType = "personal";
    }
    const { tokenKey, userKey } = getStorageKeys(userData.userType);
    localStorage.setItem(tokenKey, userToken);
    localStorage.setItem(userKey, JSON.stringify(userData));
    set({ user: userData, token: userToken, isAuthenticated: true });
  },

  logout: () => {
    const { user } = get();
    if (user?.userType) {
      const { tokenKey, userKey } = getStorageKeys(user.userType);
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
    } else {
      localStorage.clear();
      sessionStorage.clear();
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
