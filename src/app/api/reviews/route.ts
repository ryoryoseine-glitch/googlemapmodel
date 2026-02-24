import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function POST(request: Request) {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const formData = await request.formData();
    // Use either the old pesticideId or the new regNumber
    const pesticideIdRaw = formData.get("pesticideId") as string;
    const regNumber = formData.get("regNumber") as string;

    const rating = parseInt(formData.get("rating") as string, 10);
    const body = formData.get("body") as string;
    const isDraft = formData.get("isDraft") === "true";

    if ((!pesticideIdRaw && !regNumber) || !rating || !body) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    let resolvedPesticideId = pesticideIdRaw;

    // Handle MaffPesticide auto-creation
    if (regNumber && !resolvedPesticideId) {
        let pesticide = await prisma.pesticide.findFirst({
            where: { externalId: regNumber, externalSource: "MAFF" }
        });

        if (!pesticide) {
            const maff = await prisma.maffPesticide.findUnique({ where: { regNumber } });
            if (!maff) {
                return NextResponse.json({ error: "Invalid registration number" }, { status: 400 });
            }
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
        resolvedPesticideId = pesticide.id;
    }

    // Get profile snapshot
    const profile = await prisma.farmProfile.findUnique({ where: { userId } });

    const review = await prisma.review.create({
        data: {
            userId,
            pesticideId: resolvedPesticideId,
            rating,
            body: body.trim(),
            isDraft,
            capturedMainCrop: profile?.primaryCropItemId,
            capturedAreaScale: profile?.areaScale,
            capturedRegion: profile ? `${profile.prefCode}:${profile.areaQuadrant}` : null,
            visibility: "PUBLIC",
        },
    });

    // Also link it to user's inventory automatically
    await prisma.userPesticide.upsert({
        where: { userId_pesticideId: { userId, pesticideId: resolvedPesticideId } },
        update: {},
        create: {
            userId,
            pesticideId: resolvedPesticideId,
        }
    });

    return NextResponse.json({ id: review.id });
}
