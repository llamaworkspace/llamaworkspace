-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "gptEngine" TEXT DEFAULT 'basic';

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "gptEngine" DROP DEFAULT;