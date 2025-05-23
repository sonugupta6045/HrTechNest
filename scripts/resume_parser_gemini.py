import PyPDF2
import re
import json
import sys
import time
import random
import os
from pathlib import Path
import requests
import base64
import argparse

# Try to load from .env file if not set in environment
def load_env_from_file():
    try:
        env_path = Path(__file__).parent.parent / '.env'
        if env_path.exists():
            with open(env_path, 'r') as f:
                for line in f:
                    if line.strip() and not line.startswith('#'):
                        try:
                            key, value = line.strip().split('=', 1)
                            if key == 'GEMINI_API_KEY' and value:
                                return value
                        except ValueError:
                            # Skip lines that don't split into key=value
                            continue
        return None
    except Exception as e:
        print(f"Error reading .env file: {e}", file=sys.stderr)
        return None

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file using PyPDF2."""
    try:
        text = ""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        if not text.strip():
            print("Warning: No text extracted from PDF", file=sys.stderr)
            return ""
            
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}", file=sys.stderr)
        return ""

def encode_pdf_to_base64(pdf_path):
    """Encode PDF file to base64 for Gemini API."""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_bytes = file.read()
            base64_encoded = base64.b64encode(pdf_bytes).decode('utf-8')
            return base64_encoded
    except Exception as e:
        print(f"Error encoding PDF to base64: {e}", file=sys.stderr)
        return None

def extract_resume_data_with_gemini(api_key, text, filename, job_requirements=None):
    """Extract resume data using Google's Gemini API."""
    try:
        # If no API key is provided, fallback to traditional parsing
        if not api_key:
            print("No Gemini API key provided. Falling back to traditional parsing.", file=sys.stderr)
            return None

        # Prepare the request to Gemini API
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"
        
        # The prompt that instructs Gemini how to extract and format the resume data
        prompt = f"""
        You are a resume parser API. Extract the following information from the resume text below:
        
        1. Full name
        2. Email address
        3. Phone number
        4. Skills (as a list)
        5. Experience (both duration and details)
        6. Education details, particularly 10th and 12th standard information including:
           - School name
           - Year
           - Percentage/CGPA
        
        Format the output as a JSON object with the following structure:
        {{
            "name": "Extracted name",
            "email": "Extracted email",
            "phone": "Extracted phone",
            "skills": ["Skill 1", "Skill 2", ...],
            "experience": "Experience duration (e.g., 2 years)",
            "education": {{
                "tenth": {{
                    "school": "School name",
                    "year": "Year of completion",
                    "percentage": "Percentage or CGPA"
                }},
                "twelfth": {{
                    "school": "School name",
                    "year": "Year of completion",
                    "percentage": "Percentage or CGPA"
                }}
            }}
        }}
        
        Extract the most relevant skills even if they're not explicitly listed under a "Skills" section.
        
        Resume text: {text}
        
        If you can't find specific information, use empty strings or arrays for those fields. 
        Respond ONLY with the JSON object and no additional text.
        """
        
        # Prepare the request body
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": api_key
        }
        
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
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024
            }
        }
        
        # Send the request to Gemini API
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code != 200:
            print(f"Error from Gemini API: {response.status_code} - {response.text}", file=sys.stderr)
            return None
        
        response_data = response.json()
        
        # Extract the text from the response
        try:
            generated_text = response_data["candidates"][0]["content"]["parts"][0]["text"]
            
            # Clean up the response to ensure it's valid JSON
            # Remove markdown code blocks if present
            generated_text = re.sub(r'```json\s*|\s*```', '', generated_text)
            generated_text = generated_text.strip()
            
            # Parse the JSON response
            parsed_data = json.loads(generated_text)
            
            # Generate a candidate ID
            candidate_id = f"CAND-{int(time.time())}-{random.randint(1000, 9999)}"
            parsed_data["candidateId"] = candidate_id
            
            # Calculate match score
            match_score = calculate_match_score(
                parsed_data.get("skills", []), 
                parsed_data.get("experience", ""),
                job_requirements,
                parsed_data.get("education", {})
            )
            parsed_data["matchScore"] = match_score
            
            return parsed_data
            
        except (KeyError, json.JSONDecodeError) as e:
            print(f"Error parsing Gemini API response: {e}", file=sys.stderr)
            print(f"Response: {response_data}", file=sys.stderr)
            return None
            
    except Exception as e:
        print(f"Error using Gemini API: {e}", file=sys.stderr)
        return None

