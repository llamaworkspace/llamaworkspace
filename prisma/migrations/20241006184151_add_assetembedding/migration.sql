-- CreateTable
CREATE TABLE "AssetEmbedding" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "contents" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "embedding" vector(1024) NOT NULL,

    CONSTRAINT "AssetEmbedding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssetEmbedding" ADD CONSTRAINT "AssetEmbedding_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- CreateIndex
CREATE INDEX "AssetEmbedding_assetId_idx" ON "AssetEmbedding"("assetId");

-- CreateIndex
CREATE INDEX "AssetEmbedding_embedding_idx" ON "AssetEmbedding"(md5(embedding::text));