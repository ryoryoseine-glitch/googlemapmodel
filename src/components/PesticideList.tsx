"use client";

import type { PesticideSearchResult } from "@/types/maff";
import PesticideCard from "./PesticideCard";

interface Props {
    results: PesticideSearchResult[];
    total: number;
    loading: boolean;
    hasFilters: boolean;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    onSelect?: (card: PesticideSearchResult) => void;
    actionLabel?: string;
}

export default function PesticideList({ results, total, loading, hasFilters, page, limit, onPageChange, onSelect, actionLabel }: Props) {
    const totalPages = Math.ceil(total / limit);

    if (loading) {
        return (
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card" style={{
                            height: 140, padding: 0,
                            background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 1.5s ease-in-out infinite",
                        }} />
                    ))}
                </div>
                <style>{`
                    @keyframes shimmer {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                `}</style>
            </div>
        );
    }

    if (!hasFilters) {
        return (
            <div style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                minHeight: 400,
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "4rem", marginBottom: 16 }}>🌾</div>
                    <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary-dark)", margin: 0 }}>
                        農薬をリアルタイム検索
                    </h2>
                    <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 8, maxWidth: 300 }}>
                        左のパネルから作物・病害虫を選択、またはキーワードを入力して検索を開始してください
                    </p>
                    <div style={{
                        display: "flex", gap: 8, justifyContent: "center", marginTop: 16,
                        fontSize: "0.72rem", color: "var(--muted)",
                    }}>
                        <span style={statBadge}>🌱 1,334 作物</span>
                        <span style={statBadge}>🐛 1,356 病害虫</span>
                        <span style={statBadge}>💊 3,822 農薬</span>
                    </div>
                </div>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                minHeight: 300,
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary-dark)" }}>
                        該当する農薬が見つかりませんでした
                    </h3>
                    <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 4 }}>
                        条件を変更してみてください
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ flex: 1 }}>
            {/* Results summary bar */}
            <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 16, padding: "10px 16px",
                borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0",
                fontSize: "0.8rem",
            }}>
                <span style={{ fontWeight: 700, color: "var(--primary-dark)" }}>
                    🔍 {total.toLocaleString()}件の農薬がヒット
                </span>
                {totalPages > 1 && (
                    <span style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
                        ページ {page}/{totalPages}
                    </span>
                )}
            </div>

            {/* Card list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {results.map(card => (
                    <PesticideCard
                        key={card.regNumber}
                        card={card}
                        actionLabel={actionLabel}
                        onClick={onSelect ? () => onSelect(card) : undefined}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{
                    display: "flex", justifyContent: "center", gap: 8,
                    marginTop: 24, padding: "16px 0",
                }}>
                    <PaginationButton
                        label="← 前へ"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                    />
                    {generatePageNumbers(page, totalPages).map((p, i) => (
                        p === -1 ? (
                            <span key={`ellipsis-${i}`} style={{ padding: "6px 4px", color: "var(--muted)" }}>...</span>
                        ) : (
                            <PaginationButton
                                key={p}
                                label={String(p)}
                                active={p === page}
                                onClick={() => onPageChange(p)}
                            />
                        )
                    ))}
                    <PaginationButton
                        label="次へ →"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                    />
                </div>
            )}
        </div>
    );
}

function PaginationButton({ label, disabled, active, onClick }: {
    label: string; disabled?: boolean; active?: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: "6px 12px", borderRadius: 8,
                border: active ? "2px solid var(--primary)" : "1px solid var(--border)",
                background: active ? "var(--primary)" : "white",
                color: active ? "white" : disabled ? "#d1d5db" : "var(--primary-dark)",
                fontSize: "0.78rem", fontWeight: active ? 700 : 500,
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.15s",
            }}
        >
            {label}
        </button>
    );
}

function generatePageNumbers(current: number, total: number): number[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (current > 3) pages.push(-1); // ellipsis
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
    }
    if (current < total - 2) pages.push(-1); // ellipsis
    pages.push(total);
    return pages;
}

const statBadge: React.CSSProperties = {
    padding: "4px 10px", borderRadius: 8,
    background: "#f0fdf4", border: "1px solid #bbf7d0",
    fontWeight: 600,
};
