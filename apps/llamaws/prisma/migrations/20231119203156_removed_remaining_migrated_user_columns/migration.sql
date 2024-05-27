/*
  Warnings:

  - You are about to drop the column `billingStrategy` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `openAiApiKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "billingStrategy",
DROP COLUMN "openAiApiKey",
DROP COLUMN "stripeCustomerId";
