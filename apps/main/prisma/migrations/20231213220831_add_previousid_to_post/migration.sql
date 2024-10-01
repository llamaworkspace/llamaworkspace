/*
  Warnings:

  - A unique constraint covering the columns `[previousId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "previousId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Post_previousId_key" ON "Post"("previousId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_previousId_fkey" FOREIGN KEY ("previousId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
