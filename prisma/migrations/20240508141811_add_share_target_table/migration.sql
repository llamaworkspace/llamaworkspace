-- CreateTable
CREATE TABLE "ShareTarget" (
    "id" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "sharerId" TEXT NOT NULL,
    "userId" TEXT,
    "workspaceInviteId" TEXT,
    "accessLevel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShareTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex 
CREATE INDEX "ShareTarget_workspaceInviteId_idx" ON "ShareTarget"("workspaceInviteId");

-- CreateIndex (partial and manually created)
CREATE UNIQUE INDEX "ShareTarget_shareId_userId_key" ON "ShareTarget"("shareId", "userId")
WHERE ("userId" IS NOT NULL);

-- CreateIndex (partial and manually created)
CREATE UNIQUE INDEX "ShareTarget_shareId_workspaceInviteId_key" ON "ShareTarget"("shareId", "workspaceInviteId")
WHERE ("workspaceInviteId" IS NOT NULL);

-- Manual xor constraint
ALTER TABLE "ShareTarget"
    ADD CONSTRAINT "chk_user_xor_workspaceInvite" CHECK (("userId" IS NOT NULL AND "workspaceInviteId" IS NULL) OR ("userId" IS NULL AND "workspaceInviteId" IS NOT NULL));

-- AddForeignKey
ALTER TABLE "ShareTarget" ADD CONSTRAINT "ShareTarget_shareId_fkey" FOREIGN KEY ("shareId") REFERENCES "Share"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareTarget" ADD CONSTRAINT "ShareTarget_sharerId_fkey" FOREIGN KEY ("sharerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareTarget" ADD CONSTRAINT "ShareTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareTarget" ADD CONSTRAINT "ShareTarget_workspaceInviteId_fkey" FOREIGN KEY ("workspaceInviteId") REFERENCES "WorkspaceInvite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
