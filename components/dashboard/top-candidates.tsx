"use client";

import { useState, memo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";


// Define the candidate type based on the API response
type Candidate = {
  id: string;
  name: string;
  position: string;
  matchScore?: number;
  skills: string[];
  experience?: string;
  email: string;
  phone?: string;
  status: string;
  applicationId: string;
  positionId?: string;
};

// Memoized table row component for better performance
const CandidateRow = memo(
  ({
    candidate,
    isSelected,
    onToggleSelect,
  }: {
    candidate: Candidate;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
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
          onCheckedChange={() => onToggleSelect(candidate.applicationId)}
        />
      </TableCell>
      <TableCell className="font-medium">{candidate.name}</TableCell>
      <TableCell>{candidate.position}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Progress
            value={candidate.matchScore ?? 0}
            className={`w-20 h-2 ${
              (candidate.matchScore ?? 0) >= 90
                ? "[&>div]:bg-green-500"
                : (candidate.matchScore ?? 0) >= 80
                ? "[&>div]:bg-blue-500"
                : "[&>div]:bg-amber-500"
            }`}
          />
          <span
            className={
              (candidate.matchScore ?? 0) >= 90
                ? "text-green-500"
                : (candidate.matchScore ?? 0) >= 80
                ? "text-blue-500"
                : "text-amber-500"
            }
          >
            {candidate.matchScore ?? 0}%
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {candidate.skills.map((skill, index) => (
            <span
              key={index}
              className="text-xs bg-muted px-2 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </TableCell>
      <TableCell>{candidate.experience || "Not specified"}</TableCell>
    </motion.tr>
  )
);

CandidateRow.displayName = "CandidateRow";

export function TopCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [positions, setPositions] = useState<string[]>([]);
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [duration, setDuration] = useState("60");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 5;

  // Fetch candidates from the API
  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      let url = "/api/candidates";
      if (positionFilter !== "all") {
        url += `?positionId=${positionFilter}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }
      
      const data = await response.json();
      console.log("API Response:", data); // Log the response for debugging
      console.log("Fetched data:", data);

      // Transform the data to match our component's expected format
      const formattedCandidates: Candidate[] = data.map((item: any) => {
        // Extract position information, handling possible null values
        const positionTitle = item.position?.title || 
                             item.application?.position?.title || 
                             "Unknown Position";
        
        const positionId = item.position?.id || 
                          item.application?.positionId || 
                          null;
        
        return {
          id: item.candidate.id,
          name: item.candidate.name,
          position: positionTitle,
          matchScore: item.application.matchScore || 0,
          skills: item.candidate.skills || [],
          experience: item.candidate.experience || "Not specified",
          email: item.candidate.email,
          phone: item.candidate.phone,
          status: item.application.status,
          applicationId: item.application.id,
          positionId: positionId,
        };
      });
      
      setCandidates(formattedCandidates);
      
      // Extract unique positions for the filter
      const uniquePositions = Array.from(
        new Set(formattedCandidates.map((c) => c.positionId).filter(Boolean))
      );
      
      if (uniquePositions.length > 0) {
        // Fetch position details
        const positionResponse = await fetch("/api/positions");
        if (positionResponse.ok) {
          const positionData = await positionResponse.json();
          setPositions(
            positionData
              .filter((p: any) => uniquePositions.includes(p.id))
              .map((p: any) => ({ id: p.id, title: p.title }))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCandidates();
  }, [positionFilter]);

  const toggleCandidate = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id)
        ? prev.filter((candidateId) => candidateId !== id)
        : [...prev, id]
    );
  };

  const toggleAllCandidates = (checked: boolean) => {
    if (checked) {
      setSelectedCandidates(paginatedCandidates.map((c) => c.applicationId));
    } else {
      setSelectedCandidates([]);
    }
  };

  const scheduleInterviews = async () => {
    if (!interviewDate || !interviewTime) {
      toast.error("Please select both date and time for the interviews");
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine date and time into a single Date object
      const scheduledFor = new Date(`${interviewDate}T${interviewTime}`);
      
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationIds: selectedCandidates,
          scheduledFor: scheduledFor.toISOString(),
          duration: parseInt(duration),
          meetingUrl: meetingUrl || undefined,
          useGoogleCalendar: true,
          sendNotification: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to schedule interviews");
      }

      const data = await response.json();
      toast.success(`Successfully scheduled ${selectedCandidates.length} interviews`);
      setIsScheduling(false);
      setSelectedCandidates([]);
      fetchCandidates(); // Refresh the candidate list
    } catch (error) {
      console.error("Error scheduling interviews:", error);
      toast.error(error instanceof Error ? error.message : "Failed to schedule interviews");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter candidates based on search term, position, and match score
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesPosition =
      positionFilter === "all" || candidate.positionId === positionFilter;

    const matchesScore = (candidate.matchScore ?? 0) >= minMatchScore;

    return matchesSearch && matchesPosition && matchesScore;
  });

  // Sort candidates by match score (highest first)
  const sortedCandidates = [...filteredCandidates].sort(
    (a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)
  );

  // Pagination
  const totalPages = Math.ceil(sortedCandidates.length / itemsPerPage);
  const paginatedCandidates = sortedCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
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
            <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
              <DialogTrigger asChild>
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Interviews
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule Interviews</DialogTitle>
                  <DialogDescription>
                    Schedule interviews for {selectedCandidates.length} selected
                    candidates.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="interviewDate" className="text-sm font-medium">
                      Interview Date
                    </label>
                    <Input
                      id="interviewDate"
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="interviewTime" className="text-sm font-medium">
                      Interview Time
                    </label>
                    <Input
                      id="interviewTime"
                      type="time"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="duration" className="text-sm font-medium">
                      Duration (minutes)
                    </label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger>
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
                  
                  <div className="space-y-2">
                    <label htmlFor="meetingUrl" className="text-sm font-medium">
                      Meeting URL (optional)
                    </label>
                    <Input
                      id="meetingUrl"
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsScheduling(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={scheduleInterviews} 
                    disabled={isSubmitting || !interviewDate || !interviewTime}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      "Schedule Interviews"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}
      </AnimatePresence>

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
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map((position: any) => (
                <SelectItem key={position.id} value={position.id}>
                  {position.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select 
            value={minMatchScore.toString()} 
            onValueChange={(value) => setMinMatchScore(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Min match score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any match score</SelectItem>
              <SelectItem value="70">70% or higher</SelectItem>
              <SelectItem value="80">80% or higher</SelectItem>
              <SelectItem value="90">90% or higher</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchCandidates}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
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
                    paginatedCandidates.every((c) =>
                      selectedCandidates.includes(c.applicationId)
                    )
                  }
                  onCheckedChange={toggleAllCandidates}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Match Score</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Experience</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading candidates...
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedCandidates.length > 0 ? (
              paginatedCandidates.map((candidate) => (
                <CandidateRow
                  key={candidate.applicationId}
                  candidate={candidate}
                  isSelected={selectedCandidates.includes(candidate.applicationId)}
                  onToggleSelect={toggleCandidate}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
