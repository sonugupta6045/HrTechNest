const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const candidates = await prisma.candidate.findMany({ where: { userId: null } });
    const ids = candidates.map(c => c.id);
    console.log(`Found ${ids.length} candidates with null userId`);
    
    if (ids.length > 0) {
      await prisma.interview.deleteMany({ where: { candidateId: { in: ids } } });
      await prisma.application.deleteMany({ where: { candidateId: { in: ids } } });
      await prisma.candidate.deleteMany({ where: { id: { in: ids } } });
      console.log("Deleted applications, interviews, and candidates.");
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
