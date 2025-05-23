const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['info', 'warn', 'error'],
});

async function testDb() {
  console.log('Starting application test...');
  
  try {
    // Create a test candidate
    const candidate = await prisma.candidate.create({
      data: {
        name: 'Test Candidate DB',
        email: 'test-db@example.com',
        resumeUrl: 'https://example.com/resume.pdf', // Important resumeUrl field
        phone: '1234567890',
        skills: ['JavaScript', 'Node.js'],
        experience: '3 years',
      }
    });
    
    console.log('Created test candidate:', candidate);
    
    // Create an application WITH resumeUrl
    const application = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        resumeUrl: 'https://example.com/resume.pdf', // Required field
        name: 'Test Application',
        email: 'test-db@example.com',
        skills: ['JavaScript', 'Node.js'],
        status: 'PENDING',
        matchScore: 80,
      }
    });
    
    console.log('✅ Successfully created application WITH resumeUrl:', application.id);
    
    // Clean up test data
    await prisma.application.delete({
      where: { id: application.id }
    });
    
    await prisma.candidate.delete({
      where: { id: candidate.id }
    });
    
    console.log('✅ Test data cleaned up');
    return true;
  } catch (error) {
    console.error('❌ Error during test:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDb()
  .then(success => {
    console.log(success ? '✅ Test completed successfully' : '❌ Test failed');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 