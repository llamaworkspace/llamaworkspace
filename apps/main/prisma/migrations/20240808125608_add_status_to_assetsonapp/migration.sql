/*
  Warnings:

  - Added the required column `status` to the `AssetsOnApps` table without a default value. This is not possible if the table is not empty.

*/

-- AlterTable
ALTER TABLE "AssetsOnApps" ADD COLUMN     "status" TEXT;
ALTER TABLE "AssetsOnApps" ADD COLUMN     "failureMessage" TEXT;

-- Set a default value for the new column
UPDATE "AssetsOnApps" SET "status" = 'success'; 

-- Set status to not nullable
ALTER TABLE "AssetsOnApps" ALTER COLUMN "status" SET NOT NULL;
