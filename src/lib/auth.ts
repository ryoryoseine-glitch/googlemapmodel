import { cookies } from "next/headers";
import { prisma } from "./db";

const COOKIE_NAME = "current_user_id";

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get(COOKIE_NAME)?.value;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            userBadges: { include: { badge: true } },
        },
    });
    return user;
}

export async function getCurrentUserId(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function getAllUsers() {
    return prisma.user.findMany({ orderBy: { createdAt: "asc" } });
}
