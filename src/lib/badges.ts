import { prisma } from "./db";

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
    const [reviewCount] = await Promise.all([
        prisma.review.count({ where: { userId, isDraft: false } }),
    ]);

    const rules = [
        { key: "first_review", name: "First Reviewer", check: reviewCount >= 1 },
        { key: "pioneer", name: "Pioneer", check: reviewCount >= 3 },
        { key: "gold", name: "Gold", check: reviewCount >= 10 },
    ];

    const newBadges: string[] = [];
    for (const rule of rules) {
        if (!rule.check) continue;

        // Ensure badge exists in DB
        let badge = await prisma.badge.findUnique({ where: { key: rule.key } });
        if (!badge) {
            badge = await prisma.badge.create({
                data: {
                    key: rule.key,
                    name: rule.name,
                    description: `${rule.name} badge`,
                    iconEmoji: rule.key === "gold" ? "🥇" : rule.key === "pioneer" ? "🥈" : "🥉"
                }
            });
        }

        const existing = await prisma.userBadge.findUnique({
            where: { userId_badgeId: { userId, badgeId: badge.id } }
        });

        if (!existing) {
            await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
            newBadges.push(badge.name);
        }
    }
    return newBadges;
}
