import { Application, Position } from '@prisma/client';
import stringSimilarity from 'string-similarity';

interface MatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

// Extract skills from a text string (job requirements)
export function extractSkillsFromText(text: string): string[] {
  // Common tech skills to look for - expand this list as needed
  const commonSkills = [
    'javascript', 'typescript', 'react', 'vue', 'angular', 'node', 'express',
    'python', 'django', 'flask', 'java', 'spring', 'c#', '.net', 'php', 'laravel',
    'ruby', 'rails', 'golang', 'rust', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
    'sql', 'mongodb', 'postgresql', 'mysql', 'nosql', 'redis', 'graphql', 'rest',
    'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material-ui', 'git',
    'ci/cd', 'jenkins', 'github actions', 'agile', 'scrum', 'jira', 'figma',
    'adobe xd', 'sketch', 'photoshop', 'illustrator', 'ui', 'ux', 'responsive design',
    'mobile development', 'react native', 'flutter', 'swift', 'kotlin',
    'tensorflow', 'pytorch', 'machine learning', 'ai', 'data science',
    'data analysis', 'data visualization', 'power bi', 'tableau',
    'devops', 'sre', 'security', 'penetration testing', 'ethical hacking',
  ];

  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Find all skills mentioned in the text
  return commonSkills.filter(skill => 
    lowerText.includes(skill.toLowerCase())
  );
}

// Match candidate skills with position requirements
export function matchSkills(
  candidateSkills: string[],
  position: Position
): MatchResult {
  // Extract skills from position requirements
  const positionSkills = extractSkillsFromText(position.requirements);
  
  if (positionSkills.length === 0) {
    return { matchScore: 0, matchedSkills: [], missingSkills: [] };
  }

  // Find matched skills
  const matchedSkills = candidateSkills.filter(skill => 
    positionSkills.some(posSkill => {
      // Check for exact match or high similarity
      return posSkill.toLowerCase() === skill.toLowerCase() || 
        stringSimilarity.compareTwoStrings(posSkill.toLowerCase(), skill.toLowerCase()) > 0.8;
    })
  );
  
  // Find missing skills
  const missingSkills = positionSkills.filter(posSkill => 
    !candidateSkills.some(skill => {
      return posSkill.toLowerCase() === skill.toLowerCase() || 
        stringSimilarity.compareTwoStrings(posSkill.toLowerCase(), skill.toLowerCase()) > 0.8;
    })
  );
  
  // Calculate match score (percentage)
  const matchScore = positionSkills.length > 0 
    ? Math.round((matchedSkills.length / positionSkills.length) * 100) 
    : 0;
  
  return {
    matchScore,
    matchedSkills,
    missingSkills
  };
}

// Function to evaluate multiple applications and return shortlisted candidates
export async function evaluateApplications(applications: Application[], position: Position) {
  // Map to store application IDs with their match scores
  const matchResults = applications.map(application => {
    const result = matchSkills(application.skills, position);
    
    return {
      applicationId: application.id,
      candidateId: application.candidateId,
      candidateName: application.name,
      email: application.email,
      phone: application.phone || '',
      position: position.title,
      matchScore: result.matchScore,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      status: application.status
    };
  });
  
  // Sort by match score (highest first)
  return matchResults.sort((a, b) => b.matchScore - a.matchScore);
} 