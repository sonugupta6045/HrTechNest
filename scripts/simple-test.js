// Import the existing DB connection from the project
const { db } = require('../lib/db');

async function testApplication() {
  console.log('Testing application creation with resumeUrl field...');

  try {
    // First create a test candidate
    const candidate = await db.candidate.create({
      data: {
        name: 'Test Candidate',
        email: 'test-candidate@example.com',
        phone: '1234567890',
        resumeUrl: 'https://example.com/test-resume.pdf', // Include the resumeUrl field
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: '2 years'
      }
    });

    console.log('✅ Candidate created:', candidate);

    // Create a test application with the resumeUrl field
    const application = await db.application.create({
      data: {
        candidateId: candidate.id,
        name: 'Test Candidate',
        email: 'test-candidate@example.com',
        resumeUrl: 'https://example.com/test-resume.pdf', // Include the required field
        status: 'PENDING',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: '2 years',
        matchScore: 70,
      }
    });

    console.log('✅ Application created successfully!');
    console.log(application);

    // Clean up test data
    await db.application.delete({
      where: { id: application.id }
    });

    await db.candidate.delete({
      where: { id: candidate.id }
    });

    console.log('✅ Test data cleaned up');
    return true;
  } catch (error) {
    console.error('❌ Error during test:', error);
    return false;
  } finally {
    await db.$disconnect();
  }
}

// Run the test
testApplication()
  .then(() => {
    console.log('Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  }); 