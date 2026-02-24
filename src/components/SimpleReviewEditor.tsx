"use client";

import { useState, useRef, useEffect } from "react";
import { createReview } from "@/app/actions/reviews";

const TEMPLATES = [
    { label: "ライト", emoji: "💡", text: "【使った場面】\n\n【感想・結果】\n\n【一言まとめ】\n" },
    { label: "失敗談", emoji: "😅", text: "【何が起きた】\n\n【やってしまったこと】\n\n【学んだこと】\n" },
    { label: "比較", emoji: "⚖️", text: "【比較対象】\n\n【条件】\n\n【結果】\n\n【結論】\n" },
    { label: "おすすめ", emoji: "👍", text: "【おすすめポイント】\n\n【使い方のコツ】\n\n【注意点】\n" },
];

export function SimpleReviewEditor({ pesticideId, pesticideName, initialMemo }: { pesticideId: string; pesticideName: string; initialMemo?: string }) {
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(0);
    const [photoUrl, setPhotoUrl] = useState("");
    const bodyRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (bodyRef.current && initialMemo) {
            bodyRef.current.value = initialMemo + "\n\n";
        }
    }, [initialMemo]);

    const insertTemplate = (text: string) => {
        if (!bodyRef.current) return;
        const ta = bodyRef.current;
        const start = ta.selectionStart;
        ta.value = ta.value.substring(0, start) + text + ta.value.substring(ta.selectionEnd);
        ta.focus();
        ta.selectionStart = ta.selectionEnd = start + text.length;
    };

    const handleSubmit = async (isDraft: boolean) => {
        if (!isDraft && (rating === 0 || !bodyRef.current?.value.trim())) {
            alert("★評価と本文は必須です");
            return;
        }
        setSubmitting(true);
        const fd = new FormData();
        fd.set("pesticideId", pesticideId);
        fd.set("rating", String(rating));
        fd.set("body", bodyRef.current?.value || "");
        fd.set("isDraft", String(isDraft));
        if (photoUrl.trim()) {
            fd.set("photoUrl", photoUrl.trim());
        }
        await createReview(fd);
    };

    return (
        <div>
            {/* Pesticide name (read-only) */}
            <div style={{ marginBottom: 20, padding: "12px 16px", background: "var(--surface-hover)", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "1.1rem" }}>🧪</span>
                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{pesticideName}</span>
            </div>

            {/* Rating */}
            <div style={{ marginBottom: 24 }}>
                <label className="form-label">★ 評価（必須）</label>
                <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <button key={i} type="button" className={`star-btn ${i <= rating ? "filled" : ""}`}
                            onClick={() => setRating(i)}
                            style={{ fontSize: "1.8rem", padding: "4px 6px" }}>★</button>
                    ))}
                    {rating > 0 && <span style={{ marginLeft: 8, fontSize: "0.9rem", color: "var(--muted)", alignSelf: "center" }}>{rating}/5</span>}
                </div>
            </div>

            {/* Body */}
            <div style={{ marginBottom: 20 }}>
                <label className="form-label">📝 レビュー本文（必須）</label>
                <textarea
                    ref={bodyRef}
                    className="form-input"
                    placeholder="効果はどうでしたか？使い方や満足した点など、自由に書いてください。"
                    style={{ minHeight: 200, lineHeight: 1.7 }}
                />
            </div>

            {/* Photo (optional) */}
            <div style={{ marginBottom: 32 }}>
                <label className="form-label">📸 写真URL（任意）</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="https://... 写真のURLがあれば貼り付け"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                />
                {photoUrl && (
                    <img src={photoUrl} alt="プレビュー" style={{ marginTop: 12, width: "100%", maxHeight: 200, borderRadius: 10, objectFit: "cover" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
            </div>

            {/* Submit */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button className="btn-primary" onClick={() => handleSubmit(false)} disabled={submitting}
                    style={{ padding: "16px", fontSize: "1rem", fontWeight: 700 }}>
                    {submitting ? "送信中..." : "🚀 レビューを投稿する"}
                </button>
                <button className="btn-ghost" onClick={() => handleSubmit(true)} disabled={submitting}
                    style={{ color: "var(--muted)" }}>下書きとして保存</button>
            </div>
        </div>
    );
}
