/*
  Warnings:

  - You are about to drop the column `address` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `owner` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Group` table. All the data in the column will be lost.
  - Added the required column `groupAddress` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerAddress` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeUpdated` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
INSERT INTO "new_Group" ("active", "id", "name") SELECT "active", "id", "name" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
