import { Suspense } from "react";
import { CandidatesList } from "@/components/dashboard/candidates-list";
import { Skeleton } from "@/components/ui/skeleton";
import { getCandidatesWithRankings } from "@/app/actions/candidate";

export default async function CandidatesPage() {
  const candidatesData = await getCandidatesWithRankings();
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Candidates</h1>
        <p className="text-muted-foreground">
          View and rank all candidates based on skills and education
        </p>
      </div>
      
      <Suspense fallback={<CandidatesListSkeleton />}>
        <CandidatesList candidates={candidatesData} />
      </Suspense>
    </div>
  );
}

function CandidatesListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 border rounded-lg">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
} 