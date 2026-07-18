import {PositionsManager} from "@/components/dashboard/positions-manager";


export default function AdminPositionsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Positions</h2>
        <p className="text-muted-foreground">View and manage all job positions across the organization.</p>
      </div>

      <PositionsManager />
    </div>
  )
}
