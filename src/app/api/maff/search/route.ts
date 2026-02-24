import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/maff/search — Hybrid search
 *
 * Query params:
 *   keyword    — partial match on pesticide name, company, or active ingredient
 *   crops      — comma-separated crop names (OR within group)
 *   purposes   — comma-separated purpose names (OR within group)
 *   page/limit — pagination
 *
 * Logic: keyword AND (crop1 OR crop2 ...) AND (purpose1 OR purpose2 ...)
 */
export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const keyword = params.get("keyword") || "";
    const cropsParam = params.get("crops") || "";
    const purposesParam = params.get("purposes") || "";
    const pestsParam = params.get("pests") || "";
    const page = Math.max(1, parseInt(params.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(params.get("limit") || "30")));

    const crops = cropsParam ? cropsParam.split(",").filter(Boolean) : [];
    const purposes = purposesParam ? purposesParam.split(",").filter(Boolean) : [];
    const pests = pestsParam ? pestsParam.split(",").filter(Boolean) : [];

    if (!keyword && crops.length === 0 && purposes.length === 0 && pests.length === 0) {
        return NextResponse.json({ results: [], total: 0, page, limit });
    }

    // Step 1: Filter by crops and/or pests if any selected
    let applicationMatchedRegNumbers: string[] | null = null;
    if (crops.length > 0 || pests.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const appWhere: any = {};
        if (crops.length > 0) appWhere.cropName = { in: crops };
        if (pests.length > 0) appWhere.pestName = { in: pests };

        const matchingApps = await prisma.maffApplication.groupBy({
            by: ["regNumber"],
            where: appWhere,
        });
        applicationMatchedRegNumbers = matchingApps.map(a => a.regNumber);
        if (applicationMatchedRegNumbers.length === 0) {
            return NextResponse.json({ results: [], total: 0, page, limit });
        }
    }

    // Step 2: Build pesticide filter (AND conditions)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pestWhere: any = {};

    // Keyword: match name OR company OR activeIngredient
    if (keyword) {
        pestWhere.OR = [
            { name: { contains: keyword } },
            { company: { contains: keyword } },
            { activeIngredient: { contains: keyword } },
        ];
    }

    // Purposes: OR among selected
    if (purposes.length > 0) {
        pestWhere.purpose = { in: purposes };
    }

    // Application constraints (crops/pests) from step 1
    if (applicationMatchedRegNumbers !== null) {
        pestWhere.regNumber = { in: applicationMatchedRegNumbers };
    }

    // Count total
    const total = await prisma.maffPesticide.count({ where: pestWhere });

    // Fetch page
    const pesticides = await prisma.maffPesticide.findMany({
        where: pestWhere,
        skip: (page - 1) * limit,
        take: limit,
    });

    if (pesticides.length === 0) {
        return NextResponse.json({ results: [], total, page, limit });
    }

    const regNumbers = pesticides.map(p => p.regNumber);

    // Step 3: Fetch applications (filtered to selected crops and pests if any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appFilter: any = { regNumber: { in: regNumbers } };
    if (crops.length > 0) appFilter.cropName = { in: crops };
    if (pests.length > 0) appFilter.pestName = { in: pests };

    const applications = await prisma.maffApplication.findMany({
        where: appFilter,
    });

    // Group by regNumber
    const appMap = new Map<string, typeof applications>();
    for (const app of applications) {
        if (!appMap.has(app.regNumber)) appMap.set(app.regNumber, []);
        appMap.get(app.regNumber)!.push(app);
    }

    const results = pesticides.map(p => ({
        regNumber: p.regNumber,
        name: p.name,
        pesticideType: p.pesticideType,
        purpose: p.purpose,
        company: p.company,
        activeIngredient: p.activeIngredient,
        formulation: p.formulation,
        applications: (appMap.get(p.regNumber) || []).slice(0, 10).map(a => ({
            cropName: a.cropName,
            pestName: a.pestName,
            dilution: a.dilution,
            method: a.method,
            timing: a.timing,
            usageCount: a.usageCount,
        })),
    }));

    return NextResponse.json({ results, total, page, limit });
}
