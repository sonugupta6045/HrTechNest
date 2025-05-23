"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type RankedCandidate = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  skills: string[];
  experience: string | null;
  tenthPercentage: string | null;
  twelfthPercentage: string | null;
  positionId: string | null;
  positionTitle: string | null;
  skillMatchScore: number;
  rankingScore: number;
  applications: {
    id: string;
    status: string;
    matchScore: number | null;
  }[];
}

type DetailedCandidate = RankedCandidate & {
  tenthSchool: string | null;
  tenthYear: string | null;
  twelfthSchool: string | null;
  twelfthYear: string | null;
  positionRequirements: string | null;
  applications: {
    id: string;
    status: string;
    matchScore: number | null;
    positionId: string | null;
    positionTitle: string | null;
    createdAt: Date;
    interviews: {
      id: string;
      scheduledFor: Date;
      duration: number;
      status: string;
      meetingUrl: string | null;
    }[];
  }[];
};

export async function getCandidatesWithRankings() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Fetch all candidates with their applications and position details
  const candidates = await prisma.candidate.findMany({
    include: {
      applications: {
        include: {
          position: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Get all positions to use for skill matching
  const positions = await prisma.position.findMany({
    where: {
      userId: userId
    }
  });

  // Transform candidates and calculate ranking scores
  const rankedCandidates: RankedCandidate[] = candidates.map(candidate => {
    // Find the best matching position for this candidate
    let bestPositionMatch = {
      positionId: null as string | null,
      positionTitle: null as string | null,
      skillMatchScore: 0,
      position: null as any
    };

    // Check candidate's applications first
    if (candidate.applications.length > 0) {
      for (const app of candidate.applications) {
        if (app.position) {
          const skillMatchScore = calculateSkillMatch(candidate.skills, app.position.requirements);
          
          if (skillMatchScore > bestPositionMatch.skillMatchScore) {
            bestPositionMatch = {
              positionId: app.position.id,
              positionTitle: app.position.title,
              skillMatchScore,
              position: app.position
            };
          }
        }
      }
    }
    
    // If no applications or no good match found, try to find a matching position
    if (bestPositionMatch.skillMatchScore === 0 && positions.length > 0) {
      for (const position of positions) {
        const skillMatchScore = calculateSkillMatch(candidate.skills, position.requirements);
        
        if (skillMatchScore > bestPositionMatch.skillMatchScore) {
          bestPositionMatch = {
            positionId: position.id,
            positionTitle: position.title,
            skillMatchScore,
            position
          };
        }
      }
    }

    // Parse education percentages (convert string to number safely)
    const tenthPercentageNum = parsePercentage(candidate.tenthPercentage);
    const twelfthPercentageNum = parsePercentage(candidate.twelfthPercentage);
    
    // Calculate overall ranking score (skill match has higher weight)
    const skillWeight = 0.7;
    const tenthWeight = 0.1;
    const twelfthWeight = 0.2;
    
    let rankingScore = bestPositionMatch.skillMatchScore * skillWeight;
    
    // Add education scores if available
    if (tenthPercentageNum !== null) {
      rankingScore += tenthPercentageNum * tenthWeight;
    }
    
    if (twelfthPercentageNum !== null) {
      rankingScore += twelfthPercentageNum * twelfthWeight;
    }

    return {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      resumeUrl: candidate.resumeUrl,
      skills: candidate.skills,
      experience: candidate.experience,
      tenthPercentage: candidate.tenthPercentage,
      twelfthPercentage: candidate.twelfthPercentage,
      positionId: bestPositionMatch.positionId,
      positionTitle: bestPositionMatch.positionTitle,
      skillMatchScore: bestPositionMatch.skillMatchScore,
      rankingScore: Number(rankingScore.toFixed(2)),
      applications: candidate.applications.map(app => ({
        id: app.id,
        status: app.status,
        matchScore: app.matchScore
      }))
    };
  });

  // Sort candidates by ranking score (descending)
  const sortedCandidates = rankedCandidates.sort((a, b) => {
    // Sort by ranking score first
    if (b.rankingScore !== a.rankingScore) {
      return b.rankingScore - a.rankingScore;
    }
    
    // If ranking scores are equal, check skill match
    if (b.skillMatchScore !== a.skillMatchScore) {
      return b.skillMatchScore - a.skillMatchScore;
    }
    
    // If skill match is equal, check education
    const bTwelfth = parsePercentage(b.twelfthPercentage) || 0;
    const aTwelfth = parsePercentage(a.twelfthPercentage) || 0;
    
    if (bTwelfth !== aTwelfth) {
      return bTwelfth - aTwelfth;
    }
    
    // Finally, check 10th percentage
    const bTenth = parsePercentage(b.tenthPercentage) || 0;
    const aTenth = parsePercentage(a.tenthPercentage) || 0;
    
    return bTenth - aTenth;
  });

  return sortedCandidates;
}

export async function getCandidateWithRanking(candidateId: string): Promise<DetailedCandidate | null> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Fetch the candidate with all related data
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      applications: {
        include: {
          position: true,
          interviews: {
            select: {
              id: true,
              scheduledFor: true,
              duration: true,
              status: true,
              meetingUrl: true
            },
            orderBy: {
              scheduledFor: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!candidate) return null;

  // Get all positions to find the best match
  const positions = await prisma.position.findMany({
    where: {
      userId: userId
    }
  });

  // Find the best matching position for this candidate
  let bestPositionMatch = {
    positionId: null as string | null,
    positionTitle: null as string | null,
    positionRequirements: null as string | null,
    skillMatchScore: 0,
    position: null as any
  };

  // Check candidate's applications first
  if (candidate.applications.length > 0) {
    for (const app of candidate.applications) {
      if (app.position) {
        const skillMatchScore = calculateSkillMatch(candidate.skills, app.position.requirements);
        
        if (skillMatchScore > bestPositionMatch.skillMatchScore) {
          bestPositionMatch = {
            positionId: app.position.id,
            positionTitle: app.position.title,
            positionRequirements: app.position.requirements,
            skillMatchScore,
            position: app.position
          };
        }
      }
    }
  }
  
  // If no applications or no good match found, try to find a matching position
  if (bestPositionMatch.skillMatchScore === 0 && positions.length > 0) {
    for (const position of positions) {
      const skillMatchScore = calculateSkillMatch(candidate.skills, position.requirements);
      
      if (skillMatchScore > bestPositionMatch.skillMatchScore) {
        bestPositionMatch = {
          positionId: position.id,
          positionTitle: position.title,
          positionRequirements: position.requirements,
          skillMatchScore,
          position
        };
      }
    }
  }

  // Parse education percentages (convert string to number safely)
  const tenthPercentageNum = parsePercentage(candidate.tenthPercentage);
  const twelfthPercentageNum = parsePercentage(candidate.twelfthPercentage);
  
  // Calculate overall ranking score (skill match has higher weight)
  const skillWeight = 0.7;
  const tenthWeight = 0.1;
  const twelfthWeight = 0.2;
  
  let rankingScore = bestPositionMatch.skillMatchScore * skillWeight;
  
  // Add education scores if available
  if (tenthPercentageNum !== null) {
    rankingScore += tenthPercentageNum * tenthWeight;
  }
  
  if (twelfthPercentageNum !== null) {
    rankingScore += twelfthPercentageNum * twelfthWeight;
  }

  // Transform applications to include position titles
  const transformedApplications = candidate.applications.map(app => ({
    id: app.id,
    status: app.status,
    matchScore: app.matchScore,
    positionId: app.position?.id || null,
    positionTitle: app.position?.title || null,
    createdAt: app.createdAt,
    interviews: app.interviews
  }));

  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    resumeUrl: candidate.resumeUrl,
    skills: candidate.skills,
    experience: candidate.experience,
    // Education fields
    tenthSchool: candidate.tenthSchool,
    tenthYear: candidate.tenthYear,
    tenthPercentage: candidate.tenthPercentage,
    twelfthSchool: candidate.twelfthSchool,
    twelfthYear: candidate.twelfthYear,
    twelfthPercentage: candidate.twelfthPercentage,
    // Position match
    positionId: bestPositionMatch.positionId,
    positionTitle: bestPositionMatch.positionTitle,
    positionRequirements: bestPositionMatch.positionRequirements,
    skillMatchScore: bestPositionMatch.skillMatchScore,
    rankingScore: Number(rankingScore.toFixed(2)),
    // Applications with additional data
    applications: transformedApplications
  };
}

// Helper function to calculate skill match score (0-100)
function calculateSkillMatch(candidateSkills: string[], requirementsString: string): number {
  if (!candidateSkills.length) return 0;
  
  // Parse requirements from the position's requirements string
  const requirements = requirementsString
    .toLowerCase()
    .split(/[,.\n]/)
    .map(req => req.trim())
    .filter(req => req.length > 0);
  
  if (!requirements.length) return 0;
  
  // Normalize candidate skills to lowercase for comparison
  const normalizedSkills = candidateSkills.map(skill => skill.toLowerCase());
  
  // Count matching skills
  let matches = 0;
  for (const skill of normalizedSkills) {
    if (requirements.some(req => req.includes(skill) || skill.includes(req))) {
      matches++;
    }
  }
  
  // Calculate match percentage (relative to the candidate's skills)
  const matchPercentage = (matches / normalizedSkills.length) * 100;
  
  return Math.min(100, matchPercentage);
}

// Helper to safely parse percentage strings
function parsePercentage(percentageStr: string | null): number | null {
  if (!percentageStr) return null;
  
  // Try to extract a number from the string
  const matches = percentageStr.match(/(\d+\.?\d*)/);
  if (matches && matches[1]) {
    const percentage = parseFloat(matches[1]);
    return isNaN(percentage) ? null : percentage;
  }
  
  return null;
} 