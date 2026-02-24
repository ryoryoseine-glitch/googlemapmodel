import { prisma } from "./src/lib/db";

async function main() {
    console.log("Models:", Object.keys(prisma).filter(k => !k.startsWith("_")));
}

main();
