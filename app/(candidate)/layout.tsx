import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma as db } from '@/lib/prisma'
import { CandidateClientLayout } from './client-layout'

export default async function CandidateLayout({
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

  // If user is HR, redirect to HR dashboard
  if (user?.role === 'HR') {
    redirect('/dashboard')
  }

  return <CandidateClientLayout>{children}</CandidateClientLayout>
}
