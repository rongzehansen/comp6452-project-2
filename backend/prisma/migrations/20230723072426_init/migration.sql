/*
  Warnings:

  - You are about to drop the column `active` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `groupAddress` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `id2` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `ownerAddress` on the `Group` table. All the data in the column will be lost.
  - Added the required column `index` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "index" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "voteOpen" BOOLEAN NOT NULL DEFAULT false,
    "depositOpen" BOOLEAN NOT NULL DEFAULT true,
    "applicationOpen" BOOLEAN NOT NULL DEFAULT false,
    "interestRate" INTEGER NOT NULL DEFAULT 0,
    "monthlyPayment" INTEGER NOT NULL DEFAULT 0,
    "period" INTEGER NOT NULL DEFAULT 1,
    "timeCreated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeUpdated" DATETIME NOT NULL
);
INSERT INTO "new_Group" ("applicationOpen", "depositOpen", "id", "interestRate", "monthlyPayment", "name", "period", "timeCreated", "timeUpdated", "voteOpen") SELECT "applicationOpen", "depositOpen", "id", "interestRate", "monthlyPayment", "name", "period", "timeCreated", "timeUpdated", "voteOpen" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE UNIQUE INDEX "Group_index_key" ON "Group"("index");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
