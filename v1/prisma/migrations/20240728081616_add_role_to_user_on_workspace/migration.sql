-- AlterTable
ALTER TABLE "UsersOnWorkspaces" ADD COLUMN     "role" TEXT;


-- Set default to admin
UPDATE "UsersOnWorkspaces" SET "role" = 'admin';

-- Make field mandatory
ALTER TABLE "UsersOnWorkspaces" ALTER COLUMN "role" SET NOT NULL;