import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { to, subject, html, senderEmail, senderName, message } = await request.json()

    if (!to || !subject || !html || !senderEmail || !senderName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save contact to database
    try {
      // @ts-ignore
      await prisma.contact.create({
        data: {
          name: senderName,
          email: senderEmail,
          subject: subject.replace('Contact Form: ', ''),
          message: message || '',
        }
      })
      console.log('Contact saved to database')
    } catch (dbError) {
      console.error('Error saving to database:', dbError)
      // Continue with email sending even if DB save fails
    }

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
      from: senderName ? `"${senderName}" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>` : process.env.EMAIL_USER || 'your-email@gmail.com',
      replyTo: senderEmail, // This allows you to reply directly to the sender
      to,
      subject,
      html,
    })

    return NextResponse.json({ success: true, message: 'Email sent successfully and contact saved' })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: (error as Error).message },
      { status: 500 }
    )
  }
} 