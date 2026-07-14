import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'

export default async function AdminUsersPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_token')?.value
  
  if (!token) {
    redirect('/admin/login')
  }

  let callerId = '';
  try {
    const decoded = jwt.decode(token) as any
    callerId = decoded?.id
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      redirect('/admin/login')
    }
  } catch (e) {
    redirect('/admin/login')
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' }
  })

  async function upgradeToHR(targetUserId: string) {
    'use server'

    const cookieStore = cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token) return
    
    let adminId = '';
    try {
      const decoded = jwt.decode(token) as any
      adminId = decoded?.id
      if (!decoded || decoded.role !== 'SUPER_ADMIN') return;
    } catch (e) {
      return;
    }

    const caller = await db.superAdmin.findUnique({ where: { id: adminId } })
    if (!caller) return;

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
                    {u.role !== 'HR' && u.role !== 'ADMIN' && (
                      <form action={upgradeToHR.bind(null, u.id)}>
                        <Button type="submit" variant="outline" size="sm">
                          Make HR
                        </Button>
                      </form>
                    )}
                    {u.role === 'HR' && (
                       <Button disabled variant="outline" size="sm" className="opacity-50">
                         HR Admin
                       </Button>
                    )}
                    {u.role === 'ADMIN' && (
                       <Badge variant="default" className="bg-amber-600 hover:bg-amber-700">Super Admin</Badge>
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
