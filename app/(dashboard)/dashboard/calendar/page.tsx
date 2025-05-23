"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { Calendar, Clock, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Interview type definition
interface Interview {
  id: string;
  title: string;
  positionTitle: string;
  candidateName: string;
  candidateEmail: string;
  start: string;
  end: string;
  duration: number;
  meetingUrl: string | null;
  status: string;
  notes: string | null;
  applicationId: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch interviews for the current month
  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      try {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        
        const response = await fetch(
          `/api/calendar?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch interviews");
        }
        
        const data = await response.json();
        setInterviews(data);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterviews();
  }, [currentMonth]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // Get all days in the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Handle interview click
  const handleInterviewClick = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsDialogOpen(true);
  };

  // Get interviews for a specific day
  const getInterviewsForDay = (day: Date) => {
    return interviews.filter(interview => 
      isSameDay(new Date(interview.start), day)
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Interview Calendar</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            View and manage all scheduled interviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center font-medium p-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {daysInMonth.map((day) => {
                const dayInterviews = getInterviewsForDay(day);
                return (
                  <div
                    key={day.toString()}
                    className={`border rounded-md p-2 min-h-32 ${
                      isSameDay(day, new Date()) ? "bg-blue-50 border-blue-200" : ""
                    }`}
                  >
                    <div className="text-right font-medium">
                      {format(day, "d")}
                    </div>
                    <div className="mt-1 space-y-1 max-h-28 overflow-y-auto">
                      {dayInterviews.map((interview) => (
                        <div
                          key={interview.id}
                          onClick={() => handleInterviewClick(interview)}
                          className="bg-blue-100 hover:bg-blue-200 p-1 rounded text-xs cursor-pointer"
                        >
                          <div className="font-medium truncate">
                            {format(new Date(interview.start), "h:mm a")} - {interview.candidateName}
                          </div>
                          <div className="truncate text-gray-600">
                            {interview.positionTitle}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interview Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedInterview && (
            <>
              <DialogHeader>
                <DialogTitle>Interview Details</DialogTitle>
                <DialogDescription>
                  Scheduled for {format(new Date(selectedInterview.start), "EEEE, MMMM d, yyyy")}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Badge className="mr-2">{selectedInterview.status}</Badge>
                    <h3 className="text-lg font-medium">{selectedInterview.candidateName}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{selectedInterview.positionTitle}</p>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm">
                      {format(new Date(selectedInterview.start), "h:mm a")} - 
                      {format(new Date(selectedInterview.end), "h:mm a")} 
                      ({selectedInterview.duration} minutes)
                    </p>
                  </div>
                </div>
                
                {selectedInterview.meetingUrl && (
                  <div className="flex items-start space-x-2">
                    <ExternalLink className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Meeting Link</p>
                      <a 
                        href={selectedInterview.meetingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Join Meeting
                      </a>
                    </div>
                  </div>
                )}
                
                {selectedInterview.notes && (
                  <div className="border-t pt-4 mt-4">
                    <p className="font-medium">Notes</p>
                    <p className="text-sm whitespace-pre-line">{selectedInterview.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    router.push(`/dashboard/interviews?id=${selectedInterview.id}`);
                  }}
                >
                  View Full Details
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}