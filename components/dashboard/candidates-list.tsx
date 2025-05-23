"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  ArrowUpDown, 
  EyeIcon, 
  FileText, 
  Award, 
  BookOpen, 
  Briefcase,
  Download
} from "lucide-react";

type CandidateProps = {
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
};

export function CandidatesList({ candidates }: { candidates: CandidateProps[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "skills" | "education">("rank");
  
  // Filter candidates based on search term
  const filteredCandidates = candidates.filter(candidate => {
    const searchLower = searchTerm.toLowerCase();
    return (
      candidate.name.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
      (candidate.positionTitle && candidate.positionTitle.toLowerCase().includes(searchLower))
    );
  });
  
  // Sort candidates based on selected criteria
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === "skills") {
      return b.skillMatchScore - a.skillMatchScore;
    } else if (sortBy === "education") {
      const bTwelfth = parsePercentage(b.twelfthPercentage) || 0;
      const aTwelfth = parsePercentage(a.twelfthPercentage) || 0;
      
      if (bTwelfth !== aTwelfth) {
        return bTwelfth - aTwelfth;
      }
      
      const bTenth = parsePercentage(b.tenthPercentage) || 0;
      const aTenth = parsePercentage(a.tenthPercentage) || 0;
      
      return bTenth - aTenth;
    }
    
    // Default rank sort
    return b.rankingScore - a.rankingScore;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates by name, email, or skills..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "rank" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("rank")}
          >
            <Award className="mr-2 h-4 w-4" />
            Overall Rank
          </Button>
          <Button
            variant={sortBy === "skills" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("skills")}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Skills
          </Button>
          <Button
            variant={sortBy === "education" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("education")}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Education
          </Button>
        </div>
      </div>

      {sortedCandidates.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">No candidates found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Education</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Match Score
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCandidates.map((candidate, index) => (
              <TableRow key={candidate.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(candidate.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{candidate.name}</div>
                      <div className="text-sm text-muted-foreground">{candidate.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Skill Match:</span>
                      <Progress value={candidate.skillMatchScore} className="h-2 w-24" />
                      <span className="text-xs font-medium">{candidate.skillMatchScore}%</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {candidate.twelfthPercentage ? (
                      <div className="flex items-center text-xs">
                        <span className="text-muted-foreground mr-2">12th:</span>
                        {candidate.twelfthPercentage}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">12th: N/A</div>
                    )}
                    {candidate.tenthPercentage ? (
                      <div className="flex items-center text-xs">
                        <span className="text-muted-foreground mr-2">10th:</span>
                        {candidate.tenthPercentage}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">10th: N/A</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <Badge
                      className={getRankColor(candidate.rankingScore)}
                    >
                      {candidate.rankingScore.toFixed(1)}
                    </Badge>
                    <span className="text-xs text-muted-foreground mt-1">
                      {getRankLabel(candidate.rankingScore)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {candidate.positionTitle ? (
                    <div>
                      <div className="font-medium">{candidate.positionTitle}</div>
                      <div className="text-xs text-muted-foreground">
                        {candidate.applications.length > 0 ? (
                          <Badge variant="outline" className="text-xs">
                            {candidate.applications[0].status}
                          </Badge>
                        ) : (
                          "Potential match"
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No position match</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/candidates/${candidate.id}`}>
                        <EyeIcon className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Link>
                    </Button> */}
                    {candidate.resumeUrl && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">View resume</span>
                        </a>
                      </Button>
                    )}
                    {candidate.resumeUrl && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={candidate.resumeUrl} download>
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download resume</span>
                        </a>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// Helper functions
function getInitials(name: string): string {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

function getRankColor(score: number): string {
  if (score >= 80) return "bg-green-500 hover:bg-green-600";
  if (score >= 60) return "bg-blue-500 hover:bg-blue-600";
  if (score >= 40) return "bg-orange-500 hover:bg-orange-600";
  return "bg-slate-500 hover:bg-slate-600";
}

function getRankLabel(score: number): string {
  if (score >= 80) return "Excellent match";
  if (score >= 60) return "Good match";
  if (score >= 40) return "Fair match";
  return "Poor match";
}

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