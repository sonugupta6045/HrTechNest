"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Video, Download, Mail, FileText, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@clerk/nextjs"

export default function InterviewsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const applicationId = searchParams.get("applicationId")
  const interviewId = searchParams.get("id")
  
  const [interview, setInterview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [copying, setCopying] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (interviewId) {
      fetchInterviewById(interviewId)
    } else if (applicationId) {
      fetchInterviewByApplication(applicationId)
    } else {
      setError("Interview ID or Application ID is required")
      setLoading(false)
    }
  }, [interviewId, applicationId])

  const fetchInterviewById = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/interviews?id=${id}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch interview details")
      }
      
      const data = await response.json()
      setInterview(data)
      setNotes(data.notes || "")
      setStatus(data.status || "Scheduled")
    } catch (error) {
      console.error("Error fetching interview:", error)
      setError("Failed to load interview details")
    } finally {
      setLoading(false)
    }
  }
  
  const fetchInterviewByApplication = async (appId: string) => {
    try {
      setLoading(true)
      // Get all interviews and filter by application ID
      const response = await fetch(`/api/interviews/list`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch interviews")
      }
      
      const data = await response.json()
      const interviewData = data.find((int: any) => int.applicationId === appId)
      
      if (!interviewData) {
        throw new Error("Interview not found for this application")
      }
      
      setInterview(interviewData)
      setNotes(interviewData.notes || "")
      setStatus(interviewData.status || "Scheduled")
    } catch (error) {
      console.error("Error fetching interview:", error)
      setError("Failed to load interview details")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    try {
      if (!interview?.id) return
      
      setSavingNotes(true)
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewId: interview.id,
          notes,
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to save notes")
      }
      
      toast({
        title: "Success",
        description: "Interview notes saved successfully",
      })
      
      // Navigate back to the interviews list page
      router.push("/dashboard/interviews/list")
    } catch (error) {
      console.error("Error saving notes:", error)
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSavingNotes(false)
    }
  }

  const handleUpdateStatus = async () => {
    try {
      if (!interview?.id) return
      
      setUpdatingStatus(true)
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewId: interview.id,
          status,
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update status")
      }
      
      toast({
        title: "Success",
        description: "Interview status updated successfully",
      })
      
      // Navigate back to the interviews list page
      router.push("/dashboard/interviews/list")
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDownloadResume = async () => {
    if (!interview?.candidate?.id) return
    
    try {
      const response = await fetch(`/api/candidates/resume?candidateId=${interview.candidate.id}`)
      
      if (!response.ok) {
        throw new Error("Failed to get resume URL")
      }
      
      const { resumeUrl } = await response.json()
      
      if (resumeUrl) {
        window.open(resumeUrl, "_blank")
      } else {
        toast({
          title: "Resume Not Available",
          description: "This candidate does not have a resume uploaded.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error downloading resume:", error)
      toast({
        title: "Error",
        description: "Failed to download resume. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading interview details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
        <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
        <h2 className="text-2xl font-bold mb-4">Interview Not Found</h2>
        <p className="text-muted-foreground">The requested interview could not be found.</p>
      </div>
    )
  }

  const interviewDate = new Date(interview.scheduledFor)
  const candidate = interview.candidate
  const position = interview.application?.position

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Interview Details</h1>
        <div className="flex gap-2">
          {interview.meetingUrl && (
            <Button onClick={() => window.open(interview.meetingUrl, "_blank")}>
              <Video className="mr-2 h-4 w-4" />
              Join Interview
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Interview Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Interview Information</CardTitle>
            <CardDescription>Scheduled interview details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                {format(interviewDate, "EEEE, MMMM d, yyyy")}
              </p>
              <p className="font-medium flex items-center mt-1">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                {format(interviewDate, "h:mm a")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Duration: {interview.duration} minutes
              </p>
            </div>

            <div className="mt-4">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="No Show">No Show</SelectItem>
                  <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleUpdateStatus} className="mt-2 w-full" disabled={updatingStatus}>
                {updatingStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>

            {interview.meetingUrl && (
              <div className="mt-4">
                <Label>Meeting Link</Label>
                <div className="mt-1 flex items-center">
                  <Input 
                    type="text" 
                    value={interview.meetingUrl} 
                    readOnly 
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    className="ml-2"
                    disabled={copying}
                    onClick={async () => {
                      try {
                        setCopying(true);
                        await navigator.clipboard.writeText(interview.meetingUrl);
                        toast({
                          title: "Copied",
                          description: "Meeting link copied to clipboard",
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to copy meeting link",
                          variant: "destructive",
                        });
                      } finally {
                        setCopying(false);
                      }
                    }}
                  >
                    {copying ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        Copying...
                      </>
                    ) : (
                      "Copy"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Candidate Card */}
          <Card>
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
              <CardDescription>Details about the interview candidate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold">{candidate.name}</h3>
                  <p className="text-muted-foreground">{position?.title || "Unknown Position"}</p>
                  
                  <div className="mt-4 space-y-2">
                    <p className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      {candidate.email}
                    </p>
                    {candidate.phone && (
                      <p className="flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        {candidate.phone}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col justify-end items-end gap-2">
                  <Button variant="outline" onClick={handleDownloadResume}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Resume
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = `mailto:${candidate.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interview Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Notes</CardTitle>
              <CardDescription>Add notes about the interview</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={6}
                placeholder="Enter notes about the interview, candidate performance, questions asked, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotes} disabled={savingNotes}>
                {savingNotes ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Notes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Input component extracted from your code
function Input({ className, type, value, readOnly, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

// Phone icon component
function Phone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  )
} 