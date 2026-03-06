/**
 * Import MAFF pesticide registration data from CSV files into PostgreSQL.
 * 
 * Usage: npx tsx scripts/import-maff.ts
 * 
 * Files required in project root:
 *   - R0802040.csv (basic info)
 *   - R0802041.csv (application data part 1)
 *   - R0802042.csv (application data part 2)
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as iconv from "iconv-lite";

const prisma = new PrismaClient();

function readCSV(filename: string): string[][] {
    const filePath = path.join(process.cwd(), filename);
    const buffer = fs.readFileSync(filePath);
    const text = iconv.decode(buffer, "CP932");

    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    return lines.map(line => {
        // Simple CSV parse — handles basic quoting
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    });
}

async function importPesticides() {
    console.log("📋 Reading R0802040.csv (basic info)...");
    const rows = readCSV("R0802040.csv");
    const header = rows[0];
    const data = rows.slice(1);

    console.log(`   Header: ${header.slice(0, 5).join(", ")}...`);
    console.log(`   ${data.length} rows`);

    // Clear existing MAFF data
    console.log("🗑  Clearing existing MAFF data...");
    await prisma.maffApplication.deleteMany();
    await prisma.maffPesticide.deleteMany();

    // Column indices for R0802040:
    // 0:登録番号, 1:農薬の種類, 2:農薬の名称, 3:登録を有する者の名称,
    // 4:有効成分, 5:総使用回数における有効成分, 6:濃度, 7:混合数,
    // 8:用途, 9:剤型名, 10:登録年月日

    const BATCH_SIZE = 500;
    let inserted = 0;
    const regNumbers = new Set<string>();

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);
        const creates = batch
            .filter(row => {
                const regNum = row[0];
                if (!regNum || regNumbers.has(regNum)) return false;
                regNumbers.add(regNum);
                return true;
            })
            .map(row => ({
                regNumber: row[0] || "",
                pesticideType: row[1] || "",
                name: row[2] || "",
                company: row[3] || "",
                activeIngredient: row[4] || "",
                purpose: row[8] || "",
                formulation: row[9] || "",
                regDate: row[10] || "",
            }));

        if (creates.length > 0) {
            // Use createMany for speed (SQLite supports it via Prisma)
            await prisma.maffPesticide.createMany({ data: creates });
            inserted += creates.length;
        }
        process.stdout.write(`\r   Pesticides: ${inserted}/${data.length}`);
    }
    console.log(`\n✅ Imported ${inserted} pesticides.`);
    return regNumbers;
}

async function importApplications(validRegNumbers: Set<string>) {
    const files = ["R0802041.csv", "R0802042.csv"];

    let totalInserted = 0;

    for (const file of files) {
        console.log(`📋 Reading ${file} (application data)...`);
        const rows = readCSV(file);
        const data = rows.slice(1); // Skip header
        console.log(`   ${data.length} rows`);

        // Column indices for R0802041/42:
        // 0:登録番号, 1:用途, 2:農薬の種類, 3:農薬の名称, 4:登録を有する者の略称,
        // 5:作物名, 6:適用場所, 7:適用病害虫雑草名, 8:使用目的,
        // 9:希釈倍数使用量, 10:散布液量, 11:使用時期, 12:本剤の使用回数,
        // 13:使用方法

        const BATCH_SIZE = 1000;
        let fileInserted = 0;

        for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const batch = data.slice(i, i + BATCH_SIZE);
            const creates = batch
                .filter(row => {
                    const regNum = row[0];
                    return regNum && validRegNumbers.has(regNum);
                })
                .map(row => ({
                    regNumber: row[0] || "",
                    purpose: row[1] || "",
                    cropName: row[5] || "",
                    pestName: row[7] || "",
                    dilution: row[9] || "",
                    sprayVolume: row[10] || "",
                    timing: row[11] || "",
                    method: row[13] || "",
                    usageCount: row[12] || "",
                }));

            if (creates.length > 0) {
                await prisma.maffApplication.createMany({ data: creates });
                fileInserted += creates.length;
            }
            process.stdout.write(`\r   ${file}: ${fileInserted}/${data.length}`);
        }
        console.log(`\n✅ ${file}: ${fileInserted} rows imported.`);
        totalInserted += fileInserted;
    }

    console.log(`\n🎉 Total applications imported: ${totalInserted}`);
}

async function main() {
    console.log("🚀 MAFF Pesticide Data Import\n");

    const validRegNumbers = await importPesticides();
    await importApplications(validRegNumbers);

    // Print summary
    const pestCount = await prisma.maffPesticide.count();
    const appCount = await prisma.maffApplication.count();
    const cropCount = await prisma.maffApplication.groupBy({ by: ["cropName"] });
    const pestNameCount = await prisma.maffApplication.groupBy({ by: ["pestName"] });

    console.log("\n📊 Summary:");
    console.log(`   Pesticides: ${pestCount}`);
    console.log(`   Applications: ${appCount}`);
    console.log(`   Unique crops: ${cropCount.length}`);
    console.log(`   Unique pests: ${pestNameCount.length}`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
