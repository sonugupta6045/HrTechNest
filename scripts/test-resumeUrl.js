const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['error'],
});

async function testResumeUrlRequirement() {
  console.log('Testing Application model resumeUrl field requirement...');
  let candidate = null;
  
  try {
    // Create a test candidate first
    candidate = await prisma.candidate.create({
      data: {
        name: 'Resume Test Candidate',
        email: 'resume-test@example.com',
        resumeUrl: 'https://example.com/test-resume.pdf',
        phone: '1234567890',
        skills: ['JavaScript', 'Node.js'],
        experience: '2 years',
      }
    });
    
    console.log('✅ Test candidate created successfully');
    
    // 1. Try creating an application WITH resumeUrl
    console.log('\nTEST 1: Creating application WITH resumeUrl');
    const validApplication = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        resumeUrl: 'https://example.com/test-resume.pdf', // Include required field
        name: 'Resume Test',
        email: 'resume-test@example.com',
        skills: ['JavaScript', 'Node.js'],
        status: 'PENDING',
        matchScore: 75,
      }
    });
    
    console.log('✅ Application WITH resumeUrl created successfully:', validApplication.id);
    
    // Clean up the valid application
    await prisma.application.delete({
      where: { id: validApplication.id }
    });
    
    // 2. Try creating an application WITHOUT resumeUrl
    console.log('\nTEST 2: Attempting to create application WITHOUT resumeUrl');
    try {
      const invalidApplication = await prisma.application.create({
        data: {
          candidateId: candidate.id,
          // resumeUrl intentionally omitted
          name: 'Resume Test',
          email: 'resume-test@example.com',
          skills: ['JavaScript', 'Node.js'],
          status: 'PENDING',
          matchScore: 75,
        }
      });
      
      console.log('❌ ERROR: Application without resumeUrl was created, but it should fail!');
    } catch (error) {
      console.log('✅ Expected error occurred when trying to create application without resumeUrl:');
      console.log(`Error message: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error during test:', error);
    return false;
  } finally {
    // Clean up the candidate
    if (candidate) {
      await prisma.candidate.delete({
        where: { id: candidate.id }
      }).catch(err => console.error('Error cleaning up candidate:', err));
    }
    
    await prisma.$disconnect();
  }
}

// Run the test
testResumeUrlRequirement()
  .then(success => {
    console.log(success ? '\n✅ Test completed successfully' : '\n❌ Test failed');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 