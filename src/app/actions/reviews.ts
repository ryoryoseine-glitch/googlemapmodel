"use server";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { checkAndAwardBadges } from "@/lib/badges";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function getSeasonFromMonth(month: number): string {
    if (month >= 3 && month <= 5) return "春";
    if (month >= 6 && month <= 8) return "夏";
    if (month >= 9 && month <= 11) return "秋";
    return "冬";
}

export async function createReview(formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const isDraft = formData.get("isDraft") === "true";
    const pesticideId = formData.get("pesticideId") as string;
    const rating = parseInt(formData.get("rating") as string);
    const body = formData.get("body") as string;
    const photoUrl = (formData.get("photoUrl") as string) || null;

    if (!isDraft && (!rating || !body.trim())) {
        throw new Error("★評価と本文は必須です");
    }

    const profile = await prisma.farmProfile.findUnique({ where: { userId } });

    const review = await prisma.review.create({
        data: {
            userId,
            pesticideId,
            rating,
            body: body.trim(),
            isDraft,
            // Capture snapshot of the farm profile
            capturedMainCrop: profile?.primaryCropItemId,
            capturedAreaScale: profile?.areaScale,
            capturedRegion: profile ? `${profile.prefCode}:${profile.areaQuadrant}` : null,
            visibility: "PUBLIC",
        },
    });

    // Save photo if provided
    if (photoUrl) {
        await prisma.reviewPhoto.create({ data: { reviewId: review.id, url: photoUrl } });
    }

    // Award badges
    let awarded: string[] = [];
    if (!isDraft) {
        awarded = await checkAndAwardBadges(userId);
    }

    revalidatePath("/pesticides/" + pesticideId);
    revalidatePath("/me");

    if (isDraft) {
        redirect("/me");
    } else {
        const badgesParam = awarded.length > 0 ? `&badges=${encodeURIComponent(awarded.join(","))}` : "";
        redirect(`/pesticides/${pesticideId}?submitted=true${badgesParam}`);
    }
}
