import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarIcon, Info } from "lucide-react"

export default function AdminCalendarPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <DashboardHeader heading="System Calendar" text="Global view of scheduled events" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-amber-600" />
            Global Interview Calendar
          </CardTitle>
          <CardDescription>
            System-wide view of all scheduled interviews across all tenants.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Calendar Integration Required</h3>
          <p className="text-muted-foreground max-w-md">
            The global calendar view requires Super Admin Google Calendar integration to be configured in the environment variables.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
