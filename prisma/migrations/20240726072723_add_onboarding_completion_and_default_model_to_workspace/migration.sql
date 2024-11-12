-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "defaultModel" TEXT,
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3);

-- Set defaultModel to gpt-4o
UPDATE "Workspace" SET "defaultModel" = 'openai/gpt-4o' WHERE "defaultModel" IS NULL; 

-- Set default onboardingCompletedAt to now
UPDATE "Workspace" SET "onboardingCompletedAt" = now() WHERE "onboardingCompletedAt" IS NULL;