/*
  Warnings:

  - You are about to drop the column `postConfigVersionId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `postConfigVersionId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `PostConfigVersion` table. If the table is not empty, all the data it contains will be lost.

*/

BEGIN;

--- START ---------------
CREATE TABLE "AppConfigVersion" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "description" TEXT,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfigVersion_pkey" PRIMARY KEY ("id")
);
--- END ---------------

--- START ---------------
ALTER TABLE "Chat" ADD COLUMN "appConfigVersionId" TEXT;
ALTER TABLE "Message" ADD COLUMN "appConfigVersionId" TEXT;

--- END ---------------

--- START ---------------
INSERT INTO "AppConfigVersion" ("id", "appId", "description", "model", "createdAt", "updatedAt")
SELECT "id", "postId", "description", "model", "createdAt", "updatedAt" FROM "PostConfigVersion";

UPDATE "Chat" SET "appConfigVersionId" = "postConfigVersionId";
UPDATE "Message" SET "appConfigVersionId" = "postConfigVersionId";
--- END ---------------

--- START ---------------
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_appConfigVersionId_fkey" FOREIGN KEY ("appConfigVersionId") REFERENCES "AppConfigVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message" ADD CONSTRAINT "Message_appConfigVersionId_fkey" FOREIGN KEY ("appConfigVersionId") REFERENCES "AppConfigVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AppConfigVersion" ADD CONSTRAINT "AppConfigVersion_appId_fkey" FOREIGN KEY ("appId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

--- END ---------------

--- LAST START ---------------
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_postConfigVersionId_fkey";

ALTER TABLE "Message" DROP CONSTRAINT "Message_postConfigVersionId_fkey";

ALTER TABLE "PostConfigVersion" DROP CONSTRAINT "PostConfigVersion_postId_fkey";

--- END ---------------

--- LAST START ---------------
DROP TABLE "PostConfigVersion";
ALTER TABLE "Chat" DROP COLUMN "postConfigVersionId";
ALTER TABLE "Message" DROP COLUMN "postConfigVersionId";
--- END ---------------

COMMIT;