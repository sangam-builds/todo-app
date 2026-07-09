-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedAt" TIMESTAMP(3);
