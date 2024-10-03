-- CreateTable
CREATE TABLE "PostsOnUsers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "position" INTEGER,
    "pinnedAt" TIMESTAMP(3),
    "lastVisitedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostsOnUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostsOnUsers_userId_postId_key" ON "PostsOnUsers"("userId", "postId");

-- CreateIndex (manually updated to make it partial)
-- CREATE UNIQUE INDEX "PostsOnUsers_userId_postId_position_key" ON "PostsOnUsers"("userId", "postId", "position") WHERE ("position" IS NOT NULL);
CREATE UNIQUE INDEX "PostsOnUsers_userId_postId_position_key" ON "PostsOnUsers"("userId", "postId", "position");

-- AddForeignKey
ALTER TABLE "PostsOnUsers" ADD CONSTRAINT "PostsOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostsOnUsers" ADD CONSTRAINT "PostsOnUsers_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
