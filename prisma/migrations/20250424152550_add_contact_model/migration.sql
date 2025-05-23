/*
  Warnings:

  - You are about to drop the column `jobId` on the `Application` table. All the data in the column will be lost.
  - Added the required column `positionId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_jobId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "jobId",
ADD COLUMN     "positionTitle" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "positionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);
