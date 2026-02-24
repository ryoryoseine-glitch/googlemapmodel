import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Avatar, StarRating, CategoryTag } from "@/components/ui";
import HomeSearchWrapper from "@/components/HomeSearchWrapper";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  // Prepare user profile and crop name for recommendations
  const profile = user ? await prisma.farmProfile.findUnique({ where: { userId: user.id } }) : null;
  let primaryCropName = "";
  if (profile?.primaryCropItemId) {
    const item = await prisma.cropItem.findUnique({ where: { id: profile.primaryCropItemId } });
    primaryCropName = item?.nameJa || "";
  }

  // 1. Featured reviews (Personalized: High rating & related to user's crop, fallback to general top-liked)
  let featuredReviews: any[] = [];

  if (primaryCropName) {
    featuredReviews = await prisma.review.findMany({
      where: {
        isDraft: false,
        visibility: "PUBLIC",
        rating: { gte: 4 },
        pesticide: {
          OR: [
            { category: { contains: primaryCropName } },
            { name: { contains: primaryCropName } }
          ]
        }
      },
      include: {
        user: true,
        pesticide: true,
        likes: true,
        photos: { take: 1 }
      },
      orderBy: { likes: { _count: "desc" } },
      take: 3
    });
  }

  // Fallback or fill the remaining spots if personalized reviews are less than 3
  if (featuredReviews.length < 3) {
    const fallbackReviews = await prisma.review.findMany({
      where: {
        isDraft: false,
        visibility: "PUBLIC",
        id: { notIn: featuredReviews.map(r => r.id) }
      },
      include: {
        user: true,
        pesticide: true,
        likes: true,
        photos: { take: 1 }
      },
      orderBy: [
        { rating: "desc" },
        { likes: { _count: "desc" } }
      ],
      take: 3 - featuredReviews.length
    });
    featuredReviews = [...featuredReviews, ...fallbackReviews];
  }

  // 2. Recommendations based on user's crops (reusing primaryCropName from above)
  const recommendedPesticides = await prisma.pesticide.findMany({
    where: primaryCropName ? {
      OR: [
        { category: { contains: primaryCropName } },
        { name: { contains: primaryCropName } },
      ]
    } : {},
    include: {
      reviews: { where: { isDraft: false }, select: { rating: true } }
    },
    take: 4
  });

  const recommendedWithStats = recommendedPesticides.map((p: any) => {
    const avg = p.reviews.length > 0 ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length : 0;
    return { ...p, avg, reviewCount: p.reviews.length };
  });

  return (
    <div className="container-wide" style={{ paddingTop: 40 }}>
      {/* Top Hero & Featured Section */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 24,
        marginBottom: 48
      }}>
        {/* Compact Hero Section */}
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          textAlign: "center",
          padding: "32px 24px",
          background: "linear-gradient(135deg, #f0fff4 0%, #e6fffa 50%, #ecfdf5 100%)",
          borderRadius: 24,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative elements */}
          <div style={{ position: "absolute", top: 20, left: 20, fontSize: "2.5rem", opacity: 0.15 }}>🌾</div>
          <div style={{ position: "absolute", bottom: 20, right: 20, fontSize: "2rem", opacity: 0.12 }}>🧪</div>
          <div style={{ position: "absolute", top: 40, right: 80, fontSize: "1.5rem", opacity: 0.1 }}>⭐</div>

          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary-dark)", marginBottom: 12, lineHeight: 1.3 }}>
            農家の知見を、<br className="mobile-only" />みんなの力に。
          </h1>
          <p style={{ fontSize: "0.95rem", color: "#4a5568", marginBottom: 24, maxWidth: 400 }}>
            過去の利用者が「どの作物に」「どう使い」「どう効果があったか」<br />リアルな体験談を検索・共有できます。
          </p>
        </div>

        {/* Featured Reviews Space */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 12 }}>🏆 注目のレビュー</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: "360px", overflowY: "auto", paddingRight: 8 }}>
            {featuredReviews.map((r: any, i: number) => (
              <div
                key={r.id}
                className="card"
                style={{
                  padding: "16px",
                  ...(i === 0 ? {
                    border: "2px solid #fbbf24",
                    background: "linear-gradient(to right, #fffbeb, #ffffff)",
                  } : {}),
                }}
              >
                {i === 0 && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "3px 10px", background: "#fef3c7", color: "#92400e",
                    borderRadius: 100, fontSize: "0.7rem", fontWeight: 700, marginBottom: 8,
                  }}>
                    👑 ピックアップレビュー
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <Avatar name={r.user.name} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.8rem" }}>{r.user.name}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--muted)" }}>
                      {r.capturedRegion ? `📍 ${r.capturedRegion}` : "農家ユーザー"}
                    </div>
                  </div>
                  <span style={{ fontSize: "0.65rem", color: "var(--muted)", alignSelf: "flex-start" }}>
                    {r.createdAt.toLocaleDateString("ja-JP")}
                  </span>
                </div>
                <Link href={`/pesticides/${r.pesticideId}`} style={{ textDecoration: "none", color: "var(--primary-dark)", fontWeight: 700, fontSize: "0.85rem", display: "block", marginBottom: 6 }}>
                  🧪 {r.pesticide.name}
                </Link>
                <div style={{ marginBottom: 8 }}>
                  <StarRating rating={r.rating} />
                </div>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.5, color: "#2d3748", whiteSpace: "pre-wrap", marginBottom: 10 }}>
                  {r.body.slice(0, 80)}{r.body.length > 80 ? "..." : ""}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Link href={`/pesticides/${r.pesticideId}`} style={{ fontSize: "0.7rem", color: "var(--primary)" }}>
                    もっと読む →
                  </Link>
                  <span style={{
                    background: "#ebf8ff", color: "#2b6cb0",
                    padding: "3px 8px", borderRadius: 100,
                    fontSize: "0.65rem", fontWeight: 700,
                  }}>
                    👍 {r.likes.length} 参考になった
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Search & Filter Component */}
      <div style={{ marginBottom: 48 }}>
        <HomeSearchWrapper />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40 }} className="home-grid">
        {/* Main Content */}
        <div>
          {/* Recommendations */}
          {recommendedWithStats.length > 0 && (
            <section style={{ marginBottom: 48 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>🌱 あなたの作物に合う農薬</h2>
                <Link href="/pesticides/search" style={{ fontSize: "0.8rem", color: "var(--primary)" }}>もっと探す →</Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {recommendedWithStats.map((p: any) => (
                  <Link key={p.id} href={`/pesticides/${p.id}`} className="card card-clickable" style={{ padding: 16, textDecoration: "none", color: "inherit" }}>
                    {/* Product image */}
                    <div style={{
                      width: "100%", height: 80,
                      background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                      borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.5rem", marginBottom: 10,
                    }}>🧪</div>
                    <CategoryTag category={p.category} />
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "6px 0 3px" }}>{p.name}</h3>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: "0 0 8px" }}>{p.maker}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <StarRating rating={Math.round(p.avg)} />
                      <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>{p.avg.toFixed(1)}</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>({p.reviewCount}件)</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside>
          <div className="card" style={{ padding: 24, position: "sticky", top: 80 }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: 14 }}>✏️ あなたの体験を共有</h3>
            <p style={{ fontSize: "0.82rem", color: "#4a5568", lineHeight: 1.6, marginBottom: 18 }}>
              あなたの使用体験が、他の農家の助けになります。
            </p>
            <Link href="/reviews/new" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: 12 }}>
              レビューを書く
            </Link>

            <div style={{ borderTop: "1px solid var(--border)", marginTop: 24, paddingTop: 24 }}>
              <Link href="/pesticides/search" className="btn-secondary" style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem" }}>
                🔍 農薬を検索する
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
