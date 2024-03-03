-- AlterTable
ALTER TABLE "Share" ADD COLUMN     "workspaceInviteId" TEXT,
ALTER COLUMN "postId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_workspaceInviteId_fkey" FOREIGN KEY ("workspaceInviteId") REFERENCES "WorkspaceInvite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
