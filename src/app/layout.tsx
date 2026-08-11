import type { Metadata } from "next";
import "./globals.css";
import { GraduationCap, Search } from "lucide-react";
import { NavLink } from "@/components/ui/nav-link";

export const metadata: Metadata = {
  title: "考试学习平台 · 同等学力工商管理备考",
  description: "知识点拆解、真题练习、学习路线图",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-background text-foreground antialiased min-h-screen font-sans">
        <header className="glass-header sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            {/* Logo + 站点名 */}
            <a href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="font-semibold text-foreground">考试学习平台</span>
            </a>

            {/* 导航链接 */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <NavLink href="/" label="首页" />
              <NavLink href="/questions" label="历年真题" />
              <NavLink href="/chapters/1" label="章节学习" />
            </nav>

            {/* 搜索 + 头像 */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-48 rounded-md border border-input bg-muted/40 px-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground hidden sm:inline">搜索教材/真题</span>
                <span className="text-sm text-muted-foreground sm:hidden">搜索</span>
              </div>
              <div
                className="w-9 h-9 rounded-full bg-muted"
                title="用户头像占位"
              ></div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10">
          {children}
        </main>

        <footer className="border-t border-border mt-12 pt-6 pb-8 bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5 text-white" />
              </div>
              <span>© 2026 考试学习平台 · 工商管理同等学力备考</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <a className="hover:text-foreground transition-colors" href="#">关于我们</a>
              <a className="hover:text-foreground transition-colors" href="#">帮助中心</a>
              <a className="hover:text-foreground transition-colors" href="#">隐私政策</a>
              <a className="hover:text-foreground transition-colors" href="#">联系我们</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
