import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, CheckCircle, TrendingUp, Clock, Calendar } from "lucide-react";
import { RecentApplications } from "@/components/dashboard/recent-applications";
import { TopCandidates } from "@/components/dashboard/top-candidates";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const authUser = await currentUser();
  if (!authUser) return null;

  let user = await db.user.findUnique({ 
    where: { clerkId: authUser.id } 
  });

  if (!user) {
    user = await db.user.create({
      data: {
        id: authUser.id,  
        clerkId: authUser.id, 
        email: authUser.emailAddresses[0].emailAddress,
        name: authUser.firstName || "User",
        title: null,
        department: null,
        bio: null,
        phone: null,
      },
    });
  }

  // Fetch dashboard statistics
  const [
    totalCandidates,
    shortlistedCount,
    openPositionsCount,
    upcomingInterviews
  ] = await Promise.all([
    db.candidate.count(),
    db.application.count({
      where: {
        status: "SHORTLISTED"
      }
    }),
    db.position.count({
      where: {
        status: "OPEN"
      }
    }),
    db.interview.count({
      where: {
        scheduledFor: {
          gte: new Date()
        }
      }
    })
  ]);

  // Get today's interviews
  const todayInterviews = await db.interview.count({
    where: {
      scheduledFor: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    }
  });

  // Get last month's candidate count for comparison
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  
  const lastMonthCandidates = await db.candidate.count({
    where: {
      createdAt: {
        lt: new Date()
      }
    }
  });

  // Calculate growth percentages
  const candidateGrowth = lastMonthCandidates > 0 
    ? Math.round(((totalCandidates - lastMonthCandidates) / lastMonthCandidates) * 100) 
    : 0;

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your recruitment activities and candidate pipeline.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/positions">
            <Button variant="outline" className="h-9">
              <Briefcase className="mr-2 h-4 w-4" />
              Manage Positions
            </Button>
          </Link>
          <Link href="/dashboard/shortlisted">
            <Button className="h-9">
              <Users className="mr-2 h-4 w-4" />
              View Candidates
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalCandidates}</div>
            <div className="flex items-center pt-1">
              {candidateGrowth > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500">+{candidateGrowth}% from last month</p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No change from last month</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{shortlistedCount}</div>
            <div className="flex items-center pt-1">
              <p className="text-xs text-muted-foreground">
                {Math.round((shortlistedCount / (totalCandidates || 1)) * 100)}% of total candidates
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{openPositionsCount}</div>
            <p className="text-xs text-muted-foreground pt-1">
              Active job openings
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50">
            <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{upcomingInterviews}</div>
            <div className="flex items-center pt-1">
              <Clock className="h-4 w-4 text-amber-500 mr-1" />
              <p className="text-xs text-amber-500">{todayInterviews} scheduled for today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="recent">Recent Applications</TabsTrigger>
          <TabsTrigger value="top">Top Candidates</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <RecentApplications />
        </TabsContent>
        <TabsContent value="top" className="space-y-4">
          <TopCandidates />
        </TabsContent>
      </Tabs>
    </div>
  );
}
