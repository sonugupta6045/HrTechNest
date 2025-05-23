/*
  Warnings:

  - The `status` column on the `Position` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PositionStatus" AS ENUM ('OPEN', 'CLOSED', 'PENDING');

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_userId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "analysis" JSONB,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "extractedData" JSONB;

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "googleCalendarEventId" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "analysis" JSONB;

-- AlterTable
ALTER TABLE "Position" DROP COLUMN "status",
ADD COLUMN     "status" "PositionStatus" NOT NULL DEFAULT 'OPEN';

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
