"use client"

import { useState, useCallback, memo, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download, Search, Filter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner"

type Application = {
  id: string;
  name: string;
  email: string;
  position: {
    id: string;
    title: string;
    department: string;
  } | null;
  positionTitle: string | null;
  candidate: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    skills: string[];
    experience: string | null;
  } | null;
  status: string;
  resumeUrl: string;
  createdAt: Date;
  matchScore: number | null;
};

// Memoized table row component for better performance
const ApplicationRow = memo(
  ({
    application,
    getStatusColor,
  }: {
    application: Application
    getStatusColor: (status: string) => string
  }) => (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="hover:bg-muted/50"
    >
      <TableCell className="font-medium">{application.id}</TableCell>
      <TableCell>{application.name}</TableCell>
      <TableCell>{application.position?.title || application.positionTitle || "N/A"}</TableCell>
      <TableCell>{format(new Date(application.createdAt), "MM/dd/yyyy")}</TableCell>
      <TableCell>
        <Badge className={cn("text-xs", getStatusColor(application.status))}>
          {application.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => window.open(application.resumeUrl, '_blank')}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View resume</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => window.open(application.resumeUrl, '_blank')}
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Download resume</span>
          </Button>
        </div>
      </TableCell>
    </motion.tr>
  ),
)

ApplicationRow.displayName = "ApplicationRow"

export function RecentApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 5

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/applications')
        if (!response.ok) {
          throw new Error('Failed to fetch applications')
        }
        const data = await response.json()
        console.log("Fetched applications:", data)
        setApplications(data)
      } catch (error) {
        console.error("Error fetching applications:", error)
        toast.error("Failed to fetch applications")
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [])

  // Memoized status color function
  const getStatusColor = useCallback((status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "REVIEWED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "SHORTLISTED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }, [])

  // Filter applications based on search term and status
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.position?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
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
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REVIEWED">Reviewed</SelectItem>
              <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedApplications.length > 0 ? (
              paginatedApplications.map((application) => (
                <ApplicationRow
                  key={application.id}
                  application={application}
                  getStatusColor={getStatusColor}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No applications found.
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
  )
}
