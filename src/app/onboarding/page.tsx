"use client";

import { saveProfile } from "@/app/actions/profile";
import { useState, useEffect, useMemo } from "react";

type Category = { id: string; name: string; _count: { items: number } };
type CropItem = { id: string; categoryId: string; nameJa: string; synonyms: string | null };

const PREFECTURES = [
    { code: "01", name: "北海道" }, { code: "02", name: "青森県" }, { code: "03", name: "岩手県" },
    { code: "04", name: "宮城県" }, { code: "05", name: "秋田県" }, { code: "06", name: "山形県" },
    { code: "07", name: "福島県" }, { code: "08", name: "茨城県" }, { code: "09", name: "栃木県" },
    { code: "10", name: "群馬県" }, { code: "11", name: "埼玉県" }, { code: "12", name: "千葉県" },
    { code: "13", name: "東京都" }, { code: "14", name: "神奈川県" }, { code: "15", name: "新潟県" },
    { code: "16", name: "富山県" }, { code: "17", name: "石川県" }, { code: "18", name: "福井県" },
    { code: "19", name: "山梨県" }, { code: "20", name: "長野県" }, { code: "21", name: "岐阜県" },
    { code: "22", name: "静岡県" }, { code: "23", name: "愛知県" }, { code: "24", name: "三重県" },
    { code: "25", name: "滋賀県" }, { code: "26", name: "京都府" }, { code: "27", name: "大阪府" },
    { code: "28", name: "兵庫県" }, { code: "29", name: "奈良県" }, { code: "30", name: "和歌山県" },
    { code: "31", name: "鳥取県" }, { code: "32", name: "島根県" }, { code: "33", name: "岡山県" },
    { code: "34", name: "広島県" }, { code: "35", name: "山口県" }, { code: "36", name: "徳島県" },
    { code: "37", name: "香川県" }, { code: "38", name: "愛媛県" }, { code: "39", name: "高知県" },
    { code: "40", name: "福岡県" }, { code: "41", name: "佐賀県" }, { code: "42", name: "長崎県" },
    { code: "43", name: "熊本県" }, { code: "44", name: "大分県" }, { code: "45", name: "宮崎県" },
    { code: "46", name: "鹿児島県" }, { code: "47", name: "沖縄県" },
];
const AREA_SCALES = ["<1", "1-5", "5-10", "10-20", "20-30", "30-50", "50-100", "100+"];

