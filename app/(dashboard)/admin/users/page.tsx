import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'

export default async function AdminUsersPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Double check HR role
  const currentUser = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (currentUser?.role !== 'HR') {
    redirect('/candidate')
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' }
  })

  async function upgradeToHR(targetUserId: string) {
    'use server'
    
    // Verify admin calling this is HR
    const authData = await auth()
    const callerId = authData.userId
    
    if (!callerId) return;

    const caller = await db.user.findUnique({ where: { clerkId: callerId } })
    if (caller?.role !== 'HR') return;

    await db.user.update({
      where: { id: targetUserId },
      data: { role: 'HR' }
    })
    
    revalidatePath('/admin/users')
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">Manage system users and their roles.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View and manage all registered accounts across the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'HR' ? 'default' : 'secondary'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    {u.role !== 'HR' && (
                      <form action={upgradeToHR.bind(null, u.id)}>
                        <Button type="submit" variant="outline" size="sm">
                          Make HR
                        </Button>
                      </form>
                    )}
                    {u.role === 'HR' && u.clerkId !== userId && (
                       <Button disabled variant="outline" size="sm" className="opacity-50">
                         HR Admin
                       </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Invite HR Admins</CardTitle>
          <CardDescription>You can also share a special invite link to allow new HR members to join.</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-sm font-mono bg-muted p-2 rounded w-fit">
              /invite?code=SECRET_HR_CODE
           </p>
           <p className="text-sm text-muted-foreground mt-2">
             When a user visits this link, their role will be automatically upgraded to HR. Note: You must configure `INVITE_CODE` in your environment variables.
           </p>
        </CardContent>
      </Card>
    </div>
  )
}
