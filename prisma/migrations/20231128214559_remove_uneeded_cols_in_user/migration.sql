/*
  Warnings:

  - You are about to drop the column `isPublic` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `publicDescription` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `publicTitle` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "isPublic",
DROP COLUMN "publicDescription",
DROP COLUMN "publicTitle";
