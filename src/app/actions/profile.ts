"use server";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function saveProfile(formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) return { error: "Not authenticated" };

    // Account Info
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    // Crop Data (JSON strings from hidden inputs)
    const cropCategoryIds = formData.get("cropCategoryIds") as string;
    const cropItemIds = formData.get("cropItemIds") as string;
    const primaryCropItemId = formData.get("primaryCropItemId") as string;

    // Region
    const prefCode = formData.get("prefCode") as string;
    const areaQuadrant = formData.get("areaQuadrant") as string;
    const areaScale = formData.get("areaScale") as string;

    try {
        // 1. Update User info
        if (email) {
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });
            if (existingUser && existingUser.id !== userId) {
                return { error: "このメールアドレスは既に他のアカウントで使用されています。" };
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                email
            }
        });

        // 2. Upsert Farm Profile
        await prisma.farmProfile.upsert({
            where: { userId },
            create: {
                userId,
                cropCategoryIds,
                cropItemIds,
                primaryCropItemId,
                prefCode,
                areaQuadrant,
                areaScale,
            },
            update: {
                cropCategoryIds,
                cropItemIds,
                primaryCropItemId,
                prefCode,
                areaQuadrant,
                areaScale,
            },
        });

        // 3. Mark profile as complete
        await prisma.user.update({
            where: { id: userId },
            data: { profileComplete: true },
        });

        // 4. Set profile cookie
        const cookieStore = await cookies();
        cookieStore.set("has_farm_profile", "true", { path: "/", maxAge: 60 * 60 * 24 * 30 });

        revalidatePath("/me");
        revalidatePath("/");
    } catch (error: any) {
        console.error("Profile save error:", error);
        return { error: "プロフィールの保存に失敗しました。時間をおいて再試行してください。" };
    }

    redirect("/");
}
