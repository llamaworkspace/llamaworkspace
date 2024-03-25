-- AlterTable
ALTER TABLE "WorkspaceInvite"
    ALTER COLUMN "source" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Share"(
    "id" text NOT NULL,
    "postId" text NOT NULL,
    "scope" text NOT NULL,
    "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) NOT NULL,
    CONSTRAINT "Share_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Share"
    ADD CONSTRAINT "Share_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

