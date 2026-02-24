"use client";

import Link from "next/link";
import { addToInventory, removeFromInventory } from "@/app/actions/inventory";
import { useState } from "react";

export function PesticideActions({
    pesticideId,
    currentUserId,
    inInventory,
}: {
    pesticideId: string;
    currentUserId: string | null;
    inInventory: boolean;
}) {
    const [submitting, setSubmitting] = useState(false);

    const handleToggleInventory = async () => {
        setSubmitting(true);
        const fd = new FormData();
        fd.set("pesticideId", pesticideId);
        if (inInventory) {
            await removeFromInventory(fd);
        } else {
            await addToInventory(fd);
        }
        setSubmitting(false);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
                <Link href={`/pesticides/${pesticideId}/review/new`} className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                    ✏️ レビューを書く
                </Link>
                {currentUserId && (
                    <button
                        className={inInventory ? "btn-secondary" : "btn-ghost"}
                        onClick={handleToggleInventory}
                        disabled={submitting}
                        style={{ padding: "10px 16px" }}
                    >
                        {inInventory ? "✅ 薬箱の中" : "📦 薬箱へ追加"}
                    </button>
                )}
            </div>
            {inInventory && (
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0, textAlign: "right" }}>
                    ※ マイページから削除できます
                </p>
            )}
        </div>
    );
}
