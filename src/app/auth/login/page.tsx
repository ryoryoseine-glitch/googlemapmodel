"use client";

import { useState } from "react";
import { loginWithEmail } from "@/app/actions/auth";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const fd = new FormData();
        fd.set("email", email);
        fd.set("password", password);
        const result = await loginWithEmail(fd);
        if (result.success) {
            window.location.href = result.profileComplete ? "/" : "/onboarding";
        } else {
            setError(result.error || "ログインに失敗しました");
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg, #f0fff4, #e6fffa)" }}>
            <div className="card" style={{ width: "100%", maxWidth: 420, padding: 0, overflow: "hidden" }}>
                {/* Header */}
                <div style={{ textAlign: "center", padding: "36px 32px 24px", background: "linear-gradient(to bottom, #f8fafc, white)" }}>
                    <span style={{ fontSize: "2.8rem" }}>🌾</span>
                    <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "12px 0 6px", color: "var(--primary-dark)" }}>NouReview</h1>
                    <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>農薬レビューコミュニティ</p>
                </div>

                <div style={{ padding: "28px 32px 32px" }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 20, textAlign: "center", color: "var(--primary-dark)" }}>
                        メールアドレスでログイン
                    </h2>

                    {error && (
                        <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#dc2626", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, marginBottom: 16 }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label className="form-label">メールアドレス</label>
                            <input type="email" className="form-input" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
                        </div>
                        <div>
                            <label className="form-label">パスワード</label>
                            <input type="password" className="form-input" required value={password} onChange={e => setPassword(e.target.value)} placeholder="8文字以上" />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: "0.95rem" }}>
                            {loading ? "ログイン中..." : "ログイン"}
                        </button>
                    </form>

                    <div style={{ textAlign: "center", marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                        <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                            アカウントをお持ちでない方は
                        </p>
                        <Link href="/auth/register" className="btn-secondary" style={{ width: "100%", justifyContent: "center", padding: 12, marginTop: 8, fontSize: "0.9rem" }}>
                            新規アカウント登録
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