def calculate_match_score(skills, experience, job_requirements=None, education=None):
    """Calculate a match score based on skills, experience, and job requirements.
    If job_requirements is provided, compare skills against them.
    Use education scores as tiebreakers."""
    base_score = 0
    skill_score = 0
    experience_score = 0
    education_score = 0
    max_score = 100
    
    # Calculate skill score (max 60 points)
    if isinstance(skills, list) and skills:
        if job_requirements and isinstance(job_requirements, list) and job_requirements:
            # Compare skills with job requirements using similarity matching
            matched_skills = 0
            total_requirements = len(job_requirements)
            
            for req in job_requirements:
                req_lower = req.lower()
                best_match = 0
                
                for skill in skills:
                    skill_lower = skill.lower()
                    # Direct match
                    if req_lower in skill_lower or skill_lower in req_lower:
                        best_match = 1
                        break
                    # Similarity match
                    match_score = similarity(req_lower, skill_lower)
                    best_match = max(best_match, match_score)
                
                matched_skills += best_match
            
            # Calculate percentage of matched requirements
            if total_requirements > 0:
                skill_score = int((matched_skills / total_requirements) * 60)
            else:
                skill_score = 30  # Default if no requirements specified
        else:
            # Fallback if no job requirements provided
            skill_score = min(len(skills) * 5, 60)  # Max 60 points for skills
    
    # Calculate experience score (max 30 points)
    years_match = re.search(r'(\d+)', str(experience))
    if years_match:
        years = int(years_match.group(1))
        experience_score = min(years * 6, 30)  # Max 30 points for experience
    
    # Calculate education score (max 10 points)
    if education and isinstance(education, dict):
        tenth_score = 0
        twelfth_score = 0
        
        # Process 10th percentage
        if 'tenth' in education and 'percentage' in education['tenth']:
            try:
                percentage_str = education['tenth']['percentage']
                # Extract numeric value from percentage string
                percentage_match = re.search(r'(\d+(\.\d+)?)', str(percentage_str))
                if percentage_match:
                    percentage = float(percentage_match.group(1))
                    tenth_score = min(percentage / 20, 5)  # Max 5 points, scaled from percentage
            except (ValueError, TypeError):
                pass
        
        # Process 12th percentage
        if 'twelfth' in education and 'percentage' in education['twelfth']:
            try:
                percentage_str = education['twelfth']['percentage']
                # Extract numeric value from percentage string
                percentage_match = re.search(r'(\d+(\.\d+)?)', str(percentage_str))
                if percentage_match:
                    percentage = float(percentage_match.group(1))
                    twelfth_score = min(percentage / 20, 5)  # Max 5 points, scaled from percentage
            except (ValueError, TypeError):
                pass
        
        education_score = tenth_score + twelfth_score
    
    # Calculate total score
    base_score = skill_score + experience_score
    total_score = base_score + education_score
    
    # Ensure score is within range 0-100
    return min(max(total_score, 0), max_score)

def similarity(a, b):
    """Measure similarity between two strings."""
    from difflib import SequenceMatcher
    return SequenceMatcher(None, a, b).ratio()

def parse_resume(pdf_path, filename, api_key=None, job_requirements=None):
    """Parse a resume PDF to extract relevant information."""
    text = extract_text_from_pdf(pdf_path)
    
    # Try using Gemini API first
    if api_key:
        gemini_data = extract_resume_data_with_gemini(api_key, text, filename, job_requirements)
        if gemini_data:
            return gemini_data
    
    # Fallback to traditional parsing if Gemini API fails or is not available
    print("Falling back to traditional parsing", file=sys.stderr)
    
    # Import functions from the original parser
    from resume_parser import extract_name, extract_email, extract_phone, extract_skills, extract_experience, extract_education
    
    name = extract_name(text, filename)
    email = extract_email(text)
    phone = extract_phone(text)
    skills = extract_skills(text)
    experience = extract_experience(text)
    education = extract_education(text)

    candidate_id = f"CAND-{int(time.time())}-{random.randint(1000, 9999)}"
    
    match_score = calculate_match_score(skills, experience, job_requirements, education)

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "experience": experience,
        "education": education,
        "candidateId": candidate_id,
        "matchScore": match_score
    }

# Example usage
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Parse resume PDF using Gemini API")
    parser.add_argument("pdf_path", help="Path to the resume PDF file")
    parser.add_argument("--api_key", help="Gemini API key (optional)")
    parser.add_argument("--job_requirements", help="Job requirements as comma-separated list (optional)")
    args = parser.parse_args()
    
    # Process job requirements if provided
    job_reqs = None
    if args.job_requirements:
        job_reqs = [req.strip() for req in args.job_requirements.split(',')]
    
    # Get API key from args or environment
    api_key = args.api_key or os.environ.get('GEMINI_API_KEY') or load_env_from_file()
    
    # Parse the resume
    result = parse_resume(args.pdf_path, os.path.basename(args.pdf_path), api_key, job_reqs)
    
    # Print the result as JSON
    print(json.dumps(result, indent=2))