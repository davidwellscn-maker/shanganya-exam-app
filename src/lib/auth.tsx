"use client";

// 全局登录态管理：localStorage 持久化 Token 与用户信息

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiLogin, apiMe, apiRegister, type AuthData, type MeData } from "./api";

const TOKEN_KEY = "shanganya_token";
const USER_KEY = "shanganya_user";

interface AuthContextValue {
  user: MeData | null;
  token: string | null;
  ready: boolean; // 初始恢复完成
  login: (account: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // 启动时从 localStorage 恢复登录态，并校验 Token 有效性
  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      setReady(true);
      return;
    }
    setToken(t);
    apiMe(t)
      .then((res) => {
        setUser(res.data);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      })
      .finally(() => setReady(true));
  }, []);

  const applyAuth = useCallback((data: AuthData) => {
    const info: MeData = {
      id: data.id,
      username: data.username,
      email: data.email,
      created_at: "",
    };
    setUser(info);
    setToken(data.token);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(info));
  }, []);

  const login = useCallback(
    async (account: string, password: string) => {
      const res = await apiLogin(account, password);
      applyAuth(res.data);
    },
    [applyAuth]
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const res = await apiRegister(username, email, password);
      applyAuth(res.data);
    },
    [applyAuth]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, token, ready, login, register, logout }),
    [user, token, ready, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必须在 AuthProvider 内使用");
  return ctx;
}
