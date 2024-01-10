-- AlterTable
ALTER TABLE "AiModel" RENAME CONSTRAINT "AiProviderModel_pkey" TO "AiModel_pkey";

-- CreateTable
CREATE TABLE "AiModelKeyValue" (
    "id" TEXT NOT NULL,
    "aiModelId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiModelKeyValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiModelKeyValue_aiModelId_key_key" ON "AiModelKeyValue"("aiModelId", "key");

-- RenameForeignKey
ALTER TABLE "AiModel" RENAME CONSTRAINT "AiProviderModel_aiProviderId_fkey" TO "AiModel_aiProviderId_fkey";

-- AddForeignKey
ALTER TABLE "AiModelKeyValue" ADD CONSTRAINT "AiModelKeyValue_aiModelId_fkey" FOREIGN KEY ("aiModelId") REFERENCES "AiModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "AiProviderModel_aiProviderId_slug_key" RENAME TO "AiModel_aiProviderId_slug_key";
