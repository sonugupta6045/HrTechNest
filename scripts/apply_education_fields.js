const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function applyEducationFields() {
  console.log("Adding education fields to database...");
  
  try {
    // Check if any of the education columns already exist
    const candidateFields = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Candidate' 
      AND column_name = 'tenthSchool'
    `;

    if (candidateFields.length === 0) {
      console.log("Adding education fields to Candidate table...");
      
      // Execute each SQL command separately
      await prisma.$executeRaw`ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "tenthSchool" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "tenthYear" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "tenthPercentage" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "twelfthSchool" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "twelfthYear" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "twelfthPercentage" TEXT`;
      
      console.log("Added education fields to Candidate table.");
    } else {
      console.log("Education fields already exist in Candidate table, skipping...");
    }

    // Check if any of the education columns already exist in Application table
    const applicationFields = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Application' 
      AND column_name = 'tenthSchool'
    `;

    if (applicationFields.length === 0) {
      console.log("Adding education fields to Application table...");
      
      // Execute each SQL command separately
      await prisma.$executeRaw`ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "tenthSchool" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "tenthYear" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "tenthPercentage" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "twelfthSchool" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "twelfthYear" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "twelfthPercentage" TEXT`;
      
      console.log("Added education fields to Application table.");
    } else {
      console.log("Education fields already exist in Application table, skipping...");
    }

    console.log("✅ Education fields added successfully!");
  } catch (error) {
    console.error("Error adding education fields:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
applyEducationFields(); 