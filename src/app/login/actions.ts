'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import nodemailer from 'nodemailer'
import { headers } from 'next/headers'

// Initialize Nodemailer Gmail transporter if credentials are available
const gmailTransporter = (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
  ? nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  : null

export async function login(currentState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Enforce email verification check
  if (data?.user && !data.user.email_confirmed_at) {
    await supabase.auth.signOut()
    return { error: 'Please verify your email address by clicking the link in the verification email before logging in.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(currentState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const handleInput = formData.get('handle') as string

  if (!email || !password || !handleInput) {
    return { error: 'All fields are required' }
  }

  // Clean and validate handle
  const handle = handleInput.trim().toLowerCase().replace(/^@/, '')

  if (handle.length < 3) {
    return { error: 'Handle must be at least 3 characters long' }
  }

  if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
    return { error: 'Handle can only contain letters, numbers, and underscores' }
  }

  const supabase = await createClient()

  // 1. Check if handle is already taken in profiles table
  const { data: existingHandle, error: queryError } = await supabase
    .from('profiles')
    .select('handle')
    .eq('handle', handle)
    .maybeSingle()

  if (queryError) {
    return { error: 'Database check failed. Please try again.' }
  }

  if (existingHandle) {
    return { error: `Handle @${handle} is already taken` }
  }

  // Get host dynamically from request headers
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  const siteUrl = `${protocol}://${host}`

  // 2. Register user in Supabase Auth
  // We pass the handle in metadata so the DB trigger can capture it and insert it into profiles table.
  const { data: authData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        handle: handle,
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (signupError) {
    return { error: signupError.message }
  }

  // 3. Send welcome email via Gmail (Nodemailer)
  if (gmailTransporter && authData?.user?.email) {
    try {
      await gmailTransporter.sendMail({
        from: `"Pinpoint Team" <${process.env.GMAIL_USER}>`,
        to: authData.user.email,
        subject: 'Welcome to Pinpoint! 📌',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 40px;">📌</span>
              <h1 style="color: #6366f1; margin-top: 10px; font-size: 28px; font-weight: 800;">Welcome to Pinpoint!</h1>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">Hi there,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">Thank you for signing up for Pinpoint. Your personal bookmarks dashboard is ready for you!</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 15px; font-weight: 600; color: #334155;">Your Claimed Profile Handle:</p>
              <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700; color: #6366f1;">@${handle}</p>
            </div>
            <p style="font-size: 15px; line-height: 1.6; color: #475569;"><strong>Next Steps:</strong></p>
            <ul style="padding-left: 20px; color: #475569; font-size: 15px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Log in to your dashboard to add your first bookmark.</li>
              <li style="margin-bottom: 8px;">Toggle the &quot;Public&quot; flag on any bookmark to display it on your public portfolio at <strong>/&lt;your-handle&gt;</strong>.</li>
            </ul>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Pinpoint, Inc. · Built with Next.js &amp; Supabase.</p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Failed to send welcome email via Gmail:', emailErr)
      // Do not block signup success if welcome email fails
    }
  }

  // Check if session exists (i.e. if email auto-confirm is enabled in Supabase)
  if (authData.session) {
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } else {
    return { 
      success: true, 
      message: 'Registration successful! Please check your email for a verification link to confirm your account and log in.' 
    }
  }
}
