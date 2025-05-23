const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("=== Testing Resume Parser ===");

// Check if .env file exists
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  console.log("✅ Found .env file");
  
  // Check if GEMINI_API_KEY is in the .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('GEMINI_API_KEY=')) {
    console.log("✅ GEMINI_API_KEY found in .env file");
  } else {
    console.log("⚠️ GEMINI_API_KEY not found in .env file. The parser will use traditional methods.");
  }
} else {
  console.log("⚠️ .env file not found. The parser will use traditional methods.");
}

// Check if test PDF exists
const samplePdfPath = path.join(__dirname, 'sample_resume.pdf');
let hasSamplePdf = fs.existsSync(samplePdfPath);

if (!hasSamplePdf) {
  console.log("\n⚠️ No sample PDF found. Creating a minimal test PDF...");
  
  try {
    // Generate a simple sample PDF using Node.js
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(samplePdfPath));
    
    doc.fontSize(16).text('John Doe', { align: 'center' });
    doc.fontSize(12).text('john.doe@example.com', { align: 'center' });
    doc.text('(123) 456-7890', { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(14).text('Summary');
    doc.fontSize(10).text('Experienced software developer with 5 years of experience in web development.');
    
    doc.moveDown();
    doc.fontSize(14).text('Skills');
    doc.fontSize(10).text('JavaScript, React, Node.js, Python, SQL');
    
    doc.moveDown();
    doc.fontSize(14).text('Education');
    doc.fontSize(10).text('10th Standard - ABC High School - 2010 - 85%');
    doc.fontSize(10).text('12th Standard - XYZ Higher Secondary School - 2012 - 90%');
    
    doc.end();
    
    console.log("✅ Created sample PDF for testing");
    hasSamplePdf = true;
  } catch (error) {
    console.log("❌ Failed to create sample PDF:", error.message);
    console.log("Please install pdfkit package with: npm install pdfkit");
  }
}

// Test the parser if we have a sample PDF
if (hasSamplePdf) {
  console.log("\nTesting resume parser...");
  try {
    const scriptPath = path.join(__dirname, 'resume_parser_gemini.py');
    const output = execSync(`python "${scriptPath}" "${samplePdfPath}"`, { encoding: 'utf8' });
    
    try {
      const parsedData = JSON.parse(output);
      console.log("\n✅ Parser test successful!");
      console.log("\nExtracted Data:");
      console.log(JSON.stringify(parsedData, null, 2));
    } catch (jsonError) {
      console.log("\n❌ Failed to parse output as JSON:", jsonError.message);
      console.log("Raw output:", output);
    }
  } catch (error) {
    console.log("\n❌ Error running parser:", error.message);
    
    if (error.stderr) {
      console.log("Error details:", error.stderr);
    }
  }
} 