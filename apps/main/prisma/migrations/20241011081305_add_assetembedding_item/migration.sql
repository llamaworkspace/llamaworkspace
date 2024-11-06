-- CreateTable
CREATE TABLE "AssetEmbeddingItem" (
    "id" TEXT NOT NULL,
    "assetEmbeddingId" TEXT NOT NULL,
    "contents" TEXT NOT NULL,
    "embedding" vector(1024) NOT NULL,

    CONSTRAINT "AssetEmbeddingItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssetEmbeddingItem" ADD CONSTRAINT "AssetEmbeddingItem_assetEmbeddingId_fkey" FOREIGN KEY ("assetEmbeddingId") REFERENCES "AssetEmbedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "AssetEmbeddingItem_embedding_idx" ON "AssetEmbeddingItem"(md5(embedding::text));