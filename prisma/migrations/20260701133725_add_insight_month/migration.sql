/*
  Warnings:

  - Added the required column `month` to the `Insight` table without a default value. This is not possible if the table is not empty.

*/
-- Clear existing insights since month column is now required
DELETE FROM "Insight";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Insight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Insight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Insight" ("content", "generatedAt", "id", "userId") SELECT "content", "generatedAt", "id", "userId" FROM "Insight";
DROP TABLE "Insight";
ALTER TABLE "new_Insight" RENAME TO "Insight";
CREATE UNIQUE INDEX "Insight_userId_month_key" ON "Insight"("userId", "month");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
