import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Info } from "lucide-react"

export default function AdminShortlistedPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <DashboardHeader heading="Shortlisted Candidates" text="Global view of shortlisted candidates" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-600" />
            Global Shortlist Pool
          </CardTitle>
          <CardDescription>
            System-wide view of all shortlisted candidates.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Detailed View Restricted</h3>
          <p className="text-muted-foreground max-w-md">
            Candidate shortlisting workflows are specific to HR tenants. As a Super Admin, you can view the complete candidate pool in the "All Candidates" tab, but workflow-specific lists are managed by individual HR users.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
