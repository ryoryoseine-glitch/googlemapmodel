import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/maff/crops — return unique crop names */
export async function GET() {
    const groups = await prisma.maffApplication.groupBy({
        by: ["cropName"],
        _count: { cropName: true },
        orderBy: { _count: { cropName: "desc" } },
    });

    const crops = groups
        .filter(g => g.cropName)
        .map(g => ({ name: g.cropName, count: g._count.cropName }));

    return NextResponse.json(crops);
}
