/*
 Warnings:

 - You are about to drop the `ShareUser` table. If the table is not empty, all the data it contains will be lost.
 */
-- DropForeignKey
ALTER TABLE "ShareUser"
  DROP CONSTRAINT "ShareUser_shareId_fkey";

-- DropForeignKey
ALTER TABLE "ShareUser"
  DROP CONSTRAINT "ShareUser_userId_fkey";

-- DropTable
DROP TABLE "ShareUser";

-- CreateTable
CREATE TABLE "ShareUserOrInvite"(
  "id" text NOT NULL,
  "shareId" text NOT NULL,
  "userId" text,
  "workspaceInviteId" text,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL,
  CONSTRAINT "ShareUserOrInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShareUserOrInvite_shareId_userId_key" ON "ShareUserOrInvite"("shareId", "userId")
WHERE ("userId" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "ShareUserOrInvite_shareId_workspaceInviteId_key" ON "ShareUserOrInvite"("shareId", "workspaceInviteId")
WHERE ("workspaceInviteId" IS NOT NULL);

ALTER TABLE "ShareUserOrInvite"
  ADD CONSTRAINT "chk_user_xor_workspaceInvite" CHECK (("userId" IS NOT NULL AND "workspaceInviteId" IS NULL) OR ("userId" IS NULL AND "workspaceInviteId" IS NOT NULL));

-- AddForeignKey
ALTER TABLE "ShareUserOrInvite"
  ADD CONSTRAINT "ShareUserOrInvite_shareId_fkey" FOREIGN KEY ("shareId") REFERENCES "Share"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareUserOrInvite"
  ADD CONSTRAINT "ShareUserOrInvite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareUserOrInvite"
  ADD CONSTRAINT "ShareUserOrInvite_workspaceInviteId_fkey" FOREIGN KEY ("workspaceInviteId") REFERENCES "Invite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

