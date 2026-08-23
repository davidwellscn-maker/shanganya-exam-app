"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Loader2, LockKeyhole, Mail, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

const USERNAME_RE = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!USERNAME_RE.test(username.trim())) {
      setError("用户名需为 2-20 位中文、字母、数字或下划线");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("邮箱格式不正确");
      return;
    }
    if (password.length < 6 || password.length > 64) {
      setError("密码长度需为 6-64 位");
      return;
    }
    if (password !== confirm) {
      setError("两次输入的密码不一致");
      return;
    }

    setSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "注册失败，请稍后重试");
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
            <h1 className="text-xl font-semibold text-foreground">创建账号</h1>
            <p className="text-sm text-muted-foreground mt-1">加入考试学习平台，开始高效备考</p>
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
            <label htmlFor="username" className="block text-sm font-medium text-foreground">
              用户名
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="2-20 位中文、字母、数字或下划线"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 rounded-sm border border-input bg-muted/40 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              邮箱
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                autoComplete="new-password"
                placeholder="6-64 位密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 rounded-sm border border-input bg-muted/40 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm" className="block text-sm font-medium text-foreground">
              确认密码
            </label>
            <div className="relative">
              <LockKeyhole className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="请再次输入密码"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
                注册中...
              </>
            ) : (
              "注册"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          已有账号？
          <Link href="/login" className="text-primary font-medium hover:underline ml-1">
            直接登录
          </Link>
        </div>
      </div>
    </div>
  );
}
