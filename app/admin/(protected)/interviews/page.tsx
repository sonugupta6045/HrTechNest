import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarClock, Info } from "lucide-react"

export default function AdminInterviewsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <DashboardHeader heading="Interviews" text="Global view of interview schedules" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-amber-600" />
            Global Interview Status
          </CardTitle>
          <CardDescription>
            System-wide view of all scheduled interviews.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Detailed View Restricted</h3>
          <p className="text-muted-foreground max-w-md">
            Interview scheduling and management are restricted to HR tenant users to prevent cross-tenant privacy leaks. Super Admins do not manage or schedule interviews on behalf of tenants.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
