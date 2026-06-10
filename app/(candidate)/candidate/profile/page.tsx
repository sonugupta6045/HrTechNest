import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, GraduationCap, Briefcase, FileText } from 'lucide-react'

export default async function CandidateProfilePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const candidate = await db.candidate.findFirst({
    where: { userId }
  })

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-semibold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground">We couldn't find your profile data.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and resume.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your contact details and basic information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">Email Address</p>
                <p className="text-sm text-muted-foreground mt-1">{candidate.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">Phone Number</p>
                <p className="text-sm text-muted-foreground mt-1">{candidate.phone || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume & Skills</CardTitle>
            <CardDescription>Your uploaded resume and extracted skills.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">Resume URL</p>
                <p className="text-sm text-muted-foreground mt-1 break-all">
                  {candidate.resumeUrl ? (
                    <a href={candidate.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      View Resume
                    </a>
                  ) : (
                    'No resume uploaded yet.'
                  )}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium leading-none mb-3">Top Skills</p>
              <div className="flex flex-wrap gap-2">
                {candidate.skills && candidate.skills.length > 0 ? (
                  candidate.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No skills extracted.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>Your academic background.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2 border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="font-semibold">High School (10th)</span>
                </div>
                <p className="text-sm"><span className="font-medium">School:</span> {candidate.tenthSchool || 'N/A'}</p>
                <p className="text-sm"><span className="font-medium">Year:</span> {candidate.tenthYear || 'N/A'}</p>
                <p className="text-sm"><span className="font-medium">Percentage:</span> {candidate.tenthPercentage || 'N/A'}</p>
              </div>
              <div className="space-y-2 border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Higher Secondary (12th)</span>
                </div>
                <p className="text-sm"><span className="font-medium">School:</span> {candidate.twelfthSchool || 'N/A'}</p>
                <p className="text-sm"><span className="font-medium">Year:</span> {candidate.twelfthYear || 'N/A'}</p>
                <p className="text-sm"><span className="font-medium">Percentage:</span> {candidate.twelfthPercentage || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
