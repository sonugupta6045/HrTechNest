"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Video, FileText, Calendar as CalendarIcon, Filter } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

export default function InterviewsListPage() {
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState("")
  const [positions, setPositions] = useState<any[]>([])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchInterviews()
    fetchPositions()
  }, [statusFilter, positionFilter, dateFilter])

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      let url = "/api/interviews/list"
      
      const params = new URLSearchParams()
      
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      
      if (positionFilter !== "all") {
        params.append("positionId", positionFilter)
      }
      
      if (dateFilter) {
        const dateStr = format(dateFilter, "yyyy-MM-dd")
        params.append("date", dateStr)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error("Failed to fetch interviews")
      }
      
      const data = await response.json()
      setInterviews(data)
    } catch (error) {
      console.error("Error fetching interviews:", error)
      toast({
        title: "Error",
        description: "Failed to load interviews. Please try again.",
        variant: "destructive",
      })
      setError("Failed to load interviews")
    } finally {
      setLoading(false)
    }
  }

  const fetchPositions = async () => {
    try {
      const response = await fetch("/api/positions")
      
      if (!response.ok) {
        throw new Error("Failed to fetch positions")
      }
      
      const data = await response.json()
      setPositions(data)
    } catch (error) {
      console.error("Error fetching positions:", error)
    }
  }

  const handleViewInterview = (interviewId: string) => {
    router.push(`/dashboard/interviews?id=${interviewId}`)
  }

  // const handleJoinMeeting = (meetingUrl: string) => {
  //   window.open(meetingUrl, "_blank")
  // }
  const handleJoinMeeting = (meetingUrl: string) => {
  if (!meetingUrl || !meetingUrl.startsWith("http")) {
    toast({
      title: "Invalid link",
      description: "Meeting link is not available or malformed.",
      variant: "destructive",
    })
    return
  }
  window.open(meetingUrl, "_blank")
}


  const resetFilters = () => {
    setStatusFilter("all")
    setPositionFilter("all")
    setDateFilter(undefined)
    setSearchTerm("")
  }

  // Filter interviews based on search term
  const filteredInterviews = interviews.filter((interview) => {
    if (!searchTerm) return true

    const candidate = interview.candidate
    const position = interview.application?.position

    return (
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (position?.title && position.title.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Scheduled Interviews</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidate or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
            <SelectItem value="No Show">No Show</SelectItem>
            <SelectItem value="Rescheduled">Rescheduled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={positionFilter} onValueChange={setPositionFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by position" />
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

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={dateFilter}
              onSelect={setDateFilter}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button variant="ghost" onClick={resetFilters} className="w-full md:w-auto">
          Reset Filters
        </Button>
      </div>

      {error ? (
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          {error}
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="bg-muted p-8 rounded-md text-center">
          <h3 className="text-xl font-medium mb-2">No interviews found</h3>
          <p className="text-muted-foreground">
            No interviews match your current filter criteria. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInterviews.map((interview) => (
                <motion.tr
                  key={interview.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-muted/50"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{interview.candidate.name}</p>
                      <p className="text-sm text-muted-foreground">{interview.candidate.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{interview.application?.position?.title || "Unknown Position"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                        {format(new Date(interview.scheduledFor), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {format(new Date(interview.scheduledFor), "h:mm a")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        interview.status === "Scheduled"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : interview.status === "Completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : interview.status === "Cancelled" || interview.status === "No Show"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                      }
                    >
                      {interview.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewInterview(interview.id)}
                      >
                        <FileText className="mr-1 h-4 w-4" />
                        Details
                      </Button>
                      {interview.meetingUrl && interview.status === "Scheduled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleJoinMeeting(interview.meetingUrl)}
                        >
                          <Video className="mr-1 h-4 w-4" />
                          Join
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
} 