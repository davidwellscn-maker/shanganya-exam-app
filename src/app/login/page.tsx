"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account.trim() || !password) {
      setError("请输入账号和密码");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await login(account.trim(), password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "登录失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10">
      <div className="w-full max-w-md rounded-md border border-border bg-card p-8 shadow-sm">
        {/* 品牌头 */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-md bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">欢迎回来</h1>
            <p className="text-sm text-muted-foreground mt-1">登录考试学习平台，继续你的备考之旅</p>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-5 rounded-sm border border-error/40 bg-error-50 px-4 py-3 text-sm text-error-foreground">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="account" className="block text-sm font-medium text-foreground">
              用户名 / 邮箱
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="account"
                type="text"
                autoComplete="username"
                placeholder="请输入用户名或邮箱"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full h-10 rounded-sm border border-input bg-muted/40 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              密码
            </label>
            <div className="relative">
              <LockKeyhole className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 rounded-sm border border-input bg-muted/40 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                登录中...
              </>
            ) : (
              "登录"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          还没有账号？
          <Link href="/register" className="text-primary font-medium hover:underline ml-1">
            立即注册
          </Link>
        </div>
      </div>
    </div>
  );
}
