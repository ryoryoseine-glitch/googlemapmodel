"use client";

import { submitReport } from "@/app/actions/reports";
import { useState } from "react";

export function ReportButton({ reviewId }: { reviewId: string }) {
    const [open, setOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set("reviewId", reviewId);
        await submitReport(formData);
        setSubmitted(true);
        setTimeout(() => { setOpen(false); setSubmitted(false); }, 2000);
    };

    if (!open) return <button className="action-btn" onClick={() => setOpen(true)} style={{ fontSize: "0.72rem" }}>🚩 通報</button>;

    return (
        <div className="card animate-in" style={{ padding: 14, marginTop: 8 }}>
            {submitted ? (
                <p style={{ color: "var(--success)", fontWeight: 600, fontSize: "0.82rem" }}>✅ 通報を受け付けました</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <select name="reason" required className="form-input" style={{ marginBottom: 8 }}>
                        <option value="">理由を選択</option>
                        <option value="SPAM">スパム</option><option value="FALSE_INFO">虚偽情報</option>
                        <option value="HARASSMENT">誹謗中傷</option><option value="OTHER">その他</option>
                    </select>
                    <textarea name="detail" className="form-input" placeholder="詳細（任意）" rows={2} style={{ marginBottom: 8, minHeight: 50 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                        <button type="submit" className="btn-primary" style={{ fontSize: "0.78rem", padding: "5px 10px" }}>送信</button>
                        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>キャンセル</button>
                    </div>
                </form>
            )}
        </div>
    );
}
