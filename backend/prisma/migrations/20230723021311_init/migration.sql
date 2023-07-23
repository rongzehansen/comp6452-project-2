/*
  Warnings:

  - Added the required column `id2` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id2" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "groupAddress" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "voteOpen" BOOLEAN NOT NULL DEFAULT false,
    "depositOpen" BOOLEAN NOT NULL DEFAULT true,
    "applicationOpen" BOOLEAN NOT NULL DEFAULT true,
    "interestRate" INTEGER NOT NULL DEFAULT 0,
    "monthlyPayment" INTEGER NOT NULL DEFAULT 0,
    "period" INTEGER NOT NULL DEFAULT 1,
    "timeCreated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeUpdated" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Group" ("active", "applicationOpen", "depositOpen", "groupAddress", "id", "interestRate", "monthlyPayment", "name", "ownerAddress", "period", "timeCreated", "timeUpdated", "voteOpen") SELECT "active", "applicationOpen", "depositOpen", "groupAddress", "id", "interestRate", "monthlyPayment", "name", "ownerAddress", "period", "timeCreated", "timeUpdated", "voteOpen" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE UNIQUE INDEX "Group_id2_key" ON "Group"("id2");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
