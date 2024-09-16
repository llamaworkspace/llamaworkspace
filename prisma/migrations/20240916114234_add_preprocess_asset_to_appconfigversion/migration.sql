-- AlterTable
ALTER TABLE "AppConfigVersion" ADD COLUMN     "preprocessAssets" BOOLEAN DEFAULT false;
ALTER TABLE "AppConfigVersion" ALTER COLUMN "preprocessAssets" SET NOT NULL;
