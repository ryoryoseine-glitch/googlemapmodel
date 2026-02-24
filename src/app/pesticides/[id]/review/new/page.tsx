import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { SimpleReviewEditor } from "@/components/SimpleReviewEditor";
import { CategoryTag } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function NewPesticideReviewPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ memo?: string }>;
}) {
    const { id } = await params;
    const { memo } = await searchParams;
    const user = await getCurrentUser();
    if (!user) redirect("/");

    const pesticide = await prisma.pesticide.findUnique({ where: { id } });
    if (!pesticide) notFound();

    return (
        <div className="container" style={{ paddingTop: 24, maxWidth: 640 }}>
            {/* Back link */}
            <Link href={`/pesticides/${id}`} style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
                ← {pesticide.name} に戻る
            </Link>

            <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h1 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>✏️ レビューを書く</h1>
                    <CategoryTag category={pesticide.category} />
                </div>
                <p style={{ color: "var(--muted)", fontSize: "0.82rem", margin: 0 }}>
                    あなたの体験が、誰かの次の防除に役立ちます
                </p>
            </div>

            <SimpleReviewEditor pesticideId={id} pesticideName={pesticide.name} initialMemo={memo} />
        </div>
    );
}
