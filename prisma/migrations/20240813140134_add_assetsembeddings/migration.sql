-- CreateTable
CREATE TABLE "AssetEmbedding" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "contents" TEXT NOT NULL,
    "embedding" vector(1024) NOT NULL,

    CONSTRAINT "AssetEmbedding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssetEmbedding" ADD CONSTRAINT "AssetEmbedding_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddIndex
CREATE INDEX ON "AssetEmbedding" USING vectors (embedding vectors.vector_l2_ops);