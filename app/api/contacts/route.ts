import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // @ts-ignore - Ignore the TS error about the Contact model
    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
} 