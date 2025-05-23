-- AlterTable: Add education fields to Candidate
ALTER TABLE "Candidate" ADD COLUMN "tenthSchool" TEXT;
ALTER TABLE "Candidate" ADD COLUMN "tenthYear" TEXT;
ALTER TABLE "Candidate" ADD COLUMN "tenthPercentage" TEXT;
ALTER TABLE "Candidate" ADD COLUMN "twelfthSchool" TEXT;
ALTER TABLE "Candidate" ADD COLUMN "twelfthYear" TEXT;
ALTER TABLE "Candidate" ADD COLUMN "twelfthPercentage" TEXT;

-- AlterTable: Add education fields to Application
ALTER TABLE "Application" ADD COLUMN "tenthSchool" TEXT;
ALTER TABLE "Application" ADD COLUMN "tenthYear" TEXT;
ALTER TABLE "Application" ADD COLUMN "tenthPercentage" TEXT;
ALTER TABLE "Application" ADD COLUMN "twelfthSchool" TEXT;
ALTER TABLE "Application" ADD COLUMN "twelfthYear" TEXT;
ALTER TABLE "Application" ADD COLUMN "twelfthPercentage" TEXT; 