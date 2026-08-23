// 上岸鸭 API 客户端
// 开发环境：默认走相对路径 /api（由 next.config.js rewrites 代理到服务器）
// 生产环境：构建时注入 NEXT_PUBLIC_API_BASE=https://api.ducktoshore.cn

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api";

export interface AuthData {
  id: number;
  username: string;
  email: string;
  token: string;
}

export interface MeData {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export class ApiError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || (body && typeof body.code === "number" && body.code >= 400)) {
    throw new ApiError(body?.code ?? res.status, body?.message ?? "请求失败，请稍后重试");
  }
  return body as T;
}

/** 注册 */
export function apiRegister(username: string, email: string, password: string) {
  return request<{ code: number; message: string; data: AuthData }>("/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

/** 登录（账号支持用户名或邮箱） */
export function apiLogin(account: string, password: string) {
  return request<{ code: number; message: string; data: AuthData }>("/login", {
    method: "POST",
    body: JSON.stringify({ account, password }),
  });
}

/** 获取当前用户信息 */
export function apiMe(token: string) {
  return request<{ code: number; data: MeData }>("/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
