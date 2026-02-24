"use server";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleLike(reviewId: string) {
    const userId = await getCurrentUserId();
    if (!userId) return { error: "ログインしてください" };

    const existing = await prisma.reviewLike.findUnique({
        where: { reviewId_userId: { reviewId, userId } },
    });

    if (existing) {
        await prisma.reviewLike.delete({ where: { id: existing.id } });
    } else {
        await prisma.reviewLike.create({ data: { reviewId, userId } });
    }

    revalidatePath("/pesticides");
    revalidatePath("/me");
    return { liked: !existing };
}
