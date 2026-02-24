"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SharedPesticideSearch from "@/components/SharedPesticideSearch";
import type { PesticideSearchResult } from "@/types/maff";

export default function NewReviewPage() {
    const [selected, setSelected] = useState<PesticideSearchResult | null>(null);

    // Review form state
    const [rating, setRating] = useState(0);
    const [body, setBody] = useState("");
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Profile info (auto-filled)
    const [profileInfo, setProfileInfo] = useState<{
        region: string; crop: string;
    } | null>(null);

    useEffect(() => {
        fetch("/api/profile-info")
            .then(r => r.ok ? r.json() : null)
            .then(data => data && setProfileInfo(data))
            .catch(() => { });
    }, []);

    // Photo handling
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setPhotos(prev => [...prev, ...files].slice(0, 4));
        files.forEach(f => {
            const reader = new FileReader();
            reader.onload = () => setPhotoPreviews(prev => [...prev, reader.result as string].slice(0, 4));
            reader.readAsDataURL(f);
        });
    };

    const removePhoto = (idx: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== idx));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== idx));
    };

    // Submit review
    const handleSubmit = async () => {
        if (!selected || !rating || !body.trim()) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            // Pass the regNumber, the API will upsert the Pesticide
            formData.set("regNumber", selected.regNumber);
            formData.set("rating", String(rating));
            formData.set("body", body);
            formData.set("isDraft", "false");

            const res = await fetch("/api/reviews", {
                method: "POST",
                body: formData,
            });
            if (res.ok) {
                setSubmitted(true);
            } else {
                alert("投稿に失敗しました");
            }
        } catch (err) {
            console.error(err);
            alert("エラーが発生しました");
        } finally {
            setSubmitting(false);
        }
    };

    // Success state
    if (submitted) {
        return (
            <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="card" style={{ padding: 48, textAlign: "center", maxWidth: 400 }}>
                    <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎉</div>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 8 }}>投稿完了！</h2>
                    <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: "0.9rem" }}>
                        レビューが投稿されました。あなたの経験が他の農家の役に立ちます。
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                        <Link href="/" className="btn-secondary">ホームへ</Link>
                        <Link href="/me" className="btn-primary">マイページ</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: selected ? 700 : 1200, margin: "0 auto", padding: "40px 16px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 8 }}>✏️ レビューを書く</h1>
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 32 }}>
                農薬の使用体験を共有して、農家コミュニティに貢献しましょう。
            </p>

            {/* Profile auto-fill banner */}
            {profileInfo && selected && (
                <div style={{
                    padding: "10px 16px", borderRadius: 10,
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                    fontSize: "0.8rem", color: "var(--primary-dark)",
                    marginBottom: 24, display: "flex", gap: 16,
                }}>
                    <span>📍 {profileInfo.region}</span>
                    <span>🌾 {profileInfo.crop}</span>
                    <span style={{ color: "var(--muted)", fontSize: "0.7rem", marginLeft: "auto" }}>プロフィールから自動補完</span>
                </div>
            )}

            {/* Step 1: Select Pesticide */}
            {!selected ? (
                <div>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
                        Step 1 / 2 — レビュー対象の農薬を選択
                    </h2>
                    <SharedPesticideSearch
                        hideHeader
                        onSelect={setSelected}
                        actionLabel="選択してレビューを書く"
                    />
                </div>
            ) : (
                /* Step 2: Write Review */
                <div>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                        Step 2 / 2 — レビューを記入
                    </h2>

                    {/* Selected pesticide */}
                    <div className="card" style={{
                        padding: 14, marginBottom: 24,
                        display: "flex", alignItems: "center", gap: 12,
                        border: "2px solid var(--primary-light)",
                    }}>
                        <div style={{
                            width: 40, height: 40,
                            background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1rem",
                        }}>🧪</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700 }}>{selected.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{selected.company} ｜ No.{selected.regNumber}</div>
                        </div>
                        <button
                            onClick={() => setSelected(null)}
                            style={{
                                background: "none", border: "1px solid var(--border)",
                                borderRadius: 6, padding: "4px 10px",
                                cursor: "pointer", fontSize: "0.75rem", color: "var(--muted)",
                            }}
                        >変更</button>
                    </div>

                    {/* Star rating */}
                    <div style={{ marginBottom: 20 }}>
                        <label className="form-label">評価（5段階）</label>
                        <div style={{ display: "flex", gap: 4 }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setRating(i)}
                                    className={`star-btn ${i <= rating ? "filled" : ""}`}
                                    style={{ fontSize: "1.8rem" }}
                                >★</button>
                            ))}
                        </div>
                    </div>

                    {/* Body */}
                    <div style={{ marginBottom: 20 }}>
                        <label className="form-label">レビュー本文</label>
                        <textarea
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            className="form-input"
                            placeholder="どの作物に使ったか、どんな効果があったか、注意点など自由にお書きください。&#10;&#10;例：トマト栽培で使用。散布2日後にアブラムシが激減。2週間で再発生はなかった。..."
                            style={{ minHeight: 200, lineHeight: 1.7 }}
                        />
                    </div>

                    {/* Photo upload */}
                    <div style={{ marginBottom: 24 }}>
                        <label className="form-label">写真（最大4枚）</label>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {photoPreviews.map((src, i) => (
                                <div key={i} style={{ position: "relative", width: 80, height: 80 }}>
                                    <img src={src} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
                                    <button
                                        onClick={() => removePhoto(i)}
                                        style={{
                                            position: "absolute", top: -6, right: -6,
                                            width: 20, height: 20, borderRadius: "50%",
                                            background: "#ef4444", color: "white",
                                            border: "none", cursor: "pointer",
                                            fontSize: "0.6rem", display: "flex",
                                            alignItems: "center", justifyContent: "center",
                                        }}
                                    >✕</button>
                                </div>
                            ))}
                            {photos.length < 4 && (
                                <label style={{
                                    width: 80, height: 80,
                                    border: "2px dashed var(--border)", borderRadius: 8,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", fontSize: "1.5rem", color: "var(--muted)",
                                    transition: "border-color 0.15s",
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--primary-light)")}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                                >
                                    📷
                                    <input type="file" accept="image/*" multiple onChange={handlePhotoChange} style={{ display: "none" }} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !rating || !body.trim()}
                        className="btn-primary"
                        style={{
                            width: "100%", justifyContent: "center",
                            padding: 14, fontSize: "1rem",
                            opacity: (!rating || !body.trim()) ? 0.5 : 1,
                        }}
                    >
                        {submitting ? "投稿中..." : "レビューを投稿する"}
                    </button>
                </div>
            )}
        </div>
    );
}
