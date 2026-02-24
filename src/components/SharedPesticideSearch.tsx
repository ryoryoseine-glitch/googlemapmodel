"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import SearchFilters from "@/components/SearchFilters";
import PesticideList from "@/components/PesticideList";
import BarcodeScannerModal from "@/components/BarcodeScannerModal";
import type { PesticideSearchResult, SearchFiltersState } from "@/types/maff";

const LIMIT = 30;

interface Props {
    onSelect?: (pesticide: PesticideSearchResult) => void;
    actionLabel?: string;
    hideHeader?: boolean;
    initialFilters?: Partial<SearchFiltersState>;
}

export default function SharedPesticideSearch({ onSelect, actionLabel, hideHeader, initialFilters }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialize from URL or props
    const getInitialFilters = (): SearchFiltersState => {
        const urlKeyword = searchParams.get("keyword");
        const urlCrops = searchParams.get("crops");
        const urlPurposes = searchParams.get("purposes");
        const urlPests = searchParams.get("pests");

        // If URL has any params, prefer them
        if (urlKeyword !== null || urlCrops !== null || urlPurposes !== null || urlPests !== null) {
            return {
                keyword: urlKeyword || "",
                crops: urlCrops ? urlCrops.split(",").filter(Boolean) : [],
                purposes: urlPurposes ? urlPurposes.split(",").filter(Boolean) : [],
                pests: urlPests ? urlPests.split(",").filter(Boolean) : [],
            };
        }

        // Otherwise use props or defaults
        return {
            keyword: initialFilters?.keyword || "",
            crops: initialFilters?.crops || [],
            purposes: initialFilters?.purposes || [],
            pests: initialFilters?.pests || [],
        };
    };

    const [filters, setFilters] = useState<SearchFiltersState>(getInitialFilters());
    const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
    const [results, setResults] = useState<PesticideSearchResult[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    // Barcode scanner & mobile drawer state
    const [showScanner, setShowScanner] = useState(false);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const hasFilters = !!(filters.keyword || filters.crops.length > 0 || filters.purposes.length > 0 || filters.pests.length > 0);

    // Sync state to URL 
    useEffect(() => {
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        let changed = false;

        const setOrDelete = (key: string, value: string) => {
            if (value && currentParams.get(key) !== value) {
                currentParams.set(key, value);
                changed = true;
            } else if (!value && currentParams.has(key)) {
                currentParams.delete(key);
                changed = true;
            }
        };

        setOrDelete("keyword", filters.keyword);
        setOrDelete("crops", filters.crops.join(","));
        setOrDelete("purposes", filters.purposes.join(","));
        setOrDelete("pests", filters.pests.join(","));
        setOrDelete("page", page > 1 ? String(page) : "");

        if (changed) {
            const newUrl = currentParams.toString() ? `${pathname}?${currentParams.toString()}` : pathname;
            router.replace(newUrl, { scroll: false });
        }
    }, [filters, page, pathname, router, searchParams]);

    const fetchResults = useCallback(async (f: SearchFiltersState, p: number) => {
        if (!f.keyword && f.crops.length === 0 && f.purposes.length === 0 && f.pests.length === 0) {
            setResults([]);
            setTotal(0);
            setLoading(false); // Ensure loading is set to false even if no filters
            return;
        }
        setLoading(true);
        const params = new URLSearchParams();
        if (f.keyword) params.set("keyword", f.keyword);
        if (f.crops.length > 0) params.set("crops", f.crops.join(","));
        if (f.purposes.length > 0) params.set("purposes", f.purposes.join(","));
        if (f.pests.length > 0) params.set("pests", f.pests.join(","));
        params.set("page", String(p));
        params.set("limit", String(LIMIT));

        try {
            const res = await fetch(`/api/maff/search?${params}`);
            const data = await res.json();
            setResults(data.results || []);
            setTotal(data.total || 0);
        } catch {
            setResults([]);
            setTotal(0);
        }
        setLoading(false);
    }, []);

    // Debounce for keyword, instant for checkboxes
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const delay = filters.keyword ? 500 : 50;
        debounceRef.current = setTimeout(() => {
            fetchResults(filters, page);
        }, delay);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [filters, page, fetchResults]);

    const handleFiltersChange = (newFilters: SearchFiltersState) => {
        setFilters(newFilters);
        setPage(1);
    };

    const updateFilter = (key: keyof SearchFiltersState, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    // Build active filter badges
    const badges: { label: string; icon: string; color: string; onRemove: () => void }[] = [];
    if (filters.keyword) {
        badges.push({
            label: `"${filters.keyword}"`, icon: "🔎", color: "#6366f1",
            onRemove: () => handleFiltersChange({ ...filters, keyword: "" }),
        });
    }
    for (const crop of filters.crops) {
        badges.push({
            label: crop, icon: "🌱", color: "#16a34a",
            onRemove: () => handleFiltersChange({ ...filters, crops: filters.crops.filter(c => c !== crop) }),
        });
    }
    for (const purpose of filters.purposes) {
        badges.push({
            label: purpose, icon: "🎯", color: PURPOSE_BADGE_COLORS[purpose] || "#6b7280",
            onRemove: () => handleFiltersChange({ ...filters, purposes: filters.purposes.filter(p => p !== purpose) }),
        });
    }
    for (const pest of filters.pests) {
        badges.push({
            label: pest, icon: "🐛", color: "#b91c1c",
            onRemove: () => handleFiltersChange({ ...filters, pests: filters.pests.filter(p => p !== pest) }),
        });
    }

    return (
        <div style={{ width: "100%" }}>
            {/* Header / Keyword & Scanner */}
            {!hideHeader && (
                <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 12 }}>🔍 農薬を検索する</h2>
                    <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ flex: 1, position: "relative" }}>
                            <span style={{ position: "absolute", left: 16, top: 14, color: "var(--muted)" }}>🔍</span>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="農薬名、メーカー名、適用作物など"
                                value={filters.keyword}
                                onChange={(e) => updateFilter("keyword", e.target.value)}
                                style={{ paddingLeft: 44, fontSize: "1.05rem", padding: "14px 14px 14px 44px" }}
                            />
                        </div>
                        <button
                            className="btn-secondary"
                            onClick={() => setShowScanner(true)}
                            title="バーコード読取"
                            style={{ width: 52, height: 52, padding: 0, justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}
                        >
                            📷
                        </button>
                    </div>
                </div>
            )}

            {/* Same applied if hideHeader is true, we still need a keyword search and scanner here */}
            {hideHeader && (
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <div style={{ flex: 1, position: "relative" }}>
                        <span style={{ position: "absolute", left: 16, top: 14, color: "var(--muted)" }}>🔍</span>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="農薬名で検索..."
                            value={filters.keyword}
                            onChange={(e) => updateFilter("keyword", e.target.value)}
                            style={{ paddingLeft: 44, fontSize: "1rem", padding: "12px 14px 12px 44px" }}
                        />
                    </div>
                    <button
                        className="btn-secondary"
                        onClick={() => setShowScanner(true)}
                        title="バーコード読取"
                        style={{ width: 48, height: 48, padding: 0, justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}
                    >
                        📷
                    </button>
                </div>
            )}

            {showScanner && (
                <BarcodeScannerModal
                    onClose={() => setShowScanner(false)}
                    onScan={(kw) => {
                        updateFilter("keyword", kw);
                        setShowScanner(false);
                    }}
                />
            )}
            {/* Active filter badges */}
            {badges.length > 0 && (
                <div style={{
                    display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14,
                    padding: "8px 14px", borderRadius: 10,
                    background: "white", border: "1px solid var(--border)",
                    fontSize: "0.78rem", alignItems: "center",
                }}>
                    <span style={{ fontWeight: 700, color: "var(--muted)", fontSize: "0.68rem" }}>現在：</span>
                    {badges.map((b, i) => (
                        <span
                            key={`${b.icon}-${b.label}-${i}`}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 3,
                                padding: "2px 9px", borderRadius: 100,
                                background: `${b.color}10`, color: b.color,
                                border: `1px solid ${b.color}30`,
                                fontWeight: 700, fontSize: "0.7rem",
                            }}
                        >
                            {b.icon} {b.label}
                            <button
                                onClick={b.onRemove}
                                style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    color: "inherit", fontSize: "0.6rem", padding: "0 1px", opacity: 0.7,
                                }}
                            >✕</button>
                        </span>
                    ))}
                    {badges.length > 1 && (
                        <button
                            onClick={() => { setFilters({ keyword: "", crops: [], purposes: [], pests: [] }); setPage(1); }}
                            style={{
                                marginLeft: "auto", background: "none", border: "none",
                                color: "var(--muted)", fontSize: "0.68rem", cursor: "pointer",
                                textDecoration: "underline",
                            }}
                        >
                            全解除
                        </button>
                    )}
                </div>
            )}

            {/* Mobile Filter Toggle Button */}
            <div className="mobile-only" style={{ marginBottom: 16 }}>
                <button
                    className="btn-secondary"
                    onClick={() => setIsFilterDrawerOpen(true)}
                    style={{ width: "100%", justifyContent: "center", padding: "12px", borderRadius: 12 }}
                >
                    <span style={{ fontSize: "1.1rem" }}>🔍</span> 絞り込みフィルター
                    {hasFilters && (
                        <span style={{
                            marginLeft: 8, padding: "2px 8px", borderRadius: 100,
                            background: "var(--primary)", color: "white",
                            fontSize: "0.75rem", fontWeight: 700,
                        }}>
                            適用中
                        </span>
                    )}
                </button>
            </div>

            {/* Main layout */}
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexDirection: "row" }} className="search-layout">
                <style>{`
                    @media (max-width: 768px) {
                        .search-layout { flex-direction: column !important; }
                        .search-layout > aside { width: 100% !important; position: static !important; max-height: none !important; }
                    }
                `}</style>
                <SearchFilters
                    filters={filters}
                    onChange={handleFiltersChange}
                    isDrawerOpen={isFilterDrawerOpen}
                    onCloseDrawer={() => setIsFilterDrawerOpen(false)}
                />
                <PesticideList
                    results={results}
                    total={total}
                    loading={loading}
                    hasFilters={hasFilters}
                    page={page}
                    limit={LIMIT}
                    onPageChange={(p) => setPage(p)}
                    onSelect={onSelect}
                    actionLabel={actionLabel}
                />
            </div>
        </div>
    );
}

const PURPOSE_BADGE_COLORS: Record<string, string> = {
    "殺虫剤": "#dc2626", "殺菌剤": "#2563eb", "除草剤": "#16a34a",
    "殺虫殺菌剤": "#9333ea", "植物成長調整剤": "#d97706",
};
