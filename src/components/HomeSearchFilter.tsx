"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";

type PesticideResult = {
    id: string;
    name: string;
    maker: string | null;
    category: string | null;
    imageUrl: string | null;
    avg: number;
    reviewCount: number;
};

type CropCategory = {
    id: string;
    name: string;
    _count: { items: number };
};

const PURPOSES = [
    { value: "", label: "すべて" },
    { value: "殺虫剤", label: "🐛 殺虫剤" },
    { value: "殺菌剤", label: "🦠 殺菌剤" },
    { value: "除草剤", label: "🌿 除草剤" },
];

export default function HomeSearchFilter() {
    const [query, setQuery] = useState("");
    const [purpose, setPurpose] = useState("");
    const [cropFilter, setCropFilter] = useState("");
    const [results, setResults] = useState<PesticideResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [cropCategories, setCropCategories] = useState<CropCategory[]>([]);

    // Load crop categories for filter
    useEffect(() => {
        fetch("/api/crops").then(r => r.json()).then(setCropCategories);
    }, []);

    // Debounced search
    const doSearch = useCallback(async (q: string, p: string, c: string) => {
        if (!q && !p && !c) {
            setResults([]);
            setHasSearched(false);
            return;
        }
        setLoading(true);
        setHasSearched(true);
        try {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (p) params.set("purpose", p);
            if (c) params.set("crop", c);
            const res = await fetch(`/api/pesticides/search?${params}`);
            const data = await res.json();
            setResults(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => doSearch(query, purpose, cropFilter), 300);
        return () => clearTimeout(t);
    }, [query, purpose, cropFilter, doSearch]);

    const categoryTagColor = (cat: string | null) => {
        if (cat === "殺虫剤") return { bg: "#fef2f2", color: "#dc2626" };
        if (cat === "殺菌剤") return { bg: "#eff6ff", color: "#2563eb" };
        if (cat === "除草剤") return { bg: "#f0fdf4", color: "#16a34a" };
        return { bg: "#f3f4f6", color: "#6b7280" };
    };

    return (
        <div style={{ marginBottom: 48 }}>
            {/* Search Bar */}
            <div style={{ maxWidth: 700, margin: "0 auto 20px" }}>
                <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontSize: "1.1rem", opacity: 0.5 }}>🔍</span>
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="農薬名・メーカー名で検索..."
                        className="form-input"
                        style={{
                            padding: "16px 20px 16px 48px",
                            fontSize: "1.05rem",
                            borderRadius: 16,
                            boxShadow: "0 4px 20px -4px rgba(0,0,0,0.08)",
                            border: "2px solid var(--border)",
                            transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                    />
                </div>
            </div>

            {/* Filters Row */}
            <div style={{ maxWidth: 700, margin: "0 auto 16px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                {/* Purpose buttons */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {PURPOSES.map(p => (
                        <button
                            key={p.value}
                            onClick={() => setPurpose(purpose === p.value ? "" : p.value)}
                            style={{
                                padding: "8px 16px",
                                borderRadius: 10,
                                border: "2px solid",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                transition: "all 0.15s",
                                ...(purpose === p.value
                                    ? { background: "var(--primary)", color: "white", borderColor: "var(--primary)" }
                                    : { background: "white", color: "#374151", borderColor: "#e5e7eb" }
                                ),
                            }}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Crop filter dropdown */}
                <select
                    value={cropFilter}
                    onChange={e => setCropFilter(e.target.value)}
                    style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: "2px solid #e5e7eb",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        background: cropFilter ? "var(--primary-light)" : "white",
                        color: cropFilter ? "white" : "#374151",
                        cursor: "pointer",
                        minWidth: 140,
                    }}
                >
                    <option value="">🌱 作物で絞る</option>
                    {cropCategories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Results */}
            {hasSearched && (
                <div style={{ maxWidth: 700, margin: "0 auto" }}>
                    {loading ? (
                        <div style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontSize: "0.9rem" }}>
                            検索中...
                        </div>
                    ) : results.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontSize: "0.9rem" }}>
                            該当する農薬が見つかりませんでした
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {results.map(p => {
                                const tagStyle = categoryTagColor(p.category);
                                return (
                                    <Link
                                        key={p.id}
                                        href={`/pesticides/${p.id}`}
                                        className="card"
                                        style={{
                                            padding: 20,
                                            textDecoration: "none",
                                            color: "inherit",
                                            display: "flex",
                                            flexDirection: "column",
                                            animation: "fadeIn 0.3s ease forwards",
                                        }}
                                    >
                                        {/* Product image placeholder */}
                                        <div style={{
                                            width: "100%",
                                            height: 100,
                                            background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                                            borderRadius: 10,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "2rem",
                                            marginBottom: 12,
                                        }}>
                                            🧪
                                        </div>

                                        <span style={{
                                            display: "inline-block",
                                            padding: "2px 8px",
                                            borderRadius: 4,
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            background: tagStyle.bg,
                                            color: tagStyle.color,
                                            alignSelf: "flex-start",
                                        }}>
                                            {p.category || "その他"}
                                        </span>
                                        <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: "6px 0 4px" }}>{p.name}</h3>
                                        {p.maker && <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0 }}>{p.maker}</p>}
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                                            <span className="stars" style={{ fontSize: "0.8rem" }}>
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <span key={i} className={`star ${i <= Math.round(p.avg) ? "filled" : ""}`}>★</span>
                                                ))}
                                            </span>
                                            <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{p.avg.toFixed(1)}</span>
                                            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>({p.reviewCount}件)</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
