"use client";

import { useState } from "react";
import SharedPesticideSearch from "@/components/SharedPesticideSearch";
import { addToInventory } from "@/app/actions/inventory";
import type { PesticideSearchResult } from "@/types/maff";

export function MyPesticideAdder() {
    const [isAdding, setIsAdding] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSelect = async (pesticide: PesticideSearchResult) => {
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.set("pesticideId", pesticide.regNumber);
            await addToInventory(fd);
            setIsAdding(false);
        } catch (e) {
            console.error(e);
            alert("追加に失敗しました");
        }
        setSubmitting(false);
    };

    return (
        <>
            <button
                onClick={() => setIsAdding(true)}
                style={{ fontSize: "0.75rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
            >
                ＋ 追加する
            </button>

            {isAdding && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.6)", zIndex: 9999,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 20
                }}>
                    <div className="card animate-in" style={{
                        width: "100%", maxWidth: 1000, maxHeight: "90vh",
                        overflowY: "auto", position: "relative",
                        padding: "24px", background: "white", borderRadius: 16
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>
                                📦 マイ農薬を検索して追加
                            </h2>
                            <button
                                onClick={() => setIsAdding(false)}
                                style={{
                                    width: 32, height: 32, borderRadius: "50%",
                                    background: "#f1f5f9", border: "none", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1rem", color: "var(--muted)"
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {submitting ? (
                            <div style={{ padding: 80, textAlign: "center", color: "var(--primary-dark)" }}>
                                <div style={{ fontSize: "2rem", marginBottom: 12 }}>📦</div>
                                <div style={{ fontWeight: 700 }}>薬箱に追加しています...</div>
                            </div>
                        ) : (
                            <SharedPesticideSearch
                                hideHeader
                                onSelect={handleSelect}
                                actionLabel="＋ 薬箱に追加"
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
