/*
  Warnings:

  - Added the required column `token` to the `WorkspaceInvite` table without a default value. This is not possible if the table is not empty.
  - Made the column `invitedById` on table `WorkspaceInvite` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "WorkspaceInvite" DROP CONSTRAINT "WorkspaceInvite_invitedById_fkey";

-- AlterTable
DELETE FROM "WorkspaceInvite";
ALTER TABLE "WorkspaceInvite" ADD COLUMN     "token" TEXT NOT NULL,
ALTER COLUMN "invitedById" SET NOT NULL;

-- CreateIndex
CREATE INDEX "WorkspaceInvite_token_idx" ON "WorkspaceInvite"("token");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_email_idx" ON "WorkspaceInvite"("email");

-- AddForeignKey
ALTER TABLE "WorkspaceInvite" ADD CONSTRAINT "WorkspaceInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
