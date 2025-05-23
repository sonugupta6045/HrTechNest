import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Clock, Building, AlertCircle } from "lucide-react"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

// Fetch job data from the API
async function getJob(id: string) {
  try {
    const job = await prisma.position.findUnique({
      where: { id }
    });
    
    if (!job) {
      return null;
    }
    
    // Process the job data
    return {
      ...job,
      requirements: job.requirements.split('\n').filter(Boolean),
      responsibilities: job.description.split('\n').filter(Boolean).slice(0, 7),
      benefits: [
        "Competitive salary and equity",
        "Health, dental, and vision insurance",
        "Flexible work hours and remote work options",
        "Professional development budget",
        "Home office stipend",
        "Paid time off and parental leave",
      ],
    };
  } catch (error) {
    console.error("Error fetching job:", error);
    return null;
  }
}

export default async function JobPage({ params }: { params: { id: string } }) {
  const job = await getJob(params.id)
  
  if (!job) {
    notFound()
  }
  
  // Check if job is closed
  const isJobClosed = job.status === "CLOSED";

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Link href="/jobs" className="inline-flex items-center text-sm mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all jobs
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-3xl">{job.title}</CardTitle>
                {isJobClosed && (
                  <Badge variant="destructive" className="uppercase">
                    Closed
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-2">
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {job.department}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {job.type}
                  </Badge>
                </div>
              </CardDescription>
            </div>
            {!isJobClosed ? (
              <Link href={`/jobs/${job.id}/apply`}>
                <Button size="lg">Apply Now</Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>This position is no longer accepting applications</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Job Description</h3>
            <p>{job.description}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Responsibilities</h3>
            <ul className="list-disc pl-5 space-y-1">
              {job.responsibilities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Requirements</h3>
            <ul className="list-disc pl-5 space-y-1">
              {job.requirements.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Benefits</h3>
            <ul className="list-disc pl-5 space-y-1">
              {job.benefits.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center border-t pt-6">
          <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
            Posted: {formatDate(job.postedDate)}
          </p>
          {!isJobClosed ? (
            <Link href={`/jobs/${job.id}/apply`}>
              <Button>Apply for this Position</Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Position closed</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

