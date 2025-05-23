const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// No need for dotenv, Prisma will automatically load the .env file

async function createTestApplication() {
  console.log('Starting test application creation...');
  
  try {
    // Create a test candidate first
    const testCandidate = await prisma.candidate.upsert({
      where: { email: 'test@example.com' },
      update: {
        name: 'Test Candidate',
        phone: '1234567890',
        resumeUrl: 'https://example.com/resume.pdf', // Important field
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: '3 years',
      },
      create: {
        name: 'Test Candidate',
        email: 'test@example.com',
        phone: '1234567890',
        resumeUrl: 'https://example.com/resume.pdf', // Important field
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: '3 years',
      },
    });
    
    console.log('✅ Test candidate created:', testCandidate);
    
    // Get a position to apply for
    const positions = await prisma.position.findMany({
      take: 1,
    });
    
    if (positions.length === 0) {
      console.log('No positions found. Creating a test position...');
      
      // Create a test position if none exists
      const testPosition = await prisma.position.create({
        data: {
          title: 'Test Position',
          department: 'Engineering',
          location: 'Remote',
          type: 'Full-time',
          description: 'This is a test position',
          requirements: 'JavaScript, React, Node.js',
          status: 'Open',
          userId: 'test-user-id', // Replace with an actual user ID if needed
        },
      });
      
      console.log('✅ Test position created:', testPosition);
      
      // Create the application with the required resumeUrl field
      const testApplication = await prisma.application.create({
        data: {
          candidateId: testCandidate.id,
          positionId: testPosition.id,
          resumeUrl: 'https://example.com/resume.pdf', // Required field
          name: 'Test Candidate',
          email: 'test@example.com',
          phone: '1234567890',
          skills: ['JavaScript', 'React', 'Node.js'],
          experience: '3 years',
          status: 'PENDING',
          matchScore: 75,
        },
      });
      
      console.log('✅ Test application created:', testApplication);
    } else {
      const position = positions[0];
      console.log('Using existing position:', position);
      
      // Create the application with the required resumeUrl field
      const testApplication = await prisma.application.create({
        data: {
          candidateId: testCandidate.id,
          positionId: position.id,
          resumeUrl: 'https://example.com/resume.pdf', // Required field
          name: 'Test Candidate',
          email: 'test@example.com',
          phone: '1234567890',
          skills: ['JavaScript', 'React', 'Node.js'],
          experience: '3 years',
          status: 'PENDING',
          matchScore: 75,
        },
      });
      
      console.log('✅ Test application created:', testApplication);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error creating test application:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createTestApplication()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(e => {
    console.error('Error in test script:', e);
    process.exit(1);
  }); 