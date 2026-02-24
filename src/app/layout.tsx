import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NouReview - 農薬レビュー",
  description: "農家の散布記録が、みんなの知見になる。農薬の使用体験をレビューしよう。",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}>
          <div className="container-wide" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 54, gap: 12 }}>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: "1.2rem" }}>🌾</span>
              <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--primary-dark)", letterSpacing: "-0.02em" }}>NouReview</span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {currentUser ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, overflowX: "auto", whiteSpace: "nowrap", paddingBottom: 2 }}>
                  <Link href="/pesticides/search" className="nav-link" style={{ fontSize: "0.85rem", padding: "4px 8px" }}>🔍 農薬検索</Link>
                  <Link href="/me" className="nav-link" style={{ fontSize: "0.85rem", padding: "4px 8px" }}>👤 マイページ</Link>
                  <Link href="/reviews/new" className="nav-link" style={{ fontSize: "0.85rem", padding: "4px 8px" }}>✏️ 投稿</Link>
                  <form action={async () => {
                    "use server";
                    const { logout } = await import("@/app/actions/auth");
                    await logout();
                    const { redirect } = await import("next/navigation");
                    redirect("/auth/login");
                  }}>
                    <button type="submit" className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", padding: "4px 8px", fontFamily: "inherit" }}>🚪 ログアウト</button>
                  </form>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 6, overflowX: "auto", whiteSpace: "nowrap", paddingBottom: 2 }}>
                  <Link href="/pesticides/search" className="nav-link" style={{ fontSize: "0.85rem", padding: "4px 8px" }}>🔍 農薬検索</Link>
                  <Link href="/me" className="nav-link" style={{ fontSize: "0.85rem", padding: "4px 8px" }}>👤 マイページ</Link>
                  <Link href="/reviews/new" className="nav-link" style={{ fontSize: "0.85rem", padding: "4px 8px" }}>✏️ 投稿</Link>
                  <Link href="/auth/login" className="btn-secondary" style={{ padding: "4px 12px", fontSize: "0.85rem", textDecoration: "none", marginLeft: 4 }}>ログイン</Link>
                  <Link href="/auth/register" className="btn-primary" style={{ padding: "4px 12px", fontSize: "0.85rem", textDecoration: "none" }}>新規登録</Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile Bottom Navigation */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid var(--border)", display: "none" }} className="mobile-nav">
          <div style={{ display: "flex", justifyContent: "space-around", padding: "8px 0 env(safe-area-inset-bottom, 8px)" }}>
            {[
              { href: "/", icon: "🏠", label: "ホーム" },
              { href: "/pesticides/search", icon: "🔍", label: "検索" },
              { href: "/reviews/new", icon: "✏️", label: "投稿" },
              { href: "/me", icon: "👤", label: "マイページ" },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textDecoration: "none", color: "var(--muted)", fontSize: "0.65rem", fontWeight: 600 }}>
                <div style={{ fontSize: "1.3rem", marginBottom: "2px" }}>{item.icon}</div>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <main style={{ paddingBottom: "env(safe-area-inset-bottom, 20px)" }}>
          {children}
          <div className="mobile-nav-spacer" />
        </main>
      </body>
    </html>
  );
}
