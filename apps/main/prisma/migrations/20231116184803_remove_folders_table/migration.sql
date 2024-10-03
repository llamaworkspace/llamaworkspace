/*
  Warnings:

  - You are about to drop the column `postFolderId` on the `PostSort` table. All the data in the column will be lost.
  - You are about to drop the `PostFolder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostFolder" DROP CONSTRAINT "PostFolder_userId_fkey";

-- DropForeignKey
ALTER TABLE "PostSort" DROP CONSTRAINT "PostSort_postFolderId_fkey";

-- AlterTable
ALTER TABLE "PostSort" DROP COLUMN "postFolderId";

-- DropTable
DROP TABLE "PostFolder";
