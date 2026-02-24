"use client";

import { useState } from "react";
import { registerUser } from "@/app/actions/auth";
import Link from "next/link";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPw, setConfirmPw] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (password !== confirmPw) {
            setError("パスワードが一致しません");
            return;
        }
        setLoading(true);
        const fd = new FormData();
        fd.set("name", name);
        fd.set("email", email);
        fd.set("password", password);
        const result = await registerUser(fd);
        if (result.success) {
            setDone(true);
            setTimeout(() => { window.location.href = "/onboarding"; }, 1500);
        } else {
            setError(result.error || "登録に失敗しました");
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg, #f0fff4, #e6fffa)" }}>
            <div className="card" style={{ width: "100%", maxWidth: 440, padding: 0 }}>
                {/* Header */}
                <div style={{ textAlign: "center", padding: "32px 32px 20px", background: "linear-gradient(to bottom, #f8fafc, white)" }}>
                    <span style={{ fontSize: "2.4rem" }}>🌾</span>
                    <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "10px 0 4px", color: "var(--primary-dark)" }}>新規アカウント登録</h1>
                    <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>農薬レビューコミュニティに参加</p>
                </div>

                <div style={{ padding: "24px 32px 32px" }}>
                    {error && (
                        <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#dc2626", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, marginBottom: 16 }}>
                            {error}
                        </div>
                    )}

                    {!done ? (
                        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div>
                                <label className="form-label">表示名（ニックネーム可）</label>
                                <input className="form-input" required maxLength={20} value={name} onChange={e => setName(e.target.value)} placeholder="例：みかん農家のたなか" />
                            </div>
                            <div>
                                <label className="form-label">メールアドレス</label>
                                <input type="email" className="form-input" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
                            </div>
                            <div>
                                <label className="form-label">パスワード（8文字以上）</label>
                                <input type="password" className="form-input" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="form-label">パスワード確認</label>
                                <input type="password" className="form-input" required value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" />
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: "0.95rem", marginTop: 4 }}>
                                {loading ? "登録中..." : "登録してプロフィール入力へ"}
                            </button>
                        </form>
                    ) : (
                        <div style={{ textAlign: "center", padding: 20 }}>
                            <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎉</div>
                            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 8 }}>登録完了！</h2>
                            <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>プロフィール入力に進みます...</p>
                        </div>
                    )}

                    {!done && (
                        <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                            <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                                すでにアカウントをお持ちの方は
                                <Link href="/auth/login" style={{ color: "var(--primary)", fontWeight: 700, marginLeft: 4 }}>ログイン</Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
