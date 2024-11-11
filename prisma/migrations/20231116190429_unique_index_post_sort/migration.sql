/*
  Warnings:

  - A unique constraint covering the columns `[userId,workspaceId]` on the table `PostSort` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PostSort_userId_workspaceId_key" ON "PostSort"("userId", "workspaceId");
