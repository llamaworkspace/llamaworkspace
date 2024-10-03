/*
  Migration manually altered.
  
  Warnings:

  - You are about to drop the `PostsOnUsers` table. If the table is not empty, all the data it contains will be lost.

*/

-- CreateTable
CREATE TABLE "AppsOnUsers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "position" INTEGER,
    "pinnedAt" TIMESTAMP(3),
    "lastVisitedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppsOnUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppsOnUsers_userId_appId_key" ON "AppsOnUsers"("userId", "appId");

-- AddForeignKey
ALTER TABLE "AppsOnUsers" ADD CONSTRAINT "AppsOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppsOnUsers" ADD CONSTRAINT "AppsOnUsers_appId_fkey" FOREIGN KEY ("appId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Migrate data
INSERT INTO "AppsOnUsers" ("id", "userId", "appId", "position", "pinnedAt", "lastVisitedAt", "createdAt", "updatedAt") SELECT "id", "userId", "postId", "position", "pinnedAt", "lastVisitedAt", "createdAt", "updatedAt" FROM "PostsOnUsers";

-- DropForeignKey
ALTER TABLE "PostsOnUsers" DROP CONSTRAINT "PostsOnUsers_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostsOnUsers" DROP CONSTRAINT "PostsOnUsers_userId_fkey";

-- DropTable
DROP TABLE "PostsOnUsers";