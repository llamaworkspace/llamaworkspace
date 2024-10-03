-- CreateTable
CREATE TABLE "AiProviderModel" (
    "id" TEXT NOT NULL,
    "aiProviderId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProviderModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiProviderModel_aiProviderId_slug_key" ON "AiProviderModel"("aiProviderId", "slug");

-- AddForeignKey
ALTER TABLE "AiProviderModel" ADD CONSTRAINT "AiProviderModel_aiProviderId_fkey" FOREIGN KEY ("aiProviderId") REFERENCES "AiProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
