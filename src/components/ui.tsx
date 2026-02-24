export function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
    const sizes = { sm: "0.85rem", md: "1rem", lg: "1.3rem" };
    return (
        <span className="stars" style={{ fontSize: sizes[size] }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={`star ${i <= rating ? "filled" : ""}`}>★</span>
            ))}
        </span>
    );
}

export function AverageRating({ avg, count }: { avg: number; count: number }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--foreground)" }}>{avg.toFixed(1)}</span>
            <div>
                <StarRating rating={Math.round(avg)} size="md" />
                <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{count}件のレビュー</div>
            </div>
        </div>
    );
}

export function CategoryTag({ category }: { category: string | null }) {
    if (!category) return null;
    const cls = category === "殺虫剤" ? "tag-insecticide" : category === "殺菌剤" ? "tag-fungicide" : category === "除草剤" ? "tag-herbicide" : "";
    return <span className={`tag ${cls}`}>{category}</span>;
}

export function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
    const colors = ["#2d6a4f", "#40916c", "#52b788", "#95d5b2", "#b7e4c7"];
    return (
        <div className={`avatar ${size === "lg" ? "avatar-lg" : ""}`} style={{ background: colors[name.charCodeAt(0) % colors.length] }}>
            {name.charAt(0)}
        </div>
    );
}

export function FarmBadge({ farmType, region }: { farmType?: string | null; region?: string | null }) {
    if (!farmType && !region) return null;
    return (
        <span className="farm-badge">
            🌱 {farmType}{region ? ` · ${region}` : ""}
        </span>
    );
}

export function SeasonBadge({ season }: { season: string }) {
    const emoji = season.includes("春") ? "🌸" : season.includes("夏") ? "☀️" : season.includes("秋") ? "🍂" : season.includes("冬") ? "❄️" : "📅";
    return <span className="farm-badge">{emoji} {season}</span>;
}

export function StatusBadge({ status }: { status: string }) {
    const cls = status === "PENDING" ? "status-pending" : status === "RESOLVED" ? "status-resolved" : "status-dismissed";
    const label = status === "PENDING" ? "未対応" : status === "RESOLVED" ? "対応済み" : "却下";
    return <span className={`visibility-badge ${cls}`}>{label}</span>;
}
