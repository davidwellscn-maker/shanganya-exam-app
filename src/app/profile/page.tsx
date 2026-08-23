"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, GraduationCap, LogOut, Mail, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  const onLogout = () => {
    logout();
    router.push("/");
    router.refresh();
  };

  // 恢复登录态中
  if (!ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-muted border-t-primary animate-spin" />
      </div>
    );
  }

  // 未登录
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md rounded-md border border-border bg-card p-10 text-center">
          <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">尚未登录</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">登录后即可查看个人资料与学习记录</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-9 px-5 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:opacity-85 transition-opacity"
            >
              去登录
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-9 px-5 rounded-sm border border-border text-sm text-foreground hover:bg-muted/40 transition-colors"
            >
              注册
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 已登录
  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6 animate-fade-in">
      {/* 用户信息卡片 */}
      <div className="rounded-md border border-border bg-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-md bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shrink-0">
            <span className="text-2xl font-semibold text-white">{user.username.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">{user.username}</h1>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              已登录 · 普通用户
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-sm bg-muted/50 p-4 flex items-start gap-3">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">邮箱</div>
              <div className="text-sm text-foreground font-medium break-all mt-0.5">{user.email}</div>
            </div>
          </div>
          <div className="rounded-sm bg-muted/50 p-4 flex items-start gap-3">
            <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">注册时间</div>
              <div className="text-sm text-foreground font-medium mt-0.5">
                {user.created_at ? user.created_at.slice(0, 10) : "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-sm border border-error/40 text-error-foreground text-sm font-medium hover:bg-error-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </div>

      {/* 学习入口 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/questions", icon: GraduationCap, title: "历年真题", desc: "2015-2025 真题练习" },
          { href: "/chapters/1", icon: GraduationCap, title: "章节学习", desc: "按章节掌握知识点" },
          { href: "/", icon: GraduationCap, title: "学习驾驶舱", desc: "查看学习进度与推荐" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-md border border-border bg-card p-4 hover:border-foreground/50 transition-colors"
          >
            <item.icon className="w-5 h-5 text-muted-foreground mb-3" />
            <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {item.title}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
