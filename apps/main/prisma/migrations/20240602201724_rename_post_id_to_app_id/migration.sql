/*
  Warnings:

  - You are about to drop the column `postId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `Share` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[appId]` on the table `Share` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appId` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appId` to the `Share` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_postId_fkey";

-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_postId_fkey";

-- DropIndex
DROP INDEX "Share_postId_key";

-- AlterTable
ALTER TABLE "Chat" RENAME COLUMN "postId" TO "appId";

-- AlterTable
ALTER TABLE "Share" RENAME COLUMN "postId" TO "appId";


-- CreateIndex
CREATE UNIQUE INDEX "Share_appId_key" ON "Share"("appId");

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;
