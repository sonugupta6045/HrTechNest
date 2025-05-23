-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "responseDate" TIMESTAMP(3),
ADD COLUMN     "status" TEXT DEFAULT 'pending';
