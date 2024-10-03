-- AlterTable
ALTER TABLE "User" ALTER COLUMN "defaultOpenaiModel" DROP NOT NULL,
ALTER COLUMN "defaultOpenaiModel" DROP DEFAULT;
