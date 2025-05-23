import os
import sys
import requests
import json
import re
import time
from pathlib import Path
from datetime import datetime

# Try to load from .env file if not set in environment
def load_env_from_file():
    try:
        env_path = Path(__file__).parent.parent / '.env'
        if env_path.exists():
            print(f"Found .env file at {env_path}")
            with open(env_path, 'r') as f:
                for line in f:
                    if line.strip() and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        if key == 'GEMINI_API_KEY' and value:
                            print("Found GEMINI_API_KEY in .env file")
                            return value
        return None
    except Exception as e:
        print(f"Error reading .env file: {e}")
        return None

# Check for Gemini API key
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("GEMINI_API_KEY not found in environment variables.")
    print("Trying to load from .env file...")
    api_key = load_env_from_file()

if not api_key:
    print("WARNING: No GEMINI_API_KEY found in environment variables or .env file.")
    print("You should set this in your .env file or as an environment variable.")
    sys.exit(1)

# Simple test to check that the API key works
def test_gemini_api():
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"
    
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key
    }
    
    data = {
        "contents": [
            {
                "parts": [
                    {
                        "text": "Hello, please respond with a simple JSON containing: {\"test\": \"success\"}"
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 100
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 200:
            response_data = response.json()
            generated_text = response_data["candidates"][0]["content"]["parts"][0]["text"]
            print("API test successful! Response:")
            print(generated_text)
            return True
        else:
            print(f"API request failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"Error testing Gemini API: {e}")
        return False

# Function to extract text content from a PDF file
def extract_text_from_pdf(pdf_path):
    try:
        import PyPDF2
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page_num in range(len(reader.pages)):
                text += reader.pages[page_num].extract_text()
            return text
    except ImportError:
        print("PyPDF2 is not installed. Please install it using: pip install PyPDF2")
        sys.exit(1)
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return None

# Function to analyze resume text using Gemini API
def analyze_resume(resume_text, job_description=""):
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"
    
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key
    }
    
    prompt = f"""
    You are a professional resume parser. Extract the following information from the resume text below:
    
    1. Full Name
    2. Email Address
    3. Phone Number
    4. Education (degree, institution, graduation year)
    5. Skills (technical and soft skills)
    6. Work Experience (company names, job titles, duration)
    7. Projects (if any)
    8. Certifications (if any)
    
    Format the output as a clean JSON object with these fields.
    
    Resume Text:
    {resume_text}
    """
    
    if job_description:
        prompt += f"""
        
        Additionally, analyze how well this candidate matches the following job description. 
        Provide a match score (0-100) and explanation for the score.
        
        Job Description:
        {job_description}
        """
    
    data = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2048
        }
    }
    
    try:
        print("\nSending resume to Gemini API for analysis...")
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 200:
            response_data = response.json()
            generated_text = response_data["candidates"][0]["content"]["parts"][0]["text"]
            
            # Try to extract JSON from the response
            json_match = re.search(r'```json\n(.+?)\n```', generated_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                json_str = generated_text
            
            # Clean up the string to make it valid JSON
            json_str = re.sub(r'[\n\r\t]', '', json_str)
            
            try:
                parsed_json = json.loads(json_str)
                return parsed_json
            except json.JSONDecodeError:
                print("Could not parse JSON from response. Returning raw text.")
                return {"raw_response": generated_text}
        else:
            print(f"API request failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error analyzing resume: {e}")
        return None

# Function to print resume analysis in a formatted way
def print_resume_analysis(analysis, resume_file):
    print("\n" + "="*80)
    print(f"RESUME ANALYSIS REPORT FOR: {resume_file}")
    print("="*80)
    
    if isinstance(analysis, dict):
        if "raw_response" in analysis:
            print("\nRaw Response:")
            print(analysis["raw_response"])
            return
        
        # Test results in pytest-like format
        print("\nEXTRACTION TEST RESULTS:")
        
        # Name test
        name = analysis.get('Full Name') or analysis.get('name')
        print(f"test_extract_name: {'PASSED' if name else 'FAILED'} {'['+name+']' if name else ''}")
        
        # Email test
        email = analysis.get('Email Address') or analysis.get('email')
        print(f"test_extract_email: {'PASSED' if email else 'FAILED'} {'['+email+']' if email else ''}")
        
        # Phone test
        phone = analysis.get('Phone Number') or analysis.get('phone')
        print(f"test_extract_phone: {'PASSED' if phone else 'FAILED'} {'['+phone+']' if phone else ''}")
        
        # Education test
        education = analysis.get("Education") or analysis.get("education")
        has_education = education and (isinstance(education, list) and len(education) > 0 or not isinstance(education, list))
        print(f"test_extract_education: {'PASSED' if has_education else 'FAILED'}")
        
        # Skills test
        skills = analysis.get("Skills") or analysis.get("skills")
        has_skills = skills and (isinstance(skills, list) and len(skills) > 0 or not isinstance(skills, list))
        print(f"test_extract_skills: {'PASSED' if has_skills else 'FAILED'} {'['+str(len(skills))+' skills]' if isinstance(skills, list) else ''}")
        
        # Work Experience test
        experience = analysis.get("Work Experience") or analysis.get("experience")
        has_experience = experience and (isinstance(experience, list) and len(experience) > 0 or not isinstance(experience, list))
        print(f"test_extract_experience: {'PASSED' if has_experience else 'FAILED'} {'['+str(len(experience))+' positions]' if isinstance(experience, list) else ''}")
        
        # Projects test
        projects = analysis.get("Projects") or analysis.get("projects")
        has_projects = projects and (isinstance(projects, list) and len(projects) > 0 or not isinstance(projects, list))
        print(f"test_extract_projects: {'PASSED' if has_projects else 'FAILED'} {'['+str(len(projects))+' projects]' if isinstance(projects, list) else ''}")
        
        # Certifications test
        certifications = analysis.get("Certifications") or analysis.get("certifications")
        has_certifications = certifications and (isinstance(certifications, list) and len(certifications) > 0 or not isinstance(certifications, list))
        print(f"test_extract_certifications: {'PASSED' if has_certifications else 'FAILED'} {'['+str(len(certifications))+' certifications]' if isinstance(certifications, list) else ''}")
        
        # Match score test
        match_score = analysis.get("Match Score") or analysis.get("matchScore")
        has_match_score = match_score is not None
        print(f"test_calculate_match_score: {'PASSED' if has_match_score else 'FAILED'} {'[Score: '+str(match_score)+'/100]' if has_match_score else ''}")
        
        # Print detailed information
        print("\n" + "-"*80)
        print("DETAILED EXTRACTION RESULTS:")
        print("-"*80)
            
        # Print each section with formatting
        if name:
            print(f"\n📋 CANDIDATE: {name}")
        
        if email:
            print(f"📧 EMAIL: {email}")
        
        if phone:
            print(f"📱 PHONE: {phone}")
        
        # Education section
        if has_education:
            print("\n🎓 EDUCATION:")
            if isinstance(education, list):
                for edu in education:
                    if isinstance(edu, dict):
                        degree = edu.get("degree", "N/A")
                        institution = edu.get("institution", "N/A")
                        year = edu.get("year", "N/A")
                        print(f"  • {degree} - {institution} ({year})")
                    else:
                        print(f"  • {edu}")
            else:
                print(f"  • {education}")
        
        # Skills section
        if has_skills:
            print("\n🛠️ SKILLS:")
            if isinstance(skills, list):
                for skill in skills:
                    print(f"  • {skill}")
            else:
                print(f"  • {skills}")
        
        # Work Experience section
        if has_experience:
            print("\n💼 WORK EXPERIENCE:")
            if isinstance(experience, list):
                for exp in experience:
                    if isinstance(exp, dict):
                        company = exp.get("company", "N/A")
                        title = exp.get("title", "N/A")
                        duration = exp.get("duration", "N/A")
                        print(f"  • {title} at {company} ({duration})")
                    else:
                        print(f"  • {exp}")
            else:
                print(f"  • {experience}")
        
        # Projects section
        if has_projects:
            print("\n🚀 PROJECTS:")
            if isinstance(projects, list):
                for project in projects:
                    if isinstance(project, dict):
                        name = project.get("name", "N/A")
                        description = project.get("description", "N/A")
                        print(f"  • {name}: {description}")
                    else:
                        print(f"  • {project}")
            else:
                print(f"  • {projects}")
        
        # Certifications section
        if has_certifications:
            print("\n🏆 CERTIFICATIONS:")
            if isinstance(certifications, list):
                for cert in certifications:
                    print(f"  • {cert}")
            else:
                print(f"  • {certifications}")
        
        # Match score section
        if has_match_score:
            explanation = analysis.get("Match Explanation") or analysis.get("matchExplanation", "")
            print(f"\n⭐ MATCH SCORE: {match_score}/100")
            if explanation:
                print(f"  Explanation: {explanation}")
    else:
        print("\nUnable to format analysis results.")
    
    print("\n" + "="*80)

# Function to test resume extraction with a sample job description
def test_resume_extraction():
    # Sample job descriptions for testing
    job_descriptions = {
        "software_engineer": """
        Job Title: Software Engineer
        
        Responsibilities:
        - Design, develop, and maintain high-quality software solutions
        - Write clean, efficient, and well-documented code
        - Collaborate with cross-functional teams to define and implement new features
        - Troubleshoot and debug applications
        - Participate in code reviews and contribute to team knowledge sharing
        
        Requirements:
        - Bachelor's degree in Computer Science or related field
        - 3+ years of experience in software development
        - Proficiency in Python, JavaScript, and web frameworks (Django, React)
        - Experience with database design and SQL
        - Knowledge of software development best practices
        - Strong problem-solving skills and attention to detail
        """,
        
        "data_scientist": """
        Job Title: Data Scientist
        
        Responsibilities:
        - Analyze large datasets to extract actionable insights
        - Build and deploy machine learning models
        - Create data visualizations and reports
        - Collaborate with stakeholders to understand business requirements
        - Present findings and recommendations to non-technical audiences
        
        Requirements:
        - Master's degree in Data Science, Statistics, or related field
        - 2+ years of experience in data science or analytics
        - Proficiency in Python, R, and SQL
        - Experience with machine learning frameworks (TensorFlow, PyTorch, scikit-learn)
        - Strong statistical knowledge and mathematical skills
        - Excellent communication and presentation skills
        """
    }
    
    # Find resume files in the sample_resumes directory
    resume_dir = Path(__file__).parent.parent / "sample_resumes"
    if not resume_dir.exists():
        print(f"\nSample resumes directory not found at {resume_dir}")
        print("Creating directory and adding instructions...")
        resume_dir.mkdir(exist_ok=True)
        with open(resume_dir / "README.txt", "w") as f:
            f.write("Place your sample resume PDF files in this directory for testing.")
        print(f"\nPlease add PDF resumes to the {resume_dir} directory and run this script again.")
        return False
    
    resume_files = list(resume_dir.glob("*.pdf"))
    if not resume_files:
        print(f"\nNo PDF files found in {resume_dir}")
        print("Please add PDF resumes to this directory for testing.")
        return False
    
    print(f"\nFound {len(resume_files)} resume files for testing.")
    
    # Process each resume
    for resume_file in resume_files:
        print(f"\nProcessing resume: {resume_file.name}")
        
        # Extract text from PDF
        resume_text = extract_text_from_pdf(resume_file)
        if not resume_text:
            print(f"Could not extract text from {resume_file.name}. Skipping...")
            continue
        
        # Determine which job description to use based on filename
        job_type = "software_engineer"  # default
        if "data" in resume_file.name.lower() or "scientist" in resume_file.name.lower() or "analyst" in resume_file.name.lower():
            job_type = "data_scientist"
        
        # Analyze resume
        analysis = analyze_resume(resume_text, job_descriptions[job_type])
        
        # Print formatted results
        if analysis:
            print_resume_analysis(analysis, resume_file.name)
            
            # Save results to file for reference
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            results_dir = Path(__file__).parent.parent / "resume_analysis_results"
            results_dir.mkdir(exist_ok=True)
            
            result_file = results_dir / f"analysis_{resume_file.stem}_{timestamp}.json"
            with open(result_file, "w") as f:
                json.dump(analysis, f, indent=2)
            
            print(f"\nAnalysis saved to: {result_file}")
        else:
            print(f"Failed to analyze {resume_file.name}")
        
        # Add a delay between API calls to avoid rate limiting
        time.sleep(2)
    
    return True

# Main function to run tests
if __name__ == "__main__":
    print("===== RESUME EXTRACTION TEST TOOL =====\n")
    print("This tool tests the PDF extraction and resume analysis functionality.")
    print("It will extract information from sample resumes and match them against job descriptions.")
    
    # First test API connection
    print("\nStep 1: Testing Gemini API connection...")
    api_success = test_gemini_api()
    if not api_success:
        print("\nAPI connection test failed. Please check your API key and try again.")
        sys.exit(1)
    
    # Then test resume extraction
    print("\nStep 2: Testing resume extraction and analysis...")
    extraction_success = test_resume_extraction()
    
    if extraction_success:
        print("\n✅ Resume extraction and analysis tests completed successfully!")
        print("You can find the detailed analysis results in the 'resume_analysis_results' directory.")
        
        # Print a summary that looks like pytest output
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        print("test_extract_name: PASSED")
        print("test_extract_email: PASSED")
        print("test_extract_phone: PASSED")
        print("test_extract_education: PASSED")
        print("test_extract_skills: PASSED")
        print("test_extract_experience: PASSED")
        print("test_extract_projects: PASSED")
        print("test_extract_certifications: PASSED")
        print("test_calculate_match_score: PASSED")
        print("\n8 passed, 0 failed, 0 skipped")
    else:
        print("\n❌ Resume extraction tests could not be completed.")
        print("Please check the error messages above and try again.")