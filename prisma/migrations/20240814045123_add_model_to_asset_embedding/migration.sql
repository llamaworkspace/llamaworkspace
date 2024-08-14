/*
  Warnings:

  - Added the required column `model` to the `AssetEmbedding` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssetEmbedding" ADD COLUMN     "model" TEXT NOT NULL;
