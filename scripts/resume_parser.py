import PyPDF2
import re
import json
import sys
import time
import random
import os
from pathlib import Path


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


def extract_name(text, filename):
    """Extract the candidate's name from the resume."""
    lines = text.strip().split('\n')
    for line in lines[:5]:  # Check first 5 lines
        if line.strip() and not any(header in line.lower() for header in ['resume', 'cv', 'curriculum vitae', 'email', 'phone', 'address']):
            return line.strip()
    
    if filename:
        name = re.sub(r'\.(pdf|doc|docx)$', '', filename, flags=re.IGNORECASE)
        name = re.sub(r'[_-]', ' ', name)
        name = ' '.join(word.capitalize() for word in name.split())
        if name:
            return name
    
    return ""


def extract_email(text):
    """Extract email address from the resume."""
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    emails = re.findall(email_pattern, text)
    return emails[0] if emails else ""


def extract_phone(text):
    """Extract phone number from the resume."""
    phone_pattern = r'(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    phones = re.findall(phone_pattern, text)
    return phones[0] if phones else ""


def extract_skills(text):
    """Extract skills from the resume."""
    skill_keywords = [
        "javascript", "typescript", "react", "node.js", "python", "java", "sql",
        "aws", "docker", "kubernetes", "git", "agile", "scrum", "leadership",
        "communication", "problem solving", "project management", "next.js",
        "express", "mongodb", "postgresql", "redis", "graphql", "rest api",
        "ci/cd", "jenkins", "github actions", "terraform", "cloud computing",
        "machine learning", "ai", "data science", "analytics", "testing",
        "unit testing", "integration testing", "automation", "devops", "html", "css"
    ]
    
    skills_section = ""
    sections = re.split(r'\n\s*(?:SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES)\s*\n', text, flags=re.IGNORECASE)
    if len(sections) > 1:
        skills_section = sections[1]
    
    if not skills_section:
        skills_section = text
    
    text_lower = skills_section.lower()
    found_skills = [skill for skill in skill_keywords if skill in text_lower]
    
    skills_list_pattern = r'(?:skills|technical skills|core competencies):\s*([^\.]+)'
    skills_match = re.search(skills_list_pattern, text, re.IGNORECASE)
    if skills_match:
        skills_text = skills_match.group(1)
        for skill in skills_text.split(','):
            skill = skill.strip().lower()
            if skill and skill not in found_skills:
                found_skills.append(skill)
    
    if not found_skills:
        found_skills = ["JavaScript", "React", "Node.js"]
    
    return found_skills


def extract_experience(text):
    """Extract years of experience from the resume."""
    experience_section = ""
    sections = re.split(r'\n\s*(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT HISTORY)\s*\n', text, flags=re.IGNORECASE)
    if len(sections) > 1:
        experience_section = sections[1]
    
    if not experience_section:
        experience_section = text
    
    experience_pattern = r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*experience'
    match = re.search(experience_pattern, experience_section, re.IGNORECASE)
    return match.group(0) if match else ""


def extract_education(text):
    """Extract education details from the resume."""
    education_section = ""
    sections = re.split(r'\n\s*(?:EDUCATION|QUALIFICATION|ACADEMIC|EDUCATIONAL BACKGROUND)\s*\n', text, flags=re.IGNORECASE)
    if len(sections) > 1:
        education_section = sections[1]
    
    if not education_section:
        education_section = text
    
    tenth_school = ""
    tenth_year = ""
    tenth_percentage = ""
    
    tenth_patterns = [
        r'(?:10th|X|SSC|Secondary School Certificate).*?(?:from|at|in)?\s*([A-Za-z0-9\s\.]+(?:School|College|Institution|Academy|High School))',
        r'(?:10th|X|SSC|Secondary School Certificate).*?(\d{4})',
        r'(?:10th|X|SSC|Secondary School Certificate).*?(\d+(?:\.\d+)?%)'
    ]
    
    for pattern in tenth_patterns:
        match = re.search(pattern, education_section, re.IGNORECASE)
        if match:
            if "School" in pattern or "College" in pattern or "Institution" in pattern or "Academy" in pattern or "High School" in pattern:
                tenth_school = match.group(1).strip()
            elif r'\d{4}' in pattern:
                tenth_year = match.group(1).strip()
            elif r'\d+(?:\.\d+)?%' in pattern:
                tenth_percentage = match.group(1).strip()
    
    twelfth_school = ""
    twelfth_year = ""
    twelfth_percentage = ""
    
    twelfth_patterns = [
        r'(?:12th|XII|HSC|Higher Secondary Certificate).*?(?:from|at|in)?\s*([A-Za-z0-9\s\.]+(?:School|College|Institution|Academy|Junior College))',
        r'(?:12th|XII|HSC|Higher Secondary Certificate).*?(\d{4})',
        r'(?:12th|XII|HSC|Higher Secondary Certificate).*?(\d+(?:\.\d+)?%)'
    ]
    
    for pattern in twelfth_patterns:
        match = re.search(pattern, education_section, re.IGNORECASE)
        if match:
            if "School" in pattern or "College" in pattern or "Institution" in pattern or "Academy" in pattern or "Junior College" in pattern:
                twelfth_school = match.group(1).strip()
            elif r'\d{4}' in pattern:
                twelfth_year = match.group(1).strip()
            elif r'\d+(?:\.\d+)?%' in pattern:
                twelfth_percentage = match.group(1).strip()

    return {
        "tenth": {
            "school": tenth_school,
            "year": tenth_year,
            "percentage": tenth_percentage
        },
        "twelfth": {
            "school": twelfth_school,
            "year": twelfth_year,
            "percentage": twelfth_percentage
        }
    }


def parse_resume(pdf_path, filename):
    """Parse a resume PDF to extract relevant information."""
    text = extract_text_from_pdf(pdf_path)
    name = extract_name(text, filename)
    email = extract_email(text)
    phone = extract_phone(text)
    skills = extract_skills(text)
    experience = extract_experience(text)
    education = extract_education(text)

    candidate_id = f"CAND-{int(time.time())}-{random.randint(1000, 9999)}"
    
    match_score = calculate_match_score(skills, experience)

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


def calculate_match_score(skills, experience):
    """Calculate a match score based on skills and experience."""
    score = 0
    
    skill_score = min(len(skills) * 5, 50)  # Max 50 points for skills
    score += skill_score
    
    years_match = re.search(r'(\d+)', experience)
    if years_match:
        years = int(years_match.group(1))
        experience_score = min(years * 10, 50)  # Max 50 points for experience
        score += experience_score

    return score


# Example usage
if __name__ == "__main__":
    pdf_path = "path_to_resume.pdf"
    filename = os.path.basename(pdf_path)
    candidate_data = parse_resume(pdf_path, filename)
    print(json.dumps(candidate_data, indent=2))
