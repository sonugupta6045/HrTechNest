import { Position, Job } from '@prisma/client';
import { extractSkillsFromText } from './skill-matcher';

// Function to analyze a job description and identify key requirements
export function analyzeJobDescription(job: Job | Position): { 
  skills: string[],
  experienceLevel: 'Entry' | 'Mid' | 'Senior',
  educationRequired: boolean, 
  remoteOption: boolean
} {
  const description = job.description?.toLowerCase() || '';
  const requirements = job.requirements?.toLowerCase() || '';
  const fullText = `${description} ${requirements}`;
  
  // Extract skills
  const skills = extractSkillsFromText(fullText);
  
  // Determine experience level
  let experienceLevel: 'Entry' | 'Mid' | 'Senior' = 'Mid';
  
  if (
    fullText.includes('senior') || 
    fullText.includes('lead') || 
    fullText.includes('principal') || 
    fullText.includes('5+ years') || 
    fullText.includes('7+ years') || 
    fullText.includes('10+ years')
  ) {
    experienceLevel = 'Senior';
  } else if (
    fullText.includes('junior') || 
    fullText.includes('entry') || 
    fullText.includes('graduate') || 
    fullText.includes('0-2 years') || 
    fullText.includes('1-2 years') || 
    fullText.includes('entry level')
  ) {
    experienceLevel = 'Entry';
  }
  
  // Check if education is required
  const educationRequired = 
    fullText.includes('degree') || 
    fullText.includes('bachelor') || 
    fullText.includes('bs') || 
    fullText.includes('ba') || 
    fullText.includes('master') || 
    fullText.includes('phd') || 
    fullText.includes('diploma');
  
  // Check if remote option is available
  const remoteOption = 
    fullText.includes('remote') || 
    fullText.includes('work from home') || 
    fullText.includes('telecommute') || 
    fullText.includes('virtual') || 
    fullText.includes('wfh');
  
  return {
    skills,
    experienceLevel,
    educationRequired,
    remoteOption
  };
}

// Function to compare two job descriptions and calculate similarity score
export function compareJobs(job1: Job | Position, job2: Job | Position): {
  similarityScore: number,
  commonSkills: string[]
} {
  const job1Analysis = analyzeJobDescription(job1);
  const job2Analysis = analyzeJobDescription(job2);
  
  // Find common skills
  const commonSkills = job1Analysis.skills.filter(skill => 
    job2Analysis.skills.includes(skill)
  );
  
  // Calculate similarity score based on common skills and other factors
  const skillScore = commonSkills.length / 
    Math.max(job1Analysis.skills.length, job2Analysis.skills.length, 1);
  
  // Add points for matching experience level
  const experienceLevelScore = job1Analysis.experienceLevel === job2Analysis.experienceLevel ? 1 : 0;
  
  // Calculate total similarity score (weighted)
  const similarityScore = Math.round((skillScore * 0.7 + experienceLevelScore * 0.3) * 100);
  
  return {
    similarityScore,
    commonSkills
  };
} 