const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("==== Resume Parser Setup ====");
console.log("This script will help you set up the resume parser with Gemini API integration.\n");

// Check for .env file
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');
let envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log("⚠️ .env file not found.");
  console.log("We'll check your existing .env file for Gemini API key.\n");
} else {
  console.log("✅ .env file found.");
}

// Install Python dependencies
console.log("\nInstalling Python dependencies...");
try {
  execSync('pip install -r requirements.txt', { stdio: 'inherit' });
  console.log("✅ Python dependencies installed successfully.");
} catch (error) {
  console.error("❌ Failed to install Python dependencies:", error.message);
  console.log("Please run 'pip install -r requirements.txt' manually.");
}

// Check if GEMINI_API_KEY exists in .env
let hasGeminiKey = false;
if (envExists) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    hasGeminiKey = envContent.includes('GEMINI_API_KEY=');
    
    if (hasGeminiKey) {
      const match = envContent.match(/GEMINI_API_KEY=(.+)/);
      if (match && match[1] && match[1].trim() !== "" && !match[1].includes('your_gemini_api_key')) {
        console.log("\n✅ GEMINI_API_KEY found in .env file");
      } else {
        console.log("\n⚠️ GEMINI_API_KEY exists in .env file but appears to be empty or using a placeholder.");
        addGeminiKeyToEnv();
      }
    } else {
      console.log("\n⚠️ GEMINI_API_KEY not found in .env file.");
      addGeminiKeyToEnv();
    }
  } catch (error) {
    console.error("❌ Error reading .env file:", error.message);
    process.exit(1);
  }
} else {
  addGeminiKeyToEnv();
}

function addGeminiKeyToEnv() {
  rl.question("Do you have a Gemini API key? (y/n): ", (answer) => {
    if (answer.toLowerCase() === 'y') {
      rl.question("Please enter your Gemini API key: ", (apiKey) => {
        try {
          const envContent = envExists ? fs.readFileSync(envPath, 'utf8') : fs.readFileSync(envExamplePath, 'utf8');
          
          let updatedContent;
          if (hasGeminiKey) {
            // Replace existing key
            updatedContent = envContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY=${apiKey}`);
          } else {
            // Add new key
            updatedContent = envContent + `\nGEMINI_API_KEY=${apiKey}\n`;
          }
          
          fs.writeFileSync(envPath, updatedContent);
          console.log("✅ GEMINI_API_KEY added to .env file.");
          completeSetup();
        } catch (error) {
          console.error("❌ Error updating .env file:", error.message);
          process.exit(1);
        }
      });
    } else {
      console.log("\n⚠️ The Gemini-powered resume parser requires a Gemini API key.");
      console.log("You can obtain one from the Google AI Studio: https://ai.google.dev/");
      console.log("The parser will fall back to traditional parsing methods without the API key.");
      completeSetup();
    }
  });
}

function completeSetup() {
  console.log("\n==== Setup Complete ====");
  console.log("You can now use the Gemini-powered resume parser.");
  console.log("To test your setup, run: node scripts/test_setup.js");
  console.log("To test the Gemini API, run: python scripts/test_gemini.py");
  
  rl.close();
}

// If no interaction needed
if (envExists && hasGeminiKey) {
  console.log("\n==== Setup Complete ====");
  console.log("You can now use the Gemini-powered resume parser.");
  console.log("To test your setup, run: node scripts/test_setup.js");
  console.log("To test the Gemini API, run: python scripts/test_gemini.py");
  rl.close();
} 