import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { contactId, to, subject, message } = await request.json()

    if (!contactId || !to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare HTML content for the email
    const htmlContent = message.replace(/\n/g, '<br />')

    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Set this in .env
        pass: process.env.EMAIL_PASSWORD || 'your-app-password', // Set this in .env
      },
    })

    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to,
      subject,
      html: htmlContent,
    })

    // Update the contact status in the database
    // @ts-ignore - Ignore the TS error about the Contact model
    await prisma.contact.update({
      where: { id: contactId },
      data: {
        status: 'responded',
        responseDate: new Date(),
      },
    })

    return NextResponse.json({ success: true, message: 'Response sent successfully' })
  } catch (error) {
    console.error('Error sending response:', error)
    return NextResponse.json(
      { error: 'Failed to send response', details: (error as Error).message },
      { status: 500 }
    )
  }
} 