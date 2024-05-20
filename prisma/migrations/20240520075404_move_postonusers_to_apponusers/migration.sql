
-- RENAME TABLE
ALTER TABLE "PostsOnUsers" RENAME TO "AppsOnUsers";

-- RENAME COLUMNS
ALTER TABLE "AppsOnUsers" RENAME COLUMN "postId" TO "appId";

-- RENAME CONSTRAINTS
ALTER TABLE "AppsOnUsers" RENAME CONSTRAINT "PostsOnUsers_pkey" TO "AppsOnUsers_pkey";
ALTER TABLE "AppsOnUsers" RENAME CONSTRAINT "PostsOnUsers_postId_fkey" TO "AppsOnUsers_appId_fkey";
ALTER TABLE "AppsOnUsers" RENAME CONSTRAINT "PostsOnUsers_userId_fkey" TO "AppsOnUsers_userId_fkey";

ALTER TABLE "PostsOnUsers" DROP CONSTRAINT "PostsOnUsers_postId_fkey";

-- RENAME INDEXES
ALTER INDEX "PostsOnUsers_pkey" RENAME TO "AppsOnUsers_pkey";
ALTER INDEX "PostsOnUsers_userId_postId_key" RENAME TO "AppsOnUsers_userId_appId_key";

-- RENAME EVERYTHING ELSE
ALTER SEQUENCE "PostsOnUsers_id_seq" RENAME TO "AppsOnUsers_id_seq";