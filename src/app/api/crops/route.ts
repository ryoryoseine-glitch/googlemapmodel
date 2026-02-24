import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
        // Return all categories with item counts
        const categories = await prisma.cropCategory.findMany({
            include: { _count: { select: { items: true } } },
            orderBy: { name: "asc" }
        });
        return NextResponse.json(categories);
    }

    // Return items for a specific category
    const items = await prisma.cropItem.findMany({
        where: { categoryId },
        orderBy: { nameJa: "asc" }
    });
    return NextResponse.json(items);
}
