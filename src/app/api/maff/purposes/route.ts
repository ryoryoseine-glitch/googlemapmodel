import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/maff/purposes — unique purpose (用途) list */
export async function GET() {
    const groups = await prisma.maffPesticide.groupBy({
        by: ["purpose"],
        _count: { purpose: true },
        orderBy: { _count: { purpose: "desc" } },
    });

    const purposes = groups
        .filter(g => g.purpose && !g.purpose.match(/^\d/)) // filter out numeric junk
        .map(g => ({ name: g.purpose, count: g._count.purpose }));

    return NextResponse.json(purposes);
}
