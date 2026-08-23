"use client";

// 顶部导航右侧：未登录显示 登录/注册；已登录显示用户菜单

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function AuthBar() {
  const { user, ready, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // 登录态恢复中：显示骨架
  if (!ready) {
    return <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />;
  }

  // 未登录
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="inline-flex items-center justify-center h-9 px-4 rounded-sm border border-border text-sm text-foreground hover:bg-muted/40 transition-colors"
        >
          登录
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center h-9 px-4 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:opacity-85 transition-opacity"
        >
          注册
        </Link>
      </div>
    );
  }

  // 已登录
  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-full border border-border bg-card hover:bg-muted/40 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-white">{user.username.charAt(0)}</span>
        </div>
        <span className="text-sm text-foreground max-w-[72px] truncate hidden sm:inline">
          {user.username}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-card shadow-lg py-1.5 z-50 animate-slide-up">
          <div className="px-4 py-2 border-b border-border mb-1">
            <div className="text-sm font-medium text-foreground truncate">{user.username}</div>
            <div className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</div>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/40 transition-colors"
          >
            <User className="w-4 h-4 text-muted-foreground" />
            个人中心
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-error-foreground hover:bg-error-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
