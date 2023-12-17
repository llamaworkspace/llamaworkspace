/*
  Warnings:

  - A unique constraint covering the columns `[userId,workspaceId]` on the table `UsersOnWorkspaces` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UsersOnWorkspaces_userId_workspaceId_key" ON "UsersOnWorkspaces"("userId", "workspaceId");
