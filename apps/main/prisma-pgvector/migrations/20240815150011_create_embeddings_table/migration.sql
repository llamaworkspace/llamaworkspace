-- CreateTable
CREATE TABLE "AssetEmbedding" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "contents" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "embedding" vector(1024) NOT NULL,

    CONSTRAINT "AssetEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssetEmbedding_assetId_idx" ON "AssetEmbedding"("assetId");

-- CreateIndex
CREATE INDEX "AssetEmbedding_embedding_idx" ON "AssetEmbedding" USING hnsw (embedding vector_l2_ops);