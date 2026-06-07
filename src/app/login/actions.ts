'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function login(currentState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { error: 'Email and password are required' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { error: error.message }
    }

    // Enforce email verification — block login if email not yet confirmed
    if (data?.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut()
      return {
        error:
          'Please verify your email address first. Check your inbox for the confirmation link.',
      }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (err: any) {
    // redirect() throws a special internal error — always re-throw it
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error('[login] Unexpected error:', err)
    return { error: err?.message ?? 'Something went wrong. Please try again.' }
  }
}

export async function signup(currentState: any, formData: FormData) {
  try {
    const email    = formData.get('email')    as string
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

    // 1. Check if handle is already taken
    const { data: existingHandle, error: queryError } = await supabase
      .from('profiles')
      .select('handle')
      .eq('handle', handle)
      .maybeSingle()

    if (queryError) {
      console.error('[signup] Handle query error:', queryError)
      return { error: 'Database check failed. Please try again.' }
    }

    if (existingHandle) {
      return { error: `Handle @${handle} is already taken. Please choose another.` }
    }

    // Resolve site URL dynamically so the confirmation link points to the right host
    const headersList = await headers()
    const host     = headersList.get('host') ?? 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const siteUrl  = `${protocol}://${host}`

    // 2. Create user in Supabase Auth
    //    Supabase will send the confirmation email automatically via the SMTP
    //    you configured in Authentication → SMTP Settings in the dashboard.
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { handle },
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })

    if (signupError) {
      return { error: signupError.message }
    }

    if (!authData?.user) {
      return { error: 'Signup failed unexpectedly. Please try again.' }
    }

    // 3a. If Supabase auto-confirmed the account (Confirm email = OFF in dashboard)
    //     redirect straight to the dashboard
    if (authData.session) {
      revalidatePath('/', 'layout')
      redirect('/dashboard')
    }

    // 3b. Confirm email = ON — user must click the link Supabase just emailed them
    return {
      success: true,
      message:
        'Account created! Please check your inbox for a confirmation email and click the link to activate your account.',
    }
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error('[signup] Unexpected error:', err)
    return { error: err?.message ?? 'Something went wrong. Please try again.' }
  }
}
