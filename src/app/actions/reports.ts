"use server";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function submitReport(formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const reviewId = formData.get("reviewId") as string;
    const reason = formData.get("reason") as string;
    const detail = (formData.get("detail") as string) || null;

    if (!reviewId || !reason) {
        throw new Error("Invalid report data");
    }

    await prisma.report.create({
        data: {
            reviewId,
            reporterUserId: userId,
            reason,
            detail,
        },
    });
}
