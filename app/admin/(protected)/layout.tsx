import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'
import { AdminClientLayout } from './client-layout'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_token')?.value
  
  if (!token) {
    redirect('/admin/login')
  }
  
  try {
    const decoded = jwt.decode(token) as any
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      redirect('/admin/login')
    }
  } catch (e) {
    redirect('/admin/login')
  }

  return <AdminClientLayout>{children}</AdminClientLayout>
}
