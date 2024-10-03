-- CreateTable
CREATE TABLE "PostSort" (
    "id" TEXT NOT NULL,
    "sortedPosts" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostSort_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostSort" ADD CONSTRAINT "PostSort_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostSort" ADD CONSTRAINT "PostSort_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
