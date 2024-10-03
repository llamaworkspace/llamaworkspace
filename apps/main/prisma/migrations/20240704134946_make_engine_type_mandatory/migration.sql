/*
  Warnings:

  - Made the column `engineType` on table `App` required. This step will fail if there are existing NULL values in that column.

*/

UPDATE "App"
SET "engineType" = 'default'
WHERE "isDefault" IS TRUE;

UPDATE "App"
SET "engineType" = 'assistant'
WHERE "isDefault" IS FALSE;


-- AlterTable
ALTER TABLE "App" ALTER COLUMN "engineType" SET NOT NULL;
