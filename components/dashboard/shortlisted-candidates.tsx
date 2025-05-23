"use client"

import { useState, memo, useMemo, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Clock, FileText, Mail, Video, Search, Filter, ChevronLeft, ChevronRight, MoreVertical, Loader2, RefreshCw } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { DayPicker } from "react-day-picker"
import { CustomDialogTrigger } from "@/components/ui/custom-dialog-trigger"
import { ButtonWrapper } from "@/components/ui/button-wrapper"
import { ClientOnly } from "@/components/ui/client-only"
// Renamed import to avoid conflict
import { ResumePreview as ResumePreviewComponent } from "@/components/resume-preview"
import { SafePopoverTrigger } from "@/components/ui/safe-popover-trigger"
import { SafeDialogTrigger } from "@/components/ui/safe-dialog-trigger"

// Custom calendar component to avoid nested button issues
const CustomCalendar = (props: React.ComponentProps<typeof Calendar>) => {
  return (
    <DayPicker
      showOutsideDays
      className="p-3"
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center rounded-md border border-input",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
      }}
      components={{
        IconLeft: () => <span className="flex items-center justify-center"><ChevronLeft className="h-4 w-4" /></span>,
        IconRight: () => <span className="flex items-center justify-center"><ChevronRight className="h-4 w-4" /></span>,
      }}
      {...props}
    />
  )
}

// Resume preview dialog component
const ResumePreview = ({ 
  resumeUrl, 
  isOpen, 
  onClose 
}: { 
  resumeUrl: string | null, 
  isOpen: boolean, 
  onClose: () => void 
}) => {
  if (!resumeUrl) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resume Not Available</DialogTitle>
            <DialogDescription>
              This candidate does not have a resume uploaded.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Resume Preview</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center mt-2">
          <object
            data={resumeUrl}
            type="application/pdf"
            width="100%"
            height="700px"
            className="border rounded-md"
          >
            <div className="p-4 text-center">
              <p>Unable to display PDF file. <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Open resume in new tab</a></p>
            </div>
          </object>
        </div>
        <DialogFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
          <Button type="button" onClick={() => window.open(resumeUrl, '_blank')}>
            Download Resume
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Safely get candidate name
function getCandidateName(candidate: any) {
  if (candidate.firstName && candidate.lastName) {
    return `${candidate.firstName} ${candidate.lastName}`;
  }
  return candidate.name || 'Unknown';
}

// Memoized table row component for better performance
const CandidateRow = memo(
  ({
    candidate,
    isSelected,
    onToggleSelect,
    onViewResume,
    onSendEmail,
    onViewInterview,
    onShortlist,
    onReject,
  }: {
    candidate: any
    isSelected: boolean
    onToggleSelect: (id: string) => void
    onViewResume: (candidateId: string) => void
    onSendEmail: (email: string) => void
    onViewInterview: (interviewId: string, meetingUrl?: string) => void
    onShortlist: (applicationId: string) => void
    onReject: (applicationId: string) => void
  }) => (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="hover:bg-muted/50"
    >
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(candidate.applicationId || '')}
          disabled={!candidate.applicationId || candidate.status === "Interview Scheduled" || candidate.status === "Rejected"}
          aria-label={`Select ${getCandidateName(candidate)}`}
        />
      </TableCell>
      <TableCell className="font-medium">{getCandidateName(candidate)}</TableCell>
      <TableCell>{typeof candidate.position === 'string' ? candidate.position : candidate.position?.title || 'N/A'}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm">{candidate.email || 'N/A'}</span>
          <span className="text-sm text-muted-foreground">{candidate.phone || 'No phone'}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          className={cn(
            candidate.status === "Shortlisted"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              : candidate.status === "Interview Scheduled" 
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : candidate.status === "Rejected"
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
          )}
        >
          {candidate.status || 'Unknown'}
        </Badge>
        {candidate.matchScore !== undefined && (
          <Badge 
            className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
          >
            {candidate.matchScore}% Match
          </Badge>
        )}
      </TableCell>
      <TableCell>
        {candidate.interviewDate 
          ? format(new Date(candidate.interviewDate), "PPP 'at' p") 
          : "Not scheduled"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onViewResume(candidate.id)}
          >
            <FileText className="h-4 w-4" />
            <span className="sr-only">View resume</span>
          </Button>
          <Button
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onSendEmail(candidate.email)}
          >
            <Mail className="h-4 w-4" />
            <span className="sr-only">Send email</span>
          </Button>
          
          {/* Status action buttons based on current status */}
          {candidate.status === "Pending Review" && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8"
              onClick={() => onShortlist(candidate.applicationId)}
            >
              Shortlist
            </Button>
          )}
          
          {candidate.status !== "Rejected" && candidate.status !== "Interview Scheduled" && (
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 text-red-600 hover:text-red-800 hover:bg-red-100"
              onClick={() => onReject(candidate.applicationId)}
            >
              Reject
            </Button>
          )}
          
          {candidate.interviewDate && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onViewInterview(candidate.applicationId, candidate.meetingUrl)}
            >
              <Video className="h-4 w-4" />
              <span className="sr-only">Join interview</span>
            </Button>
          )}
        </div>
      </TableCell>
    </motion.tr>
  ),
);

