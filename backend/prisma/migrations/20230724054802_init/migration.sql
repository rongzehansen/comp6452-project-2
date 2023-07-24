-- CreateTable
CREATE TABLE "Vote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupId" TEXT NOT NULL,
    "voteResult" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_groupId_key" ON "Vote"("groupId");