export default function OnboardingPage() {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Crop Categories & Items
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
    const [itemsByCategory, setItemsByCategory] = useState<Record<string, CropItem[]>>({});
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [primaryItemId, setPrimaryItemId] = useState("");
    const [itemSearch, setItemSearch] = useState("");

    // Region
    const [prefCode, setPrefCode] = useState("");
    const [areaQuadrant, setAreaQuadrant] = useState("");
    const [areaScale, setAreaScale] = useState("");

    // Area quadrant labels (mappable per-prefecture in the future)
    const AREA_QUADRANTS = [
        { value: "north", label: "県北" },
        { value: "central", label: "県央" },
        { value: "south", label: "県南" },
        { value: "east", label: "県東" },
        { value: "west", label: "県西" },
    ];

    // Load categories on mount
    useEffect(() => {
        fetch("/api/crops").then(r => r.json()).then(setCategories);
    }, []);

    // Load items when categories change
    useEffect(() => {
        selectedCatIds.forEach(catId => {
            if (!itemsByCategory[catId]) {
                fetch(`/api/crops?categoryId=${catId}`)
                    .then(r => r.json())
                    .then(items => setItemsByCategory(prev => ({ ...prev, [catId]: items })));
            }
        });
    }, [selectedCatIds]);

    // All visible items for selected categories
    const visibleItems = useMemo(() => {
        const all: CropItem[] = [];
        for (const catId of selectedCatIds) {
            if (itemsByCategory[catId]) all.push(...itemsByCategory[catId]);
        }
        if (!itemSearch) return all;
        const q = itemSearch.toLowerCase();
        return all.filter(item => {
            if (item.nameJa.toLowerCase().includes(q)) return true;
            if (item.synonyms) {
                try {
                    const syns: string[] = JSON.parse(item.synonyms);
                    return syns.some(s => s.toLowerCase().includes(q));
                } catch { return false; }
            }
            return false;
        });
    }, [selectedCatIds, itemsByCategory, itemSearch]);

    // Selected items for primary selection
    const selectedItems = useMemo(() => {
        const all: CropItem[] = [];
        for (const catId of selectedCatIds) {
            if (itemsByCategory[catId]) {
                all.push(...itemsByCategory[catId].filter(i => selectedItemIds.includes(i.id)));
            }
        }
        return all;
    }, [selectedCatIds, itemsByCategory, selectedItemIds]);

    const toggleCategory = (catId: string) => {
        setSelectedCatIds(prev =>
            prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
        );
    };

    const toggleItem = (itemId: string) => {
        setSelectedItemIds(prev => {
            const next = prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId];
            // Clear primary if removed
            if (!next.includes(primaryItemId)) setPrimaryItemId("");
            return next;
        });
    };

    const canSubmit = selectedCatIds.length > 0 && selectedItemIds.length > 0 && primaryItemId && prefCode && areaQuadrant && areaScale;

    const handleSubmit = async (formData: FormData) => {
        setSubmitting(true);
        setError(null);
        try {
            const result = await saveProfile(formData);
            if (result && result.error) {
                setError(result.error);
                setSubmitting(false);
            }
        } catch (e) {
            setError("エラーが発生しました。");
            setSubmitting(false);
        }
    };

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "40px 20px" }}>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
                <div className="card" style={{ padding: "40px 36px" }}>
                    <div style={{ textAlign: "center", marginBottom: 36 }}>
                        <span style={{ fontSize: "2.5rem" }}>👩‍🌾</span>
                        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "12px 0 6px" }}>プロフィール登録</h1>
                        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                            あなたの農園について教えてください。おすすめの農薬情報をお届けします。
                        </p>
                    </div>

                    <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                        {error && (
                            <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px", borderRadius: 8, fontSize: "0.9rem", border: "1px solid #fca5a5" }}>
                                {error}
                            </div>
                        )}
                        {/* Hidden fields for server action */}
                        <input type="hidden" name="cropCategoryIds" value={JSON.stringify(selectedCatIds)} />
                        <input type="hidden" name="cropItemIds" value={JSON.stringify(selectedItemIds)} />
                        <input type="hidden" name="primaryCropItemId" value={primaryItemId} />
                        <input type="hidden" name="prefCode" value={prefCode} />
                        <input type="hidden" name="areaQuadrant" value={areaQuadrant} />

                        {/* ===== SECTION 1: Account Info ===== */}
                        <section>
                            <h2 style={sectionTitle}>👤 基本情報</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <div>
                                    <label className="form-label">表示名</label>
                                    <input name="name" className="form-input" required placeholder="例：山田 太郎" />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                                    <div>
                                        <label className="form-label">メールアドレス</label>
                                        <input name="email" type="email" className="form-input" required placeholder="name@example.com" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ===== SECTION 2: Crop Category ===== */}
                        <section>
                            <h2 style={sectionTitle}>🌽 作物カテゴリ（複数選択可）</h2>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => toggleCategory(cat.id)}
                                        style={{
                                            padding: "8px 16px", borderRadius: 100, border: "1.5px solid",
                                            cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
                                            transition: "all 0.15s",
                                            ...(selectedCatIds.includes(cat.id)
                                                ? { background: "var(--primary)", color: "white", borderColor: "var(--primary)" }
                                                : { background: "white", color: "#374151", borderColor: "#d1d5db" }
                                            ),
                                        }}
                                    >
                                        {cat.name}
                                        <span style={{ fontSize: "0.7rem", opacity: 0.7, marginLeft: 4 }}>({cat._count.items})</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* ===== SECTION 3: Crop Items ===== */}
                        {selectedCatIds.length > 0 && (
                            <section>
                                <h2 style={sectionTitle}>🌱 品目を選択（複数選択可）</h2>
                                {/* Search */}
                                <div style={{ marginBottom: 14 }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="🔍 品目名で検索..."
                                        value={itemSearch}
                                        onChange={(e) => setItemSearch(e.target.value)}
                                        style={{ fontSize: "0.9rem" }}
                                    />
                                </div>
                                {/* Selected count */}
                                {selectedItemIds.length > 0 && (
                                    <div style={{ marginBottom: 12, fontSize: "0.8rem", color: "var(--primary-dark)", fontWeight: 700 }}>
                                        ✅ {selectedItemIds.length}品目を選択中
                                    </div>
                                )}
                                {/* Item grid */}
                                <div style={{
                                    maxHeight: 300, overflowY: "auto", border: "1px solid var(--border)",
                                    borderRadius: 12, padding: 12, background: "#fafbfc"
                                }}>
                                    {selectedCatIds.map(catId => {
                                        const catName = categories.find(c => c.id === catId)?.name;
                                        const items = (itemsByCategory[catId] || []).filter(item => {
                                            if (!itemSearch) return true;
                                            const q = itemSearch.toLowerCase();
                                            if (item.nameJa.toLowerCase().includes(q)) return true;
                                            if (item.synonyms) {
                                                try {
                                                    const syns: string[] = JSON.parse(item.synonyms);
                                                    return syns.some(s => s.toLowerCase().includes(q));
                                                } catch { return false; }
                                            }
                                            return false;
                                        });
                                        if (items.length === 0) return null;
                                        return (
                                            <div key={catId} style={{ marginBottom: 16 }}>
                                                <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--muted)", marginBottom: 8, textTransform: "uppercase" }}>
                                                    {catName}
                                                </div>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                                    {items.map(item => {
                                                        const isSelected = selectedItemIds.includes(item.id);
                                                        return (
                                                            <label
                                                                key={item.id}
                                                                style={{
                                                                    display: "flex", alignItems: "center", gap: 6,
                                                                    padding: "5px 12px", borderRadius: 8, cursor: "pointer",
                                                                    fontSize: "0.85rem", border: "1px solid",
                                                                    transition: "all 0.1s",
                                                                    ...(isSelected
                                                                        ? { background: "#ecfdf5", borderColor: "#10b981", color: "#065f46", fontWeight: 600 }
                                                                        : { background: "white", borderColor: "#e5e7eb", color: "#374151" }
                                                                    )
                                                                }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleItem(item.id)}
                                                                    style={{ accentColor: "#10b981" }}
                                                                />
                                                                {item.nameJa}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* ===== SECTION 4: Primary Crop ===== */}
                        {selectedItems.length > 0 && (
                            <section>
                                <h2 style={sectionTitle}>⭐ 主品目（1つ選択）</h2>
                                <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 12 }}>
                                    ホーム画面のおすすめ表示に使用されます
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {selectedItems.map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setPrimaryItemId(item.id)}
                                            style={{
                                                padding: "8px 18px", borderRadius: 100, border: "2px solid",
                                                cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
                                                transition: "all 0.15s",
                                                ...(primaryItemId === item.id
                                                    ? { background: "#fef3c7", borderColor: "#f59e0b", color: "#92400e" }
                                                    : { background: "white", borderColor: "#d1d5db", color: "#374151" }
                                                ),
                                            }}
                                        >
                                            {primaryItemId === item.id && "⭐ "}{item.nameJa}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ===== SECTION 5: Region & Scale ===== */}
                        <section>
                            <h2 style={sectionTitle}>📍 地域・規模</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                        <label className="form-label">都道府県</label>
                                        <select
                                            className="form-input"
                                            required
                                            value={prefCode}
                                            onChange={(e) => { setPrefCode(e.target.value); setAreaQuadrant(""); }}
                                        >
                                            <option value="" disabled>選択してください</option>
                                            {PREFECTURES.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">栽培規模</label>
                                        <select
                                            name="areaScale"
                                            className="form-input"
                                            required
                                            value={areaScale}
                                            onChange={(e) => setAreaScale(e.target.value)}
                                        >
                                            <option value="" disabled>選択してください</option>
                                            {AREA_SCALES.map(s => <option key={s} value={s}>{s} ha</option>)}
                                        </select>
                                    </div>
                                </div>
                                {/* Area Quadrant selection */}
                                {prefCode && (
                                    <div>
                                        <label className="form-label">県内エリア</label>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                                            {AREA_QUADRANTS.map(q => (
                                                <button
                                                    key={q.value}
                                                    type="button"
                                                    onClick={() => setAreaQuadrant(q.value)}
                                                    style={{
                                                        padding: "10px 8px", borderRadius: 10, border: "2px solid",
                                                        cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
                                                        transition: "all 0.15s", textAlign: "center",
                                                        ...(areaQuadrant === q.value
                                                            ? { background: "var(--primary)", color: "white", borderColor: "var(--primary)" }
                                                            : { background: "white", color: "#374151", borderColor: "#d1d5db" }
                                                        ),
                                                    }}
                                                >
                                                    {q.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ===== SUBMIT ===== */}
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={submitting || !canSubmit}
                            style={{
                                padding: 16, fontSize: "1.05rem", justifyContent: "center",
                                opacity: canSubmit ? 1 : 0.5,
                            }}
                        >
                            {submitting ? "登録中..." : "登録を完了して始める"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

const sectionTitle: React.CSSProperties = {
    fontSize: "1.05rem", fontWeight: 800, marginBottom: 14, paddingBottom: 8,
    borderBottom: "2px solid var(--primary-light)"
};
