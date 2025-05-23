# Resume Parser with Gemini AI

This document explains how the resume parsing functionality works using Google's Gemini AI.

## Overview

The resume parsing system extracts key information from PDF or document resumes using Google's Gemini API. When a resume is uploaded:

1. The file is temporarily saved on the server
2. Our Python script (`resume_parser_gemini.py`) sends the resume text to the Gemini API
3. Gemini parses the resume and returns structured data
4. This data is returned to the frontend to populate forms

## Components

### 1. Python Parser Script (`resume_parser_gemini.py`)

This script:
- Takes a resume file as input
- Extracts text content from the PDF
- Sends the text to the Gemini API with a structured prompt
- Processes the response into a standardized JSON format
- Falls back to traditional parsing methods if the API fails

### 2. API Route (`app/api/resume-parser/route.ts`)

This Next.js API route:
- Receives the uploaded file
- Saves it temporarily
- Calls the Python script with the appropriate arguments
- Returns the parsed data to the frontend
- Handles errors gracefully with fallback parsing

### 3. Frontend Integration

The resume parsing is integrated in two main places:
- The job application page (`app/(public)/jobs/[id]/apply/page.tsx`)
- The resume builder on the home page (`app/(public)/page.tsx`)

## Setup

1. Obtain a Gemini API key from the [Google AI Studio](https://ai.google.dev/)
2. Add the API key to your `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Ensure the Python dependencies are installed:
   ```
   pip install PyPDF2 requests
   ```

## Fallback Mechanism

If the Gemini API fails for any reason (quota exceeded, network issues, etc.), the system automatically falls back to traditional parsing methods using regular expressions to extract information.

## Limitations

- The accuracy of the extraction depends on the quality and format of the resume
- Some resume formats may be difficult to parse accurately
- PDF encryption or security features may prevent text extraction

## Future Improvements

- Add support for more document formats
- Improve extraction accuracy with fine-tuning
- Implement additional parsing features for specific industries
- Add resume scoring based on job requirements 