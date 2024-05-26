/*
  Warnings:

  - You are about to drop the column `balanceInNanoCents` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransactionEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionEntry" DROP CONSTRAINT "TransactionEntry_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionEntry" DROP CONSTRAINT "TransactionEntry_userId_fkey";

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "balanceInNanoCents";

-- DropTable
DROP TABLE "Transaction";

-- DropTable
DROP TABLE "TransactionEntry";
