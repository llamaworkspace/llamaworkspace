/*
  Warnings:

  - You are about to drop the column `gptEngine` on the `App` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "App" DROP COLUMN "gptEngine",
ADD COLUMN     "engineType" TEXT NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE "App" ALTER COLUMN "engineType" DROP NOT NULL,
ALTER COLUMN "engineType" DROP DEFAULT;

