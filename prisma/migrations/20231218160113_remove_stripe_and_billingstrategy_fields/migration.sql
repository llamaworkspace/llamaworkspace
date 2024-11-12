/*
  Warnings:

  - You are about to drop the column `billingStrategy` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `Workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "billingStrategy",
DROP COLUMN "stripeCustomerId";
