const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if .env file exists
console.log("Checking for .env file...");
const envExists = fs.existsSync(path.join(__dirname, '../.env'));
console.log(envExists ? "✅ .env file found" : "❌ .env file not found. Please create one based on .env.example");

// Check for required Python packages
console.log("\nChecking for required Python packages...");
try {
  execSync('pip freeze');
  const pipOutput = execSync('pip freeze', { encoding: 'utf8' });
  
  const requiredPackages = [
    'PyPDF2',
    'requests',
    'python-dotenv'
  ];
  
  const missingPackages = [];
  
  for (const pkg of requiredPackages) {
    if (!pipOutput.includes(pkg)) {
      missingPackages.push(pkg);
    }
  }
  
  if (missingPackages.length > 0) {
    console.log(`❌ Missing Python packages: ${missingPackages.join(', ')}`);
    console.log("Run this command to install them:");
    console.log("pip install -r requirements.txt");
  } else {
    console.log("✅ All required Python packages are installed");
  }
} catch (error) {
  console.log("❌ Error checking Python packages:", error.message);
}

// Check for the Gemini API key in the environment
console.log("\nChecking for GEMINI_API_KEY...");
if (envExists) {
  try {
    const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
    const hasGeminiKey = envContent.includes('GEMINI_API_KEY=');
    
    if (hasGeminiKey) {
      // Check if the key is not empty
      const match = envContent.match(/GEMINI_API_KEY=(.+)/);
      if (match && match[1] && match[1].trim() !== "" && !match[1].includes('your_gemini_api_key')) {
        console.log("✅ GEMINI_API_KEY found in .env file");
      } else {
        console.log("❌ GEMINI_API_KEY is empty or using placeholder. Please add your actual API key from Google AI Studio");
      }
    } else {
      console.log("❌ GEMINI_API_KEY not found in .env file. Please add it based on .env.example");
    }
  } catch (error) {
    console.log("❌ Error reading .env file:", error.message);
  }
}

// Check for Python parser scripts
console.log("\nChecking for parser scripts...");

const requiredScripts = [
  { file: 'resume_parser.py', message: "Original resume parser" },
  { file: 'resume_parser_gemini.py', message: "Gemini-powered resume parser" }
];

for (const script of requiredScripts) {
  const exists = fs.existsSync(path.join(__dirname, script.file));
  console.log(exists 
    ? `✅ ${script.message} found` 
    : `❌ ${script.file} not found. Make sure all script files are in the scripts directory`);
}

console.log("\nSetup check complete!");
console.log("If all checks passed, your system is ready to use the Gemini-powered resume parser.");
console.log("If you encountered any issues, please fix them before proceeding."); 