import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getRegionDisplay } from "@/lib/regions";

export async function GET() {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json(null, { status: 401 });

    const profile = await prisma.farmProfile.findUnique({ where: { userId } });
    if (!profile) return NextResponse.json(null);

    let cropName = "";
    if (profile.primaryCropItemId) {
        const item = await prisma.cropItem.findUnique({ where: { id: profile.primaryCropItemId } });
        cropName = item?.nameJa || "";
    }

    return NextResponse.json({
        region: getRegionDisplay(profile.prefCode, profile.areaQuadrant),
        crop: cropName,
        areaScale: profile.areaScale,
    });
}
