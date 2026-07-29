-- Create ConnectionLaunch table (per-user last-launched tracking)
CREATE TABLE "ConnectionLaunch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "lastLaunchedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectionLaunch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ConnectionLaunch_userId_connectionId_key" ON "ConnectionLaunch"("userId", "connectionId");

CREATE INDEX "ConnectionLaunch_connectionId_idx" ON "ConnectionLaunch"("connectionId");

ALTER TABLE "ConnectionLaunch" ADD CONSTRAINT "ConnectionLaunch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConnectionLaunch" ADD CONSTRAINT "ConnectionLaunch_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill ConnectionLaunch from existing per-connection lastLaunchedAt, attributed to the connection's current owner
INSERT INTO "ConnectionLaunch" ("id", "userId", "connectionId", "lastLaunchedAt")
SELECT gen_random_uuid()::text, "userId", "id", "lastLaunchedAt"
FROM "Connection"
WHERE "lastLaunchedAt" IS NOT NULL;

-- Rename Connection.userId -> Connection.createdById (connections are now global; this just tracks who created them)
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_userId_fkey";
DROP INDEX "Connection_userId_idx";
ALTER TABLE "Connection" RENAME COLUMN "userId" TO "createdById";
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "Connection_createdById_idx" ON "Connection"("createdById");

ALTER TABLE "Connection" DROP COLUMN "lastLaunchedAt";
