import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/maff/pests?crops=トマト,なす — return pests linked to the selected crops */
export async function GET(request: NextRequest) {
    const cropsParam = request.nextUrl.searchParams.get("crops");
    const crops = cropsParam ? cropsParam.split(",").filter(Boolean) : [];

    // If no crops are selected, return an empty array to match the UI behavior where pests only appear after a crop is selected.
    if (crops.length === 0) {
        return NextResponse.json([]);
    }

    const groups = await prisma.maffApplication.groupBy({
        by: ["pestName"],
        where: { cropName: { in: crops }, pestName: { not: "" } },
        _count: { pestName: true },
        orderBy: { _count: { pestName: "desc" } },
        take: 150, // Limit to top 150 pests to keep UI fast
    });

    const pests = groups.map((g: any) => ({ name: g.pestName, count: g._count.pestName }));
    return NextResponse.json(pests);
}
