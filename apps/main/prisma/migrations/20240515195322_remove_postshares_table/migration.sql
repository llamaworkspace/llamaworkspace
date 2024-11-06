/*
  Warnings:

  - You are about to drop the `PostShare` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostShare" DROP CONSTRAINT "PostShare_inviteId_fkey";

-- DropForeignKey
ALTER TABLE "PostShare" DROP CONSTRAINT "PostShare_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostShare" DROP CONSTRAINT "PostShare_userId_fkey";

-- DropTable
DROP TABLE "PostShare";
