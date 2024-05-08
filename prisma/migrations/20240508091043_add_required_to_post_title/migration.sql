
-- Data Update
UPDATE "Post" SET "title" = 'Untitled' WHERE "title" IS NULL;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "title" SET NOT NULL;
