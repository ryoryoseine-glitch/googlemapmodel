"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { FilterOption, SearchFiltersState } from "@/types/maff";

interface Props {
    filters: SearchFiltersState;
    onChange: (filters: SearchFiltersState) => void;
    isDrawerOpen?: boolean;
    onCloseDrawer?: () => void;
}

export default function SearchFilters({ filters, onChange, isDrawerOpen, onCloseDrawer }: Props) {
    const [crops, setCrops] = useState<FilterOption[]>([]);
    const [purposes, setPurposes] = useState<FilterOption[]>([]);
    const [pests, setPests] = useState<FilterOption[]>([]);
    const [cropSearch, setCropSearch] = useState("");
    const [pestSearch, setPestSearch] = useState("");
    const [loadingCrops, setLoadingCrops] = useState(true);
    const [loadingPurposes, setLoadingPurposes] = useState(true);
    const [loadingPests, setLoadingPests] = useState(false);

    // Initial load for crops & purposes
    useEffect(() => {
        fetch("/api/maff/crops")
            .then(r => r.json())
            .then(data => { setCrops(data); setLoadingCrops(false); });
        fetch("/api/maff/purposes")
            .then(r => r.json())
            .then(data => { setPurposes(data); setLoadingPurposes(false); });
    }, []);

    // Dynamic load for pests based on selected crops
    useEffect(() => {
        if (filters.crops.length === 0) {
            setPests([]); // Clear pests if no crops selected
            return;
        }

        setLoadingPests(true);
        const params = new URLSearchParams();
        params.set("crops", filters.crops.join(","));

        fetch(`/api/maff/pests?${params}`)
            .then(r => r.json())
            .then(data => { setPests(data); setLoadingPests(false); })
            .catch(() => { setPests([]); setLoadingPests(false); });
    }, [filters.crops]);

    const toggleCrop = useCallback((name: string) => {
        const next = filters.crops.includes(name)
            ? filters.crops.filter(c => c !== name)
            : [...filters.crops, name];

        // When crops change, clear selected pests that may no longer be relevant
        // (A more advanced implementation would only remove pests that are no longer valid for the remaining crops)
        onChange({ ...filters, crops: next, pests: [] });
    }, [filters, onChange]);

    const togglePurpose = useCallback((name: string) => {
        const next = filters.purposes.includes(name)
            ? filters.purposes.filter(p => p !== name)
            : [...filters.purposes, name];
        onChange({ ...filters, purposes: next });
    }, [filters, onChange]);

    const togglePest = useCallback((name: string) => {
        const next = filters.pests.includes(name)
            ? filters.pests.filter(p => p !== name)
            : [...filters.pests, name];
        onChange({ ...filters, pests: next });
    }, [filters, onChange]);

    const filteredCrops = cropSearch
        ? crops.filter(c => c.name.includes(cropSearch))
        : crops;

    const filteredPests = pestSearch
        ? pests.filter(p => p.name.includes(pestSearch))
        : pests;

    const hasAnyFilter = filters.keyword || filters.crops.length > 0 || filters.purposes.length > 0;

    return (
        <>
            {/* Mobile Drawer Overlay Background */}
            {isDrawerOpen && (
                <div
                    className="mobile-only"
                    onClick={onCloseDrawer}
                    style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.4)", zIndex: 99,
                        backdropFilter: "blur(2px)",
                    }}
                />
            )}

            <aside
                className={`search-filters-aside ${isDrawerOpen ? "drawer-open" : ""}`}
                style={{
                    width: 300, flexShrink: 0,
                    position: "sticky", top: 80, alignSelf: "flex-start",
                    display: "flex", flexDirection: "column", gap: 12,
                }}
            >
                <style>{`
                    .search-filters-aside {
                        max-height: calc(100vh - 100px);
                        overflow-y: auto;
                    }
                    @media (max-width: 768px) {
                        .search-filters-aside {
                            position: fixed !important;
                            bottom: 0 !important;
                            left: 0 !important;
                            right: 0 !important;
                            top: auto !important;
                            width: 100% !important;
                            max-height: 85vh !important;
                            background: var(--background);
                            padding: 20px;
                            border-top-left-radius: 24px;
                            border-top-right-radius: 24px;
                            box-shadow: 0 -4px 24px rgba(0,0,0,0.15);
                            z-index: 100;
                            transform: translateY(110%);
                            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                        }
                        .search-filters-aside.drawer-open {
                            transform: translateY(0);
                        }
                    }
                `}</style>

                {/* Mobile Drawer Header */}
                <div className="mobile-only" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>絞り込み条件</h3>
                    <button
                        onClick={onCloseDrawer}
                        style={{
                            background: "var(--surface-hover)", border: "none",
                            width: 32, height: 32, borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1rem", cursor: "pointer"
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Keyword */}
                <div className="card" style={{ padding: "16px 18px" }}>
                    <SectionLabel icon="🔎" label="キーワード検索" />
                    <IMEInput
                        placeholder="農薬名・メーカー・有効成分..."
                        value={filters.keyword}
                        onChange={v => onChange({ ...filters, keyword: v })}
                    />
                </div>

                {/* Purpose checkboxes */}
                <div className="card" style={{ padding: "16px 18px" }}>
                    <SectionLabel icon="🎯" label="使用目的" count={filters.purposes.length} />
                    {loadingPurposes ? (
                        <p style={loadingStyle}>読み込み中...</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {purposes.map(p => (
                                <CheckboxItem
                                    key={p.name}
                                    label={p.name}
                                    count={p.count}
                                    checked={filters.purposes.includes(p.name)}
                                    onChange={() => togglePurpose(p.name)}
                                    color={PURPOSE_COLORS[p.name] || "#6b7280"}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Crop checkboxes */}
                <div className="card" style={{ padding: "16px 18px" }}>
                    <SectionLabel icon="🌱" label="適用作物" count={filters.crops.length} />
                    <IMEInput
                        placeholder="作物名で検索..."
                        value={cropSearch}
                        onChange={setCropSearch}
                        small
                    />
                    {loadingCrops ? (
                        <p style={loadingStyle}>読み込み中...</p>
                    ) : (
                        <div style={{
                            maxHeight: 260, overflowY: "auto", marginTop: 6,
                            display: "flex", flexDirection: "column", gap: 1,
                        }}>
                            {filteredCrops.slice(0, 60).map(c => (
                                <CheckboxItem
                                    key={c.name}
                                    label={c.name}
                                    count={c.count}
                                    checked={filters.crops.includes(c.name)}
                                    onChange={() => toggleCrop(c.name)}
                                    color="#16a34a"
                                />
                            ))}
                            {filteredCrops.length > 60 && (
                                <p style={{ fontSize: "0.68rem", color: "var(--muted)", padding: "4px 0", textAlign: "center" }}>
                                    他 {filteredCrops.length - 60} 件...テキストで絞り込めます
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Pest checkboxes (Dynamic based on crops) */}
                <div className="card" style={{ padding: "16px 18px" }}>
                    <SectionLabel icon="🐛" label="適用病害虫" count={filters.pests.length} />

                    {filters.crops.length === 0 ? (
                        <div style={{
                            padding: "16px 12px", background: "#f9fafb", border: "1px dashed #d1d5db",
                            borderRadius: 8, textAlign: "center", fontSize: "0.78rem", color: "var(--muted)"
                        }}>
                            ☝️ 先に上の「適用作物」を選択してください。<br />選択した作物に使用できる病害虫が表示されます。
                        </div>
                    ) : (
                        <>
                            <IMEInput
                                placeholder="病害虫名で検索..."
                                value={pestSearch}
                                onChange={setPestSearch}
                                small
                            />
                            {loadingPests ? (
                                <p style={loadingStyle}>読み込み中...</p>
                            ) : (
                                <div style={{
                                    maxHeight: 260, overflowY: "auto", marginTop: 6,
                                    display: "flex", flexDirection: "column", gap: 1,
                                }}>
                                    {filteredPests.slice(0, 60).map(p => (
                                        <CheckboxItem
                                            key={p.name}
                                            label={p.name}
                                            count={p.count}
                                            checked={filters.pests.includes(p.name)}
                                            onChange={() => togglePest(p.name)}
                                            color="#b91c1c" // darker red for pests
                                        />
                                    ))}
                                    {filteredPests.length > 60 && (
                                        <p style={{ fontSize: "0.68rem", color: "var(--muted)", padding: "4px 0", textAlign: "center" }}>
                                            他 {filteredPests.length - 60} 件...テキストで絞り込めます
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Clear all */}
                {hasAnyFilter && (
                    <button
                        onClick={() => { onChange({ keyword: "", crops: [], purposes: [], pests: [] }); setCropSearch(""); setPestSearch(""); }}
                        className="card"
                        style={{
                            padding: "10px 18px", border: "1px solid #fecaca",
                            background: "#fff5f5", cursor: "pointer",
                            fontSize: "0.78rem", color: "#dc2626", fontWeight: 600,
                            textAlign: "center", transition: "background 0.15s",
                            marginTop: 8
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#fff5f5")}
                    >
                        🗑 すべての条件をクリア
                    </button>
                )}

                {/* Mobile Drawer Apply Button */}
                <div className="mobile-only" style={{ marginTop: 16, marginBottom: "env(safe-area-inset-bottom, 16px)" }}>
                    <button
                        className="btn-primary"
                        onClick={onCloseDrawer}
                        style={{ width: "100%", justifyContent: "center", padding: "14px" }}
                    >
                        条件を適用して閉じる
                    </button>
                </div>
            </aside>
        </>
    );
}

// ─── Sub-components ────────────────────────

function SectionLabel({ icon, label, count }: { icon: string; label: string; count?: number }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: "0.9rem" }}>{icon}</span>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--primary-dark)" }}>{label}</span>
            {count !== undefined && count > 0 && (
                <span style={{
                    marginLeft: "auto", padding: "1px 7px", borderRadius: 100,
                    background: "var(--primary)", color: "white",
                    fontSize: "0.65rem", fontWeight: 700,
                }}>
                    {count}
                </span>
            )}
        </div>
    );
}

function CheckboxItem({
    label, count, checked, onChange, color,
}: {
    label: string; count: number; checked: boolean; onChange: () => void; color: string;
}) {
    return (
        <label
            style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 8px", borderRadius: 6, cursor: "pointer",
                background: checked ? `${color}10` : "transparent",
                transition: "background 0.1s",
                fontSize: "0.78rem",
            }}
            onMouseEnter={e => { if (!checked) (e.currentTarget.style.background = "#f9fafb"); }}
            onMouseLeave={e => { if (!checked) (e.currentTarget.style.background = "transparent"); }}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                style={{
                    width: 15, height: 15, borderRadius: 3,
                    accentColor: color, cursor: "pointer", flexShrink: 0,
                }}
            />
            <span style={{
                flex: 1, fontWeight: checked ? 700 : 400,
                color: checked ? color : "inherit",
            }}>
                {label}
            </span>
            <span style={{ fontSize: "0.62rem", color: "var(--muted)", flexShrink: 0 }}>
                {count}
            </span>
        </label>
    );
}

/** IME-aware text input — won't break Japanese composition */
function IMEInput({
    placeholder, value, onChange, small,
}: {
    placeholder: string; value: string; onChange: (v: string) => void; small?: boolean;
}) {
    const [local, setLocal] = useState(value);
    const composing = useRef(false);

    if (!composing.current && local !== value) setLocal(value);

    return (
        <div style={{ position: "relative" }}>
            <input
                type="text"
                className="form-input"
                placeholder={placeholder}
                value={local}
                onCompositionStart={() => { composing.current = true; }}
                onCompositionEnd={e => {
                    composing.current = false;
                    onChange((e.target as HTMLInputElement).value);
                }}
                onChange={e => {
                    setLocal(e.target.value);
                    if (!composing.current) onChange(e.target.value);
                }}
                style={{
                    fontSize: small ? "0.76rem" : "0.82rem",
                    paddingRight: local ? 28 : 10,
                    borderColor: local ? "var(--primary)" : undefined,
                    background: local ? "#f0fdf4" : undefined,
                }}
            />
            {local && (
                <button
                    onClick={() => { setLocal(""); onChange(""); }}
                    style={{
                        position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                        width: 16, height: 16, borderRadius: "50%",
                        border: "none", background: "#d1d5db", color: "white",
                        cursor: "pointer", fontSize: "0.55rem",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >✕</button>
            )}
        </div>
    );
}

const PURPOSE_COLORS: Record<string, string> = {
    "殺虫剤": "#dc2626",
    "殺菌剤": "#2563eb",
    "除草剤": "#16a34a",
    "殺虫殺菌剤": "#9333ea",
    "植物成長調整剤": "#d97706",
    "殺そ剤": "#6b7280",
};

const loadingStyle: React.CSSProperties = {
    fontSize: "0.72rem", color: "var(--muted)", margin: 0,
};
