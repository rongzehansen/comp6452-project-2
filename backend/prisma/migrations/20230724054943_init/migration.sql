/*
  Warnings:

  - Added the required column `timeUpdated` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupId" TEXT NOT NULL,
    "voteResult" TEXT NOT NULL,
    "timeCreated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeUpdated" DATETIME NOT NULL
);
INSERT INTO "new_Vote" ("groupId", "id", "voteResult") SELECT "groupId", "id", "voteResult" FROM "Vote";
DROP TABLE "Vote";
ALTER TABLE "new_Vote" RENAME TO "Vote";
CREATE UNIQUE INDEX "Vote_groupId_key" ON "Vote"("groupId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
