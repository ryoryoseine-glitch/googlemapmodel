/**
 * 外部農薬データインポートユーティリティ
 *
 * WAGRI / FAMIC からの農薬データ取り込み準備。
 * 現時点では手動インポート関数のテンプレート。
 * 将来的にAPI同期に拡張可能。
 */

import { prisma } from "@/lib/db";

interface ExternalPesticide {
    externalId: string;
    name: string;
    maker?: string;
    category?: string;
    specSummary?: string;
    cropAffinity?: Record<string, number>;
    regionAffinity?: Record<string, number>;
    seasonAffinity?: Record<string, number>;
}

/**
 * WAGRI由来データの手動インポート
 * 将来的にWAGRI APIに接続可能
 */
export async function importFromWagri(data: ExternalPesticide[]) {
    const results = { created: 0, updated: 0, errors: 0 };

    for (const item of data) {
        try {
            const existing = await prisma.pesticide.findFirst({
                where: { externalId: item.externalId, externalSource: "wagri" },
            });

            if (existing) {
                await prisma.pesticide.update({
                    where: { id: existing.id },
                    data: {
                        name: item.name,
                        maker: item.maker || existing.maker,
                        category: item.category || existing.category,
                        specSummary: item.specSummary || existing.specSummary,
                        cropAffinityJson: item.cropAffinity ? JSON.stringify(item.cropAffinity) : existing.cropAffinityJson,
                        regionAffinityJson: item.regionAffinity ? JSON.stringify(item.regionAffinity) : existing.regionAffinityJson,
                        seasonAffinityJson: item.seasonAffinity ? JSON.stringify(item.seasonAffinity) : existing.seasonAffinityJson,
                    },
                });
                results.updated++;
            } else {
                await prisma.pesticide.create({
                    data: {
                        name: item.name,
                        maker: item.maker,
                        category: item.category,
                        specSummary: item.specSummary,
                        externalSource: "wagri",
                        externalId: item.externalId,
                        cropAffinityJson: item.cropAffinity ? JSON.stringify(item.cropAffinity) : null,
                        regionAffinityJson: item.regionAffinity ? JSON.stringify(item.regionAffinity) : null,
                        seasonAffinityJson: item.seasonAffinity ? JSON.stringify(item.seasonAffinity) : null,
                    },
                });
                results.created++;
            }
        } catch (error) {
            console.error(`Import error for ${item.name}:`, error);
            results.errors++;
        }
    }

    return results;
}

/**
 * FAMIC由来データの手動インポート
 * 将来的にFAMIC APIに接続可能
 */
export async function importFromFamic(data: ExternalPesticide[]) {
    const results = { created: 0, updated: 0, errors: 0 };

    for (const item of data) {
        try {
            const existing = await prisma.pesticide.findFirst({
                where: { externalId: item.externalId, externalSource: "famic" },
            });

            if (existing) {
                await prisma.pesticide.update({
                    where: { id: existing.id },
                    data: {
                        name: item.name,
                        maker: item.maker || existing.maker,
                        category: item.category || existing.category,
                        specSummary: item.specSummary || existing.specSummary,
                        cropAffinityJson: item.cropAffinity ? JSON.stringify(item.cropAffinity) : existing.cropAffinityJson,
                        regionAffinityJson: item.regionAffinity ? JSON.stringify(item.regionAffinity) : existing.regionAffinityJson,
                        seasonAffinityJson: item.seasonAffinity ? JSON.stringify(item.seasonAffinity) : existing.seasonAffinityJson,
                    },
                });
                results.updated++;
            } else {
                await prisma.pesticide.create({
                    data: {
                        name: item.name,
                        maker: item.maker,
                        category: item.category,
                        specSummary: item.specSummary,
                        externalSource: "famic",
                        externalId: item.externalId,
                        cropAffinityJson: item.cropAffinity ? JSON.stringify(item.cropAffinity) : null,
                        regionAffinityJson: item.regionAffinity ? JSON.stringify(item.regionAffinity) : null,
                        seasonAffinityJson: item.seasonAffinity ? JSON.stringify(item.seasonAffinity) : null,
                    },
                });
                results.created++;
            }
        } catch (error) {
            console.error(`Import error for ${item.name}:`, error);
            results.errors++;
        }
    }

    return results;
}

/**
 * レビュー集計からaffinity JSONを更新する
 * 将来的にバッチジョブで定期実行可能
 */
export async function updateAffinityFromReviews(pesticideId: string) {
    const reviews = await prisma.review.findMany({
        where: { pesticideId, isDraft: false, isHidden: false },
        include: { user: { include: { farmProfile: true } } },
    });

    // Crop affinity: 各作物タイプからのレビュー数で計算
    const cropCounts = new Map<string, number>();
    const regionCounts = new Map<string, number>();
    const seasonCounts = new Map<string, number>();
    const total = reviews.length || 1;

    for (const r of reviews) {
        if (r.user.farmProfile?.primaryCropItemId) {
            cropCounts.set(r.user.farmProfile.primaryCropItemId, (cropCounts.get(r.user.farmProfile.primaryCropItemId) || 0) + 1);
        }
        if (r.user.farmProfile?.prefCode) {
            regionCounts.set(r.user.farmProfile.prefCode, (regionCounts.get(r.user.farmProfile.prefCode) || 0) + 1);
        }
        seasonCounts.set(r.season, (seasonCounts.get(r.season) || 0) + 1);
    }

    const toAffinity = (counts: Map<string, number>) =>
        Object.fromEntries([...counts.entries()].map(([k, v]) => [k, Math.round((v / total) * 100) / 100]));

    await prisma.pesticide.update({
        where: { id: pesticideId },
        data: {
            cropAffinityJson: JSON.stringify(toAffinity(cropCounts)),
            regionAffinityJson: JSON.stringify(toAffinity(regionCounts)),
            seasonAffinityJson: JSON.stringify(toAffinity(seasonCounts)),
        },
    });
}
