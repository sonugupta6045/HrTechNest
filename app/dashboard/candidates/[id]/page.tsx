import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  FileText,
  Download, 
  Briefcase, 
  BookOpen,
  Award,
  Clock
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCandidateWithRanking } from "@/app/actions/candidate";
import { formatDate } from "@/lib/utils";

// Get candidate data with ranking and position match
async function getCandidateData(id: string) {
  try {
    const candidate = await getCandidateWithRanking(id);
    if (!candidate) return null;
    return candidate;
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return null;
  }
}

export default async function CandidateDetailPage({ params }: { params: { id: string } }) {
  const candidate = await getCandidateData(params.id);
  
  if (!candidate) {
    notFound();
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/candidates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Candidate Profile</h1>
        </div>
        
        <div className="flex gap-2">
          {candidate.resumeUrl && (
            <>
              <Button variant="outline" size="sm" asChild>
                <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-2 h-4 w-4" />
                  View Resume
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={candidate.resumeUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download Resume
                </a>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-xl">
                  {getInitials(candidate.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{candidate.name}</h2>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{candidate.phone}</span>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Ranking Score
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <Progress value={candidate.rankingScore} className="h-2" />
                <span className="font-medium">{candidate.rankingScore.toFixed(1)}</span>
              </div>
              <Badge className={`${getRankColor(candidate.rankingScore)} w-full justify-center py-1`}>
                {getRankLabel(candidate.rankingScore)}
              </Badge>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Best Position Match
              </h3>
              {candidate.positionTitle ? (
                <div>
                  <div className="font-medium">{candidate.positionTitle}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">Skill Match:</span>
                    <Progress value={candidate.skillMatchScore} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{candidate.skillMatchScore}%</span>
                  </div>
                  <div className="mt-2">
                    {candidate.applications.some(app => app.positionId === candidate.positionId) ? (
                      <Badge variant="outline">
                        {candidate.applications.find(app => app.positionId === candidate.positionId)?.status || "Applied"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Potential Match</Badge>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No position match found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Candidate Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="skills">
              <TabsList className="w-full">
                <TabsTrigger value="skills" className="flex-1">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Skills & Experience
                </TabsTrigger>
                <TabsTrigger value="education" className="flex-1">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Education
                </TabsTrigger>
                <TabsTrigger value="applications" className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Applications
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="skills" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.length > 0 ? (
                        candidate.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No skills listed</p>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-2">Experience</h3>
                    {candidate.experience ? (
                      <p>{candidate.experience}</p>
                    ) : (
                      <p className="text-muted-foreground">No experience listed</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-2">Skill Match Analysis</h3>
                    {candidate.positionTitle ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Matching against position: <span className="font-medium text-foreground">{candidate.positionTitle}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Match Score:</span>
                          <Progress value={candidate.skillMatchScore} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{candidate.skillMatchScore}%</span>
                        </div>
                        <div className="p-3 bg-muted rounded-md text-sm">
                          <p className="font-medium mb-1">Position Requirements:</p>
                          <p>{candidate.positionRequirements || "No specific requirements listed"}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No position match found for skill analysis</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="education" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">12th Standard</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {candidate.twelfthSchool || candidate.twelfthYear || candidate.twelfthPercentage ? (
                          <>
                            {candidate.twelfthSchool && (
                              <div>
                                <p className="text-sm font-medium">School</p>
                                <p className="text-sm">{candidate.twelfthSchool}</p>
                              </div>
                            )}
                            {candidate.twelfthYear && (
                              <div>
                                <p className="text-sm font-medium">Year</p>
                                <p className="text-sm">{candidate.twelfthYear}</p>
                              </div>
                            )}
                            {candidate.twelfthPercentage && (
                              <div>
                                <p className="text-sm font-medium">Percentage</p>
                                <p className="text-sm">{candidate.twelfthPercentage}</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">No 12th standard details provided</p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">10th Standard</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {candidate.tenthSchool || candidate.tenthYear || candidate.tenthPercentage ? (
                          <>
                            {candidate.tenthSchool && (
                              <div>
                                <p className="text-sm font-medium">School</p>
                                <p className="text-sm">{candidate.tenthSchool}</p>
                              </div>
                            )}
                            {candidate.tenthYear && (
                              <div>
                                <p className="text-sm font-medium">Year</p>
                                <p className="text-sm">{candidate.tenthYear}</p>
                              </div>
                            )}
                            {candidate.tenthPercentage && (
                              <div>
                                <p className="text-sm font-medium">Percentage</p>
                                <p className="text-sm">{candidate.tenthPercentage}</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">No 10th standard details provided</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-2">Education Score Impact</h3>
                    <p className="text-sm text-muted-foreground">
                      Education contributes 30% to the overall ranking score, with 12th standard 
                      having a higher weight than 10th standard.
                    </p>
                    
                    <div className="mt-4 p-4 bg-muted rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">12th Percentage</p>
                          {candidate.twelfthPercentage ? (
                            <div className="flex items-center gap-2 mt-1">
                              <Progress 
                                value={parsePercentage(candidate.twelfthPercentage) || 0} 
                                className="h-2 flex-1" 
                              />
                              <span className="text-sm">{candidate.twelfthPercentage}</span>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not provided</p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">10th Percentage</p>
                          {candidate.tenthPercentage ? (
                            <div className="flex items-center gap-2 mt-1">
                              <Progress 
                                value={parsePercentage(candidate.tenthPercentage) || 0} 
                                className="h-2 flex-1" 
                              />
                              <span className="text-sm">{candidate.tenthPercentage}</span>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="applications" className="mt-4">
                {candidate.applications.length > 0 ? (
                  <div className="space-y-4">
                    {candidate.applications.map((application) => (
                      <Card key={application.id}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div>
                              <h3 className="font-semibold">{application.positionTitle || "Unknown Position"}</h3>
                              <p className="text-sm text-muted-foreground">
                                Applied: {formatDate(application.createdAt) || "Unknown date"}
                              </p>
                            </div>
                            
                            <div className="flex flex-col items-start md:items-end gap-2">
                              <Badge 
                                variant={getStatusVariant(application.status)}
                                className="text-xs"
                              >
                                {application.status}
                              </Badge>
                              
                              {application.matchScore !== null && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Match Score:</span>
                                  <span className="text-xs font-medium">{application.matchScore}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {application.interviews && application.interviews.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-sm font-medium">Interviews:</p>
                              <div className="space-y-2 mt-2">
                                {application.interviews.map((interview) => (
                                  <div key={interview.id} className="p-2 bg-muted rounded-md text-sm">
                                    <div className="flex flex-col md:flex-row justify-between">
                                      <div>
                                        <span className="font-medium">
                                          {formatDate(interview.scheduledFor, true)}
                                        </span>
                                        <span className="text-muted-foreground"> ({interview.duration} min)</span>
                                      </div>
                                      <Badge variant="outline" className="mt-1 md:mt-0">
                                        {interview.status}
                                      </Badge>
                                    </div>
                                    {interview.meetingUrl && (
                                      <a 
                                        href={interview.meetingUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline mt-1 inline-block"
                                      >
                                        Meeting Link
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No applications found for this candidate</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
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

function getStatusVariant(status: string): "default" | "outline" | "secondary" | "destructive" {
  const normalizedStatus = status.toUpperCase();
  if (normalizedStatus === "APPROVED" || normalizedStatus === "SHORTLISTED" || normalizedStatus === "INTERVIEW_SCHEDULED") {
    return "default";
  }
  if (normalizedStatus === "PENDING" || normalizedStatus === "SCHEDULED") {
    return "secondary";
  }
  if (normalizedStatus === "REJECTED" || normalizedStatus === "CANCELLED") {
    return "destructive";
  }
  return "outline";
}

function parsePercentage(percentageStr: string | null): number | null {
  if (!percentageStr) return null;
  
  // Try to extract a number from the string
  const matches = percentageStr.match(/(\d+\.?\d*)/);
  if (matches && matches[1]) {
    const percentage = parseFloat(matches[1]);
    return isNaN(percentage) ? null : Math.min(100, percentage);
  }
  
  return null;
} 