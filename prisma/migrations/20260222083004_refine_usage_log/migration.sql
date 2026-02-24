-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UsageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "pesticideId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT NOT NULL,
    "rating" INTEGER,
    "areaCode" TEXT,
    "cropType" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsageLog_pesticideId_fkey" FOREIGN KEY ("pesticideId") REFERENCES "Pesticide" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UsageLog" ("createdAt", "date", "id", "note", "pesticideId", "updatedAt", "userId") SELECT "createdAt", "date", "id", "note", "pesticideId", "updatedAt", "userId" FROM "UsageLog";
DROP TABLE "UsageLog";
ALTER TABLE "new_UsageLog" RENAME TO "UsageLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
