# HR Management System

An AI-powered HR Management System designed to automate and streamline the recruitment process, from job posting and resume parsing to candidate management and interview scheduling. Built with modern web technologies and integrated with advanced AI for smarter hiring decisions.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Setup & Installation](#setup--installation)
- [Usage Guide](#usage-guide)
- [Resume Parsing Details](#resume-parsing-details)
- [Scripts](#scripts)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Features

### AI Resume Parsing
- Upload PDF resumes via the web interface.
- Uses Google Gemini API to extract structured information (skills, experience, education, contact info).
- Falls back to regex-based parsing if AI fails.
- Results are stored and can be reviewed in the admin dashboard.

### Candidate Matching
- Automatically matches candidates to job descriptions based on skills, experience, and other relevant factors.
- Uses AI and custom algorithms for ranking and recommendations.

### Job Listings & Applications
- HR/Admins can post new job openings.
- Candidates can browse jobs and apply directly.
- Application status tracking for both candidates and HR.

### Interview Scheduling
- Automated interview scheduling with Google Calendar integration.
- Sends notifications and reminders to candidates and interviewers.

### Analytics Dashboard
- Visualizes recruitment pipeline, candidate sources, and key HR metrics.
- Customizable charts and reports for HR insights.

### Authentication & User Management
- Secure login and user management powered by Clerk.
- Role-based access for Admins, Recruiters, and Candidates.

### Admin Dashboard
- Manage company guidelines, onboarding, compliance, and support resources.
- View and manage all users, jobs, and applications.

---

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Framer Motion
- **Backend:** Next.js API routes (Node.js), Python (for resume parsing)
- **Database:** NeonDB (PostgreSQL)
- **Authentication:** Clerk
- **AI Integration:** Google Gemini API
- **Other Integrations:** Google Calendar (for interview scheduling)

---

## Architecture Overview

- **Frontend:**  
  The user interface is built with React and rendered using Next.js. Users (HR/Admins and Candidates) interact with the system through web pages for job listings, applications, dashboards, and scheduling. Tailwind CSS is used for styling, and Framer Motion adds smooth animations to enhance user experience.

- **Backend:**  
  All business logic is handled by Next.js API routes. When a user submits a resume or applies for a job, the frontend sends a request to these API endpoints. For advanced resume parsing, the backend invokes a Python script, passing the uploaded PDF file for processing.

- **Resume Parsing:**  
  When a candidate uploads a resume, the backend saves the file and calls a Python script. This script uses the Google Gemini API to extract structured data (skills, experience, education, etc.) from the PDF. If the AI fails, the script falls back to regex-based extraction. The parsed data is returned to the backend and stored in the database.

- **Database:**  
  All user accounts, job postings, applications, and parsed resume data are stored in a NeonDB (PostgreSQL) database. The backend reads from and writes to this database to manage the recruitment workflow.

- **AI Integration:**  
  The backend communicates with the Google Gemini API to perform AI-powered resume parsing and candidate-job matching. This allows the system to extract detailed information from resumes and recommend the best candidates for each job.

- **Authentication:**  
  User authentication and role management are handled by Clerk. When users sign up or log in, Clerk verifies their identity and assigns roles (Admin, Recruiter, or Candidate), controlling access to different parts of the system.

- **Interview Scheduling:**  
  When HR schedules an interview, the backend integrates with the Google Calendar API to create events, send invites, and set reminders for both candidates and interviewers. This ensures everyone is notified and keeps the process organized.

---

## Setup & Installation

### 1. Clone the Repository

```sh
git clone https://github.com/sonugupta6045/HrTechNest.git
```

### 2. Install Node.js Dependencies

```sh
npm install
```

### 3. Configure Environment Variables

#### Email (Contact Form)

```sh
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
Create a `.env.local` file in the root directory:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

```

#### Gemini Resume Parser & Database

Create or update your `.env` file:

```
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_neondb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

See [RESUME_PARSER_README.md](RESUME_PARSER_README.md) for more details on AI integration.

### 4. Install Python Dependencies

Install required Python packages for resume parsing:

```sh
pip install PyPDF2 requests
```

### 5. Database Setup

- Create a NeonDB account and project ([see NEONDB_SETUP.md](NEONDB_SETUP.md))
- Set your `DATABASE_URL` in `.env`
- Run migrations (if using Prisma):

```sh
npx prisma migrate deploy
```

### 6. Run the Application

```sh
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Usage Guide

1. **Admin/HR Login:** Sign in using Clerk authentication.
2. **Post Jobs:** Navigate to the admin dashboard to create and manage job listings.
3. **Candidate Application:** Candidates can browse jobs and upload their resumes in PDF format.
4. **Resume Parsing:** Uploaded resumes are parsed using AI and stored in the database.
5. **Candidate Review:** HR can view parsed candidate profiles, match them to jobs, and schedule interviews.
6. **Interview Scheduling:** Use the integrated calendar to set up interviews and send invites.
7. **Analytics:** Monitor recruitment metrics and pipeline progress in the dashboard.

---

## Resume Parsing Details

- **Upload:** Candidates upload PDF resumes via the web interface.
- **Processing:** The backend sends the file to a Python script, which uses Google Gemini API for parsing.
- **Fallback:** If the AI fails, regex-based extraction is used.
- **Storage:** Parsed data is saved in the database and available for HR review.
- **Customization:** Parsing logic can be extended in `resume_parser.py` (see [RESUME_PARSER_README.md](RESUME_PARSER_README.md)).

---

## Scripts

- `setup.js`: Interactive setup for Gemini API and Python dependencies.
- `scripts/test_setup.js`: Checks environment and parser setup.
- `scripts/test_gemini.py`: Tests Gemini API and resume extraction.
- `scripts/test_parser.js`: Node.js test for the parser.

---

## Folder Structure

- `app/`: Next.js app directory (pages, API routes, styles)
- `components/`: Reusable React components
- `lib/`: Utility functions and helpers
- `prisma/`: Prisma schema and migrations
- `public/`: Static assets (images, icons, etc.)
- `scripts/`: Setup and test scripts
- `resume_analysis_results/`: Output from resume analysis
- `sample_resumes/`: Sample resumes for testing

---

## Contributing

We welcome contributions!

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a pull request

Please see [CONTRIBUTING.md](CONTRIBUTING.md) if available.

---



## Acknowledgements

- [Google Gemini API](https://ai.google.dev/)
- [NeonDB](https://neon.tech)
- [Clerk](https://clerk.com)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
## License


This project is licensed under the MIT License.  
See the [LICENSE](LICENSE) file for full license details.

&copy; 2024-2025 Sonu Gupta. All rights

---