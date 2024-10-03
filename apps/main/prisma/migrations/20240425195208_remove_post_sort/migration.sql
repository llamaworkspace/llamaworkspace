/*
  Warnings:

  - You are about to drop the `PostSort` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostSort" DROP CONSTRAINT "PostSort_userId_fkey";

-- DropForeignKey
ALTER TABLE "PostSort" DROP CONSTRAINT "PostSort_workspaceId_fkey";

-- DropIndex
DROP INDEX "PostsOnUsers_userId_postId_position_key";

-- DropTable
DROP TABLE "PostSort";
