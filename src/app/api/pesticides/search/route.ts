import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const crop = searchParams.get("crop") || "";
    const purpose = searchParams.get("purpose") || "";  // 殺虫剤, 殺菌剤, 除草剤

    // Build where clause
    const conditions: any[] = [];
    if (q) {
        conditions.push({ name: { contains: q } });
        conditions.push({ maker: { contains: q } });
    }
    if (crop) {
        conditions.push({ cropAffinityJson: { contains: crop } });
        conditions.push({ name: { contains: crop } });
    }
    if (purpose) {
        conditions.push({ category: purpose });
    }

    const pesticides = await prisma.pesticide.findMany({
        where: conditions.length > 0 ? {
            AND: [
                // purpose is a strict match (category = purpose)
                ...(purpose ? [{ category: purpose }] : []),
                // q and crop are OR-combined
                ...((q || crop) ? [{
                    OR: [
                        ...(q ? [{ name: { contains: q } }, { maker: { contains: q } }] : []),
                        ...(crop ? [{ cropAffinityJson: { contains: crop } }, { name: { contains: crop } }] : []),
                    ]
                }] : []),
            ]
        } : {},
        include: {
            reviews: {
                where: { isDraft: false },
                select: { rating: true }
            }
        },
        orderBy: { name: "asc" },
        take: 20,
    });

    const results = pesticides.map(p => {
        const avg = p.reviews.length > 0
            ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
            : 0;
        return {
            id: p.id,
            name: p.name,
            maker: p.maker,
            category: p.category,
            imageUrl: (p as any).imageUrl || null,
            avg: Math.round(avg * 10) / 10,
            reviewCount: p.reviews.length,
        };
    });

    return NextResponse.json(results);
}
