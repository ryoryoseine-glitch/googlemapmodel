"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function SuccessFeedback() {
    const searchParams = useSearchParams();
    const [show, setShow] = useState(false);
    const [badges, setBadges] = useState<string[]>([]);

    useEffect(() => {
        if (searchParams.get("submitted") === "true") {
            setShow(true);
            const b = searchParams.get("badges");
            if (b) setBadges(b.split(","));
        }
    }, [searchParams]);

    if (!show) return null;

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: 20 }}>
            <div className="card animate-in" style={{ maxWidth: 400, width: "100%", padding: 40, textAlign: "center", position: "relative" }}>
                <span style={{ fontSize: "4rem" }}>🎉</span>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "16px 0 8px" }}>レビューありがとうございます！</h2>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 24 }}>
                    あなたのレビューが投稿されました。<br />
                    農家の知見共有に貢献していただきありがとうございます。
                </p>

                {badges.length > 0 && (
                    <div style={{ background: "#f0fff4", border: "2px solid #c6f6d5", borderRadius: 16, padding: 20, marginBottom: 24 }}>
                        <p style={{ fontSize: "0.8rem", fontWeight: 800, color: "#2f855a", marginBottom: 12 }}>🎖 新しいバッジを獲得しました！</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                            {badges.map(b => (
                                <div key={b} style={{ background: "white", padding: "6px 12px", borderRadius: 100, fontSize: "0.85rem", fontWeight: 700, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                                    {b}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button className="btn-primary" onClick={() => setShow(false)} style={{ width: "100%", justifyContent: "center", padding: 12 }}>
                    閉じる
                </button>
            </div>
        </div>
    );
}
