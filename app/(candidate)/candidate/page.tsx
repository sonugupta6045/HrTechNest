import { auth } from '@clerk/nextjs/server'
import { prisma as db } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, BriefcaseIcon, MapPinIcon } from 'lucide-react'
import { format } from 'date-fns'

export default async function CandidateDashboard() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  // Find candidate by userId
  const candidate = await db.candidate.findUnique({
    where: { userId },
    include: {
      user: true,
      applications: {
        include: {
          position: true,
          interviews: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BriefcaseIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          We couldn't find a candidate profile associated with your account.
          Please complete your profile to start applying.
        </p>
      </div>
    )
  }

  const apps = candidate.applications

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {candidate.user?.name.split(' ')[0]}</h2>
        <p className="text-muted-foreground">Here is the status of your recent applications.</p>
      </div>

      {apps.length === 0 ? (
        <Card className="border-dashed shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <BriefcaseIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground max-w-sm">
              You haven't applied to any positions yet. Explore our open roles and find your next opportunity!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {apps.map((app) => (
            <Card key={app.id} className="overflow-hidden transition-all hover:shadow-md border-l-4 border-l-primary">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{app.position?.title || 'Unknown Position'}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1">
                        <BriefcaseIcon className="h-3 w-3" />
                        {app.position?.department || 'General'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3" />
                        {app.position?.location || 'Remote'}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={
                      app.status === 'OFFERED' ? 'default' : 
                      app.status === 'REJECTED' ? 'destructive' : 
                      app.status === 'INTERVIEWING' ? 'secondary' : 'outline'
                    }
                    className="w-fit text-sm py-1 px-3"
                  >
                    {app.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-6 text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span>Applied on {format(new Date(app.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  
                  {app.interviews && app.interviews.length > 0 && (
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <CalendarIcon className="h-4 w-4 text-emerald-500" />
                      <span>
                        Next Interview: {format(new Date(app.interviews[0].scheduledFor), 'MMM d, yyyy - h:mm a')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
