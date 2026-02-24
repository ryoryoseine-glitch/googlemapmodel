"use server";

import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function resolvePesticideId(idOrReg: string): Promise<string> {
    let pesticide = await prisma.pesticide.findFirst({
        where: { OR: [{ id: idOrReg }, { externalId: idOrReg }] }
    });

    if (!pesticide) {
        const maff = await prisma.maffPesticide.findUnique({ where: { regNumber: idOrReg } });
        if (!maff) throw new Error("Pesticide not found");

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
    return pesticide.id;
}

export async function addToInventory(formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const rawId = formData.get("pesticideId") as string;
    const pesticideId = await resolvePesticideId(rawId);

    await prisma.userPesticide.upsert({
        where: { userId_pesticideId: { userId, pesticideId } },
        create: { userId, pesticideId },
        update: {}, // No change if already exists
    });

    revalidatePath("/pesticides/" + rawId);
    revalidatePath("/me");
}

export async function removeFromInventory(formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const rawId = formData.get("pesticideId") as string;
    const pesticideId = await resolvePesticideId(rawId);

    await prisma.userPesticide.delete({
        where: { userId_pesticideId: { userId, pesticideId } },
    }).catch(() => { }); // Ignore if not exists

    revalidatePath("/pesticides/" + rawId);
    revalidatePath("/me");
}