CandidateRow.displayName = "CandidateRow";

export function ShortlistedCandidates() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("10:00");
  const [isScheduling, setIsScheduling] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<any[]>([]);
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [duration, setDuration] = useState("30");
  const [useGoogleCalendar, setUseGoogleCalendar] = useState(true);
  const [resumePreview, setResumePreview] = useState<{isOpen: boolean, url: string | null}>({
    isOpen: false,
    url: null
  });
  const { toast } = useToast();
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const itemsPerPage = 5;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Fetch candidates on component mount
  useEffect(() => {
    fetchCandidates();
    fetchPositions();
  }, []);

  // Fetch candidates when position filter changes
  useEffect(() => {
    fetchCandidates();
  }, [selectedPosition]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      // Change API call to fetch all candidates instead of just shortlisted
      let url = "/api/candidates";
      
      if (selectedPosition !== "all") {
        url += `?positionId=${selectedPosition}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }
      
      const data = await response.json();
      console.log("API Response:", data); // Log the response for debugging
      
      // Transform data for UI
      const transformedData = data.map((item: any) => {
        // Log the first item to debug position data
        if (data.indexOf(item) === 0) {
          console.log("First item position data:", {
            position: item.position,
            applicationPosition: item.application?.position,
            positionId: item.application?.positionId,
            positionTitle: item.application?.positionTitle
          });
        }
        
        return {
          id: item.candidate?.id || '',
          applicationId: item.application?.id || '',
          name: getCandidateName(item.candidate),
          email: item.candidate?.email || '',
          phone: item.candidate?.phone || null,
          // Use multiple sources for position data with clear fallbacks
          position: item.position?.title || 
                   item.application?.position?.title || 
                   item.application?.positionTitle || 
                   'N/A',
          positionId: item.position?.id || 
                     item.application?.position?.id || 
                     item.application?.positionId || 
                     '',
          skills: item.candidate?.skills || [],
          status: mapStatus(item.application?.status),
          matchScore: item.application?.evaluationScore,
          interviewDate: item.application?.interviews?.[0]?.scheduledFor,
          meetingUrl: item.application?.interviews?.[0]?.meetingUrl,
          resumeUrl: item.candidate?.resumeUrl,
        };
      });
      
      console.log("Transformed data:", transformedData.slice(0, 2)); // Log first two items
      setCandidates(transformedData);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast({
        title: "Error",
        description: "Failed to load candidates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Map API status to UI status
  const mapStatus = (status: string | undefined): string => {
    if (!status) return 'Pending Review';
    
    const statusMap: Record<string, string> = {
      'SHORTLISTED': 'Shortlisted',
      'INTERVIEW_SCHEDULED': 'Interview Scheduled',
      'REJECTED': 'Rejected',
      'PENDING': 'Pending Review',
      'APPLIED': 'Applied',
    };
    
    return statusMap[status] || status;
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch("/api/positions?status=OPEN");
      
      if (!response.ok) {
        throw new Error("Failed to fetch positions");
      }
      
      const data = await response.json();
      setPositions(data);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const toggleCandidate = (id: string) => {
    // Safe check to prevent errors when toggling
    if (!id) return;
    
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((candidateId) => candidateId !== id) : [...prev, id],
    );
  };

  const toggleAllCandidates = (checked: boolean) => {
    if (checked) {
      const selectableCandidates = filteredCandidates
        .filter((c) => c.status !== "Interview Scheduled" && c.status !== "Rejected")
        .map((c) => c.applicationId)
        .filter(Boolean); // Ensure we only include valid IDs
      
      setSelectedCandidates(selectableCandidates);
    } else {
      setSelectedCandidates([]);
    }
  };

  const scheduleInterviews = async () => {
    try {
      setIsSubmitting(true);
      if (!isSignedIn || !date) {
        toast({
          title: "Error",
          description: "You must be signed in and select a date to schedule interviews",
          variant: "destructive",
        });
        return;
      }
      
      if (selectedCandidates.length === 0) {
        toast({
          title: "Error",
          description: "Please select candidates to schedule interviews",
          variant: "destructive",
        });
        return;
      }

      // Log data being sent for debugging
      console.log("Scheduling interviews with data:", {
        applicationIds: selectedCandidates,
        date: date,
        time: time,
        duration: duration
      });

      const interviewDateTime = new Date(date);
      const [hours, minutes] = time.split(":").map(Number);
      interviewDateTime.setHours(hours, minutes);

      // Add try/catch specifically for the API call
      try {
        const response = await fetch("/api/candidates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationIds: selectedCandidates,
            scheduledFor: interviewDateTime.toISOString(),
            duration: parseInt(duration) || 60,
            meetingUrl: meetingUrl.trim() || undefined,
            useGoogleCalendar: useGoogleCalendar,
            sendNotification: true
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("API error response:", errorData);
          throw new Error(errorData.error || "Failed to schedule interviews");
        }

        const responseData = await response.json();
        console.log("Schedule response:", responseData);
      } catch (err) {
        console.error("API call error:", err);
        throw err; // Re-throw to be caught by outer catch
      }

      // Refresh candidates list
      await fetchCandidates();
      
      // Reset selection
      setSelectedCandidates([]);
      setIsScheduling(false);
      setMeetingUrl("");

      toast({
        title: "Success",
        description: `Successfully scheduled ${selectedCandidates.length} interviews`,
      });
    } catch (error) {
      console.error("Error scheduling interviews:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule interviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewResume = async (candidateId: string) => {
    try {
      if (!candidateId) {
        toast({
          title: "Error",
          description: "Invalid candidate ID",
          variant: "destructive",
        });
        return;
      }
      
      // First check if we already have the resume URL in the candidates array
      const candidate = candidates.find(c => c.id === candidateId);
      
      if (candidate && candidate.resumeUrl) {
        // If we already have the URL, use it directly
        setResumePreview({
          isOpen: true,
          url: candidate.resumeUrl
        });
        return;
      }
      
      // Only fetch from API if we don't have the resumeUrl locally
      const response = await fetch(`/api/candidates/resume?candidateId=${candidateId}`);
      
      if (!response.ok) {
        console.error(`Failed to get resume URL: ${response.status}`);
        // Show no resume dialog
        setResumePreview({
          isOpen: true,
          url: null
        });
        return;
      }
      
      const { resumeUrl } = await response.json();
      
      // Open resume preview dialog
      setResumePreview({
        isOpen: true,
        url: resumeUrl
      });
    } catch (error) {
      console.error("Error getting resume:", error);
      toast({
        title: "Error",
        description: "Failed to retrieve resume. Please try again.",
        variant: "destructive",
      });
      // Show no resume dialog on error
      setResumePreview({
        isOpen: true,
        url: null
      });
    }
  };

  const handleSendEmail = (email: string) => {
    // Open default email client
    window.location.href = `mailto:${email}`;
  };

  const handleViewInterview = (applicationId: string, meetingUrl?: string) => {
    if (meetingUrl) {
      // Open meeting link in new tab
      window.open(meetingUrl, "_blank");
    } else {
      // Navigate to interview details page
      router.push(`/dashboard/interviews?applicationId=${applicationId}`);
    }
  };
  
  const handleShortlist = async (applicationId: string) => {
    try {
      setUpdatingStatus(applicationId);
      const response = await fetch("/api/candidates/shortlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to shortlist candidate");
      }
      
      // Refresh candidates list
      await fetchCandidates();
      
      toast({
        title: "Success",
        description: "Candidate has been shortlisted",
      });
    } catch (error) {
      console.error("Error shortlisting candidate:", error);
      toast({
        title: "Error",
        description: "Failed to shortlist candidate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };
  
  const handleReject = async (applicationId: string) => {
    try {
      setUpdatingStatus(applicationId);
      const response = await fetch("/api/candidates/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to reject candidate");
      }
      
      // Refresh candidates list
      await fetchCandidates();
      
      toast({
        title: "Notice",
        description: "Candidate has been rejected",
      });
    } catch (error) {
      console.error("Error rejecting candidate:", error);
      toast({
        title: "Error",
        description: "Failed to reject candidate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const closeResumePreview = () => {
    setResumePreview({
      isOpen: false,
      url: null
    });
  };

  // Filter candidates based on search term and status
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        (candidate.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.position || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resume Preview Dialog */}
      {resumePreview.isOpen && (
        <Dialog open={resumePreview.isOpen} onOpenChange={closeResumePreview}>
          <DialogContent className={resumePreview.url ? "sm:max-w-4xl max-h-[90vh]" : "sm:max-w-md"}>
            <DialogHeader>
              <DialogTitle>{resumePreview.url ? "Resume Preview" : "Resume Not Available"}</DialogTitle>
              {!resumePreview.url && (
                <DialogDescription>
                  This candidate does not have a resume uploaded.
                </DialogDescription>
              )}
            </DialogHeader>
            
            {resumePreview.url ? (
              <>
                <div className="flex flex-col items-center justify-center mt-2">
                  <object
                    data={resumePreview.url}
                    type="application/pdf"
                    width="100%"
                    height="700px"
                    className="border rounded-md"
                  >
                    <div className="p-4 text-center">
                      <p>Unable to display PDF file. <a href={resumePreview.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Open resume in new tab</a></p>
                    </div>
                  </object>
                </div>
                <DialogFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={closeResumePreview}>Close</Button>
                  <Button type="button" onClick={() => window.open(resumePreview.url || '', '_blank')}>
                    Download Resume
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <DialogFooter>
                <Button type="button" onClick={closeResumePreview}>Close</Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}

      <AnimatePresence>
        {selectedCandidates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="flex justify-between items-center p-3 bg-muted rounded-md"
          >
            <span>{selectedCandidates.length} candidates selected</span>
            <ClientOnly>
              <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
                <SafeDialogTrigger 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  {/* <Calendar className="mr-2 h-4 w-4" /> */}
                  Schedule Interviews
                </SafeDialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Interviews</DialogTitle>
                    <DialogDescription>Set a date and time for interviews with selected candidates.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Popover>
                        <SafePopoverTrigger className="w-full justify-start text-left font-normal border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select a date"}
                        </SafePopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Time</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger id="duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="use-google-calendar" 
                          checked={useGoogleCalendar}
                          onCheckedChange={(checked) => 
                            setUseGoogleCalendar(checked === true)
                          }
                        />
                        <Label 
                          htmlFor="use-google-calendar"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Create Google Calendar event
                        </Label>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="meetingUrl">Custom Meeting URL (Optional)</Label>
                      <Input 
                        id="meetingUrl" 
                        type="url" 
                        placeholder="https://meet.google.com/xxx-xxxx-xxx" 
                        value={meetingUrl} 
                        onChange={(e) => setMeetingUrl(e.target.value)} 
                        disabled={useGoogleCalendar}
                      />
                      <p className="text-sm text-muted-foreground">
                        If left empty, a Google Calendar event with Meet link will be automatically created.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsScheduling(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={scheduleInterviews}
                      disabled={isSubmitting || !date || !time}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Scheduling...
                        </>
                      ) : (
                        "Schedule and Send Invites"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </ClientOnly>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          All Candidates
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <div className="mr-2">
              <Button
                variant="outline"
                size="icon"
                onClick={fetchCandidates}
                className="h-9 w-9"
                title="Refresh candidates"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh candidates</span>
              </Button>
            </div>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Shortlisted">Shortlisted</SelectItem>
              <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
              <SelectItem value="Pending Review">Pending Review</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPosition} onValueChange={setSelectedPosition}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map((position) => (
                <SelectItem key={position.id} value={position.id}>
                  {position.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    paginatedCandidates.length > 0 &&
                    paginatedCandidates.filter((c) => 
                      c.status !== "Interview Scheduled" && 
                      c.status !== "Rejected" && 
                      c.applicationId // Make sure applicationId exists
                    ).every((c) => 
                      selectedCandidates.includes(c.applicationId)
                    )
                  }
                  onCheckedChange={toggleAllCandidates}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Interview Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCandidates.length > 0 ? (
              paginatedCandidates.map((candidate) => (
                <TableRow key={candidate.applicationId || `candidate-${candidate.id}`}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCandidates.includes(candidate.applicationId)}
                      onCheckedChange={() => toggleCandidate(candidate.applicationId)}
                      disabled={!candidate.applicationId || candidate.status === "Interview Scheduled" || candidate.status === "Rejected"}
                      aria-label={`Select ${candidate.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>{candidate.position}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{candidate.email || 'N/A'}</span>
                      <span className="text-sm text-muted-foreground">{candidate.phone || 'No phone'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        candidate.status === "Shortlisted"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : candidate.status === "Interview Scheduled" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : candidate.status === "Rejected"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
                      )}
                    >
                      {candidate.status || 'Unknown'}
                    </Badge>
                    {candidate.matchScore !== undefined && (
                      <Badge 
                        className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      >
                        {candidate.matchScore}% Match
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {candidate.interviewDate 
                      ? format(new Date(candidate.interviewDate), "PPP 'at' p") 
                      : "Not scheduled"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleViewResume(candidate.id)}
                      >
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View resume</span>
                      </Button>
                      <Button
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleSendEmail(candidate.email)}
                      >
                        <Mail className="h-4 w-4" />
                        <span className="sr-only">Send email</span>
                      </Button>
                      
                      {/* Status action buttons based on current status */}
                      {candidate.status === "Pending Review" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleShortlist(candidate.applicationId)}
                          disabled={updatingStatus === candidate.applicationId}
                        >
                          {updatingStatus === candidate.applicationId ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Shortlisting...
                            </>
                          ) : (
                            "Shortlist"
                          )}
                        </Button>
                      )}
                      
                      {candidate.status !== "Rejected" && candidate.status !== "Interview Scheduled" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 text-red-600 hover:text-red-800 hover:bg-red-100"
                          onClick={() => handleReject(candidate.applicationId)}
                          disabled={updatingStatus === candidate.applicationId}
                        >
                          {updatingStatus === candidate.applicationId ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Rejecting...
                            </>
                          ) : (
                            "Reject"
                          )}
                        </Button>
                      )}
                      
                      {candidate.interviewDate && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleViewInterview(candidate.applicationId, candidate.meetingUrl)}
                        >
                          <Video className="h-4 w-4" />
                          <span className="sr-only">Join interview</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No candidates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
