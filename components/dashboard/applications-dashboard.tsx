"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ResumePreview } from "@/components/resume-preview"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Application {
  id: string
  candidateId: string
  resumeUrl: string
  status: string
  matchScore: number | null
  createdAt: string
  name: string
  email: string
  candidate: {
    id: string
    name: string
    email: string
    phone: string | null
    skills: string[]
    experience: string | null
  } | null
  position: {
    id: string
    title: string
    department: string
  } | null
}

export function ApplicationsDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("matchScore")

  useEffect(() => {
    fetchApplications()
  }, [statusFilter, sortBy])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/applications?status=${statusFilter}&sortBy=${sortBy}`)
      if (!response.ok) {
        throw new Error("Failed to fetch applications")
      }
      const data = await response.json()
      console.log("Fetched applications for dashboard:", data)
      setApplications(data)
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast.error("Failed to fetch applications")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      toast.success("Application status updated successfully")
      fetchApplications()
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update application status")
    }
  }

  const filteredApplications = applications.filter((app) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      app.name.toLowerCase().includes(searchLower) ||
      (app.candidate?.name?.toLowerCase().includes(searchLower) || false) ||
      (app.candidate?.email?.toLowerCase().includes(searchLower) || false) ||
      (app.position?.title?.toLowerCase().includes(searchLower) || false)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-500"
      case "REVIEWED":
        return "bg-blue-500"
      case "SHORTLISTED":
        return "bg-green-500"
      case "REJECTED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Applications Dashboard</h2>
        <div className="flex gap-4">
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REVIEWED">Reviewed</SelectItem>
              <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="matchScore">Match Score</SelectItem>
              <SelectItem value="createdAt">Date Applied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Match Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{application.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {application.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{application.position?.title || "N/A"}</div>
                      <div className="text-sm text-muted-foreground">
                        {application.position?.department || "N/A"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{application.matchScore || 0}%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(application.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <ResumePreview
                        resumeUrl={application.resumeUrl}
                        candidateName={application.name}
                      />
                      <Select
                        value={application.status}
                        onValueChange={(value) =>
                          handleStatusChange(application.id, value)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="REVIEWED">Reviewed</SelectItem>
                          <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
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
    </div>
  )
} 