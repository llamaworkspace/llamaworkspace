-- AlterTable
ALTER TABLE "User" RENAME COLUMN "defaultOpenaiModel" TO "defaultModel";

-- AlterTable
ALTER TABLE "Message" RENAME COLUMN "openaiTokens" TO "tokens";

