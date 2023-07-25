/*
  Warnings:

  - You are about to alter the column `groupId` on the `Vote` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupId" INTEGER NOT NULL,
    "voteResult" TEXT NOT NULL,
    "timeCreated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeUpdated" DATETIME NOT NULL
);
INSERT INTO "new_Vote" ("groupId", "id", "timeCreated", "timeUpdated", "voteResult") SELECT "groupId", "id", "timeCreated", "timeUpdated", "voteResult" FROM "Vote";
DROP TABLE "Vote";
ALTER TABLE "new_Vote" RENAME TO "Vote";
CREATE UNIQUE INDEX "Vote_groupId_key" ON "Vote"("groupId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
