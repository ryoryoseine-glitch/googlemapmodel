import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AverageRating, CategoryTag, Avatar, StarRating } from "@/components/ui";
import { LikeButton } from "@/components/LikeButton";
import { PesticideActions } from "@/components/PesticideActions";
import { SuccessFeedback } from "@/components/SuccessFeedback";

export const dynamic = "force-dynamic";

export default async function PesticideDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ sort?: string; submitted?: string; badges?: string }>;
}) {
    const { id } = await params;
    const { sort } = await searchParams;
    const currentUserId = await getCurrentUserId();

    let pesticide = await prisma.pesticide.findFirst({
        where: {
            OR: [
                { id },
                { externalId: id }
            ]
        }
    });

    if (!pesticide) {
        // Try mapping from MaffPesticide if the ID given is a regNumber
        const maff = await prisma.maffPesticide.findUnique({ where: { regNumber: id } });
        if (!maff) notFound();

        pesticide = await prisma.pesticide.create({
            data: {
                name: maff.name,
                maker: maff.company,
                category: maff.purpose,
                externalSource: "MAFF",
                externalId: maff.regNumber,
            }
        });
    }

    // Now we have the internal Prisma ID
    const internalId = pesticide.id;

    const inInventory = currentUserId
        ? !!(await prisma.userPesticide.findUnique({
            where: { userId_pesticideId: { userId: currentUserId, pesticideId: internalId } }
        }))
        : false;

    const orderBy: any = sort === "likes"
        ? { likes: { _count: "desc" } }
        : sort === "rating"
            ? { rating: "desc" }
            : { createdAt: "desc" };

    const reviews = await prisma.review.findMany({
        where: { pesticideId: internalId, isDraft: false, visibility: "PUBLIC" },
        include: {
            user: true,
            photos: { take: 1 },
            likes: true,
        },
        orderBy,
    });

    const allReviews = await prisma.review.findMany({
        where: { pesticideId: internalId, isDraft: false },
        select: { rating: true },
    });
    const avg = allReviews.length > 0 ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length : 0;
    const distribution = [5, 4, 3, 2, 1].map((r) => ({
        rating: r, count: allReviews.filter((rev) => rev.rating === r).length,
    }));
    const maxCount = Math.max(...distribution.map((d) => d.count), 1);

    return (
        <div className="container-wide" style={{ paddingTop: 24 }}>
            {/* Header */}
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <CategoryTag category={pesticide.category} />
                        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "6px 0 4px" }}>{pesticide.name}</h1>
                        {pesticide.maker && <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: 0 }}>{pesticide.maker}</p>}
                    </div>
                    <PesticideActions
                        pesticideId={internalId}
                        currentUserId={currentUserId}
                        inInventory={inInventory}
                    />
                </div>

                {allReviews.length > 0 && (
                    <div style={{ display: "flex", gap: 24, marginTop: 20, alignItems: "start", flexWrap: "wrap" }}>
                        <AverageRating avg={avg} count={allReviews.length} />
                        <div style={{ flex: 1, minWidth: 160 }}>
                            {distribution.map((d) => (
                                <div key={d.rating} className="rating-bar">
                                    <span>{d.rating}</span>
                                    <div className="rating-bar-bg">
                                        <div className="rating-bar-fill" style={{ width: `${(d.count / maxCount) * 100}%` }} />
                                    </div>
                                    <span style={{ minWidth: 20, textAlign: "right" }}>{d.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Reviews */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>💬 みんなのレビュー</h2>
                <div style={{ display: "flex", gap: 8 }}>
                    {[
                        { label: "新着", val: "new" },
                        { label: "参考になった順", val: "likes" },
                        { label: "評価順", val: "rating" }
                    ].map((s) => (
                        <Link
                            key={s.val}
                            href={`/pesticides/${internalId}?sort=${s.val}`}
                            className={`btn-ghost ${sort === s.val || (!sort && s.val === "new") ? "active" : ""}`}
                            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                        >
                            {s.label}
                        </Link>
                    ))}
                </div>
            </div>
            <div className="card" style={{ marginBottom: 40, padding: 0 }}>
                {reviews.map((review) => (
                    <div key={review.id} className="review-card animate-in" style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                            <Avatar name={review.user.name} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{review.user.name}</div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                                            <StarRating rating={review.rating} />
                                            <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{review.createdAt.toLocaleDateString("ja-JP")}</span>
                                        </div>
                                    </div>
                                    <LikeButton
                                        reviewId={review.id}
                                        initialLiked={currentUserId ? review.likes.some((l) => l.userId === currentUserId) : false}
                                        initialCount={review.likes.length}
                                    />
                                </div>
                            </div>
                        </div>

                        {review.photos[0] && (
                            <img src={review.photos[0].url} alt="" style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 10, marginBottom: 12 }} />
                        )}

                        <p style={{ fontSize: "0.95rem", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>{review.body}</p>
                    </div>
                ))}

                {reviews.length === 0 && (
                    <div style={{ textAlign: "center", padding: 80, color: "var(--muted)" }}>
                        <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>まだレビューがありません</p>
                        <p style={{ fontSize: "0.88rem", marginBottom: 24 }}>最初のレビューを書きませんか？</p>
                        <Link href={`/pesticides/${internalId}/review/new`} className="btn-primary" style={{ padding: "10px 24px" }}>
                            ✏️ レビューを書く
                        </Link>
                    </div>
                )}
            </div>

            <SuccessFeedback />
        </div>
    );
}
