// Rank system — designed for future DB migration
// Currently computed from review count + total likes

export type RankKey = "bronze" | "silver" | "gold" | "platinum";

export interface RankInfo {
    key: RankKey;
    label: string;
    icon: string;
    color: string;
    bgColor: string;
    minReviews: number;
    minLikes: number;
}

const RANKS: RankInfo[] = [
    { key: "platinum", label: "プラチナ", icon: "💎", color: "#6d28d9", bgColor: "#ede9fe", minReviews: 30, minLikes: 50 },
    { key: "gold", label: "ゴールド", icon: "🥇", color: "#b45309", bgColor: "#fef3c7", minReviews: 10, minLikes: 0 },
    { key: "silver", label: "シルバー", icon: "🥈", color: "#475569", bgColor: "#f1f5f9", minReviews: 3, minLikes: 0 },
    { key: "bronze", label: "ブロンズ", icon: "🥉", color: "#92400e", bgColor: "#fef3c7", minReviews: 0, minLikes: 0 },
];

/**
 * Determine rank based on review count and total likes.
 * Platinum requires EITHER 30 reviews or 50 likes.
 */
export function getRank(reviewCount: number, totalLikes: number): RankInfo {
    for (const rank of RANKS) {
        if (rank.key === "platinum") {
            if (reviewCount >= rank.minReviews || totalLikes >= rank.minLikes) return rank;
        } else {
            if (reviewCount >= rank.minReviews) return rank;
        }
    }
    return RANKS[RANKS.length - 1]; // bronze fallback
}

/** Next rank info for progress display */
export function getNextRank(reviewCount: number, totalLikes: number): {
    nextRank: RankInfo | null;
    progressPercent: number;
    remaining: number;
} {
    const current = getRank(reviewCount, totalLikes);
    const idx = RANKS.indexOf(current);
    if (idx === 0) return { nextRank: null, progressPercent: 100, remaining: 0 };

    const next = RANKS[idx - 1];
    const target = next.minReviews;
    const progress = Math.min(100, Math.round((reviewCount / target) * 100));
    return { nextRank: next, progressPercent: progress, remaining: Math.max(0, target - reviewCount) };
}
