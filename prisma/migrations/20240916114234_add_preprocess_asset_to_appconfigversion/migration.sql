-- AlterTable
ALTER TABLE "AppConfigVersion" ADD COLUMN     "preprocessAsset" BOOLEAN DEFAULT false;
ALTER TABLE "AppConfigVersion" ALTER COLUMN "preprocessAsset" SET NOT NULL;
