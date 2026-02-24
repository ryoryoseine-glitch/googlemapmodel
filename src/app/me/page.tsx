import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getRegionDisplay } from "@/lib/regions";
import { getRank, getNextRank } from "@/lib/ranks";
import Link from "next/link";
import { Avatar, StarRating, CategoryTag } from "@/components/ui";
import { MyPesticideAdder } from "@/components/MyPesticideAdder";

export const dynamic = "force-dynamic";

export default async function MyPage() {
    const user = await getCurrentUser();
    if (!user) return <div>ログインしてください</div>;

    const [inventory, reviews, userBadges, profile] = await Promise.all([
        prisma.userPesticide.findMany({
            where: { userId: user.id },
            include: { pesticide: { include: { reviews: { select: { rating: true }, where: { isDraft: false } } } } }
        }),
        prisma.review.findMany({
            where: { userId: user.id, isDraft: false },
            include: { pesticide: true, likes: true },
            orderBy: { createdAt: "desc" }
        }),
        prisma.userBadge.findMany({
            where: { userId: user.id },
            include: { badge: true }
        }),
        prisma.farmProfile.findUnique({
            where: { userId: user.id }
        })
    ]);

    let primaryCropName = "";
    if (profile?.primaryCropItemId) {
        const item = await prisma.cropItem.findUnique({ where: { id: profile.primaryCropItemId } });
        primaryCropName = item?.nameJa || "";
    }

    const totalLikes = reviews.reduce((sum: number, r: any) => sum + r.likes.length, 0);
    const rank = getRank(reviews.length, totalLikes);
    const { nextRank, progressPercent, remaining } = getNextRank(reviews.length, totalLikes);

    return (
        <div className="container-wide" style={{ paddingTop: 40 }}>
            {/* Profile Header */}
            <div className="card" style={{ padding: 36, marginBottom: 32, background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 28, flexWrap: "wrap" }}>
                    <Avatar name={user.name} size={"lg"} />
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0 }}>{user.name}</h1>
                            {/* Rank badge */}
                            <span style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                padding: "4px 12px", borderRadius: 100,
                                fontSize: "0.78rem", fontWeight: 700,
                                background: rank.bgColor, color: rank.color,
                                border: `1.5px solid ${rank.color}20`,
                            }}>
                                {rank.icon} {rank.label}
                            </span>
                            {primaryCropName && (
                                <span style={{
                                    background: "#ecfdf5", color: "var(--primary-dark)",
                                    padding: "4px 12px", borderRadius: 100,
                                    fontSize: "0.78rem", fontWeight: 700,
                                }}>
                                    🌾 {primaryCropName}
                                </span>
                            )}
                        </div>

                        <div style={{ fontSize: "0.85rem", color: "#4a5568", marginBottom: 14 }}>
                            📍 {profile ? getRegionDisplay(profile.prefCode, profile.areaQuadrant) : "地域未登録"} • 📐 {profile?.areaScale || "-"} ha
                        </div>

                        {/* Rank progress */}
                        {nextRank && (
                            <div style={{ marginBottom: 14, maxWidth: 320 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--muted)", marginBottom: 4 }}>
                                    <span>次のランク: {nextRank.icon} {nextRank.label}</span>
                                    <span>あと{remaining}件のレビュー</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                                </div>
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                            <div>
                                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary)" }}>{reviews.length}</div>
                                <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>レビュー投稿</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary)" }}>{totalLikes}</div>
                                <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>👍 Good累計</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary)" }}>{userBadges.length}</div>
                                <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>バッジ獲得</div>
                            </div>
                        </div>
                    </div>
                    <Link href="/onboarding" className="btn-ghost" style={{ fontSize: "0.8rem" }}>
                        プロフィール編集
                    </Link>
                </div>

                {/* Badges */}
                {userBadges.length > 0 && (
                    <div style={{ marginTop: 28, display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                        {userBadges.map((ub: any) => (
                            <div key={ub.id} style={{
                                padding: "6px 14px", background: "#fff",
                                border: "1px solid var(--border)", borderRadius: 10,
                                display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                            }}>
                                <span style={{ fontSize: "1.1rem" }}>{ub.badge.iconEmoji}</span>
                                <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{ub.badge.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 36 }} className="home-grid">
                {/* Left: Reviews */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>📝 投稿したレビュー</h2>
                        <Link href="/reviews/new" className="btn-primary" style={{ fontSize: "0.8rem", padding: "8px 16px" }}>
                            ✏️ レビューを書く
                        </Link>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {reviews.length === 0 ? (
                            <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
                                まだレビューがありません。農薬ページから投稿しましょう！
                            </div>
                        ) : (
                            reviews.map((r: any) => (
                                <div key={r.id} className="card" style={{ padding: 18 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                        <Link href={`/pesticides/${r.pesticideId}`} style={{ textDecoration: "none", color: "var(--primary-dark)", fontWeight: 700, fontSize: "0.9rem" }}>
                                            🧪 {r.pesticide.name}
                                        </Link>
                                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{r.createdAt.toLocaleDateString("ja-JP")}</span>
                                    </div>
                                    <div style={{ marginBottom: 10 }}><StarRating rating={r.rating} /></div>
                                    <p style={{ fontSize: "0.85rem", color: "#4a5568", marginBottom: 10, lineHeight: 1.6 }}>
                                        {r.body.slice(0, 150)}{r.body.length > 150 ? "..." : ""}
                                    </p>
                                    <span style={{ fontSize: "0.7rem", background: "#f1f5f9", padding: "4px 10px", borderRadius: 100 }}>
                                        👍 {r.likes.length} 人が参考になった
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Inventory */}
                <aside>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: 800 }}>📦 マイ農薬（薬箱）</h2>
                        <MyPesticideAdder />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {inventory.length === 0 ? (
                            <div className="card" style={{ padding: 28, textAlign: "center", fontSize: "0.82rem", color: "var(--muted)", border: "2px dashed var(--border)" }}>
                                薬箱は空です。<br />よく使う農薬を登録しましょう。
                            </div>
                        ) : (
                            inventory.map((item: any) => {
                                const pesticide = item.pesticide;
                                const avg = pesticide.reviews.length > 0 ? pesticide.reviews.reduce((s: number, r: any) => s + r.rating, 0) / pesticide.reviews.length : 0;
                                return (
                                    <div key={item.id} className="card" style={{ padding: 14 }}>
                                        <CategoryTag category={pesticide.category} />
                                        <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "5px 0" }}>{pesticide.name}</h3>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                                            <StarRating rating={Math.round(avg)} />
                                            <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>({pesticide.reviews.length})</span>
                                        </div>
                                        <Link href={`/pesticides/${pesticide.id}/review/new`} className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: "0.8rem", padding: 7 }}>
                                            レビューを書く
                                        </Link>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
