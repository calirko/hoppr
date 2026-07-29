-- AlterTable
ALTER TABLE "Connection" ADD COLUMN     "isVpnRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vpn" JSONB;
