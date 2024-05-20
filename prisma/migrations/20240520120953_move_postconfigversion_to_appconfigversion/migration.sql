/*
  Warnings:

  - You are about to drop the `PostConfigVersion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_postConfigVersionId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_postConfigVersionId_fkey";

-- DropForeignKey
ALTER TABLE "PostConfigVersion" DROP CONSTRAINT "PostConfigVersion_postId_fkey";

-- DropTable
DROP TABLE "PostConfigVersion";

-- CreateTable
CREATE TABLE "AppConfigVersion" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "description" TEXT,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfigVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_postConfigVersionId_fkey" FOREIGN KEY ("postConfigVersionId") REFERENCES "AppConfigVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_postConfigVersionId_fkey" FOREIGN KEY ("postConfigVersionId") REFERENCES "AppConfigVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppConfigVersion" ADD CONSTRAINT "AppConfigVersion_appId_fkey" FOREIGN KEY ("appId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
