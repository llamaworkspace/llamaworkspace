-- CreateTable
CREATE TABLE "AppFile" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AppFile" ADD CONSTRAINT "AppFile_appId_fkey" FOREIGN KEY ("appId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
