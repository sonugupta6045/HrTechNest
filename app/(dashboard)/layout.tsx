import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma as db } from '@/lib/prisma'
import { ClientLayout } from './client-layout'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Check the user's role in the database
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true }
  })

  // If user is not found or is not an HR/ADMIN, redirect to candidate portal
  // (In case the webhook hasn't fired yet, they might not be found, but they are a user)
  if (!user || (user.role !== 'HR' && user.role !== 'ADMIN')) {
    redirect('/candidate')
  }

  return <ClientLayout>{children}</ClientLayout>
}
