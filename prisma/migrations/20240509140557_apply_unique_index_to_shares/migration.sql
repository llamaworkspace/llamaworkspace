/*
  Warnings:

  - A unique constraint covering the columns `[postId]` on the table `Share` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Share_postId_key" ON "Share"("postId");
