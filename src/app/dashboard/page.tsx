import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Verify user authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // 2. Fetch the user's profile handle (with fallback creation if missing)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('handle')
    .eq('id', user.id)
    .maybeSingle()

  let handle = 'user'

  if (profileError || !profile) {
    // Attempt dynamic fallback creation if profile is missing
    const metaHandle = user.user_metadata?.handle || `user_${user.id.substring(0, 8)}`
    const cleanHandle = metaHandle.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '')

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        handle: cleanHandle
      })
      .select('handle')
      .maybeSingle()

    if (!insertError && newProfile) {
      handle = newProfile.handle
    } else {
      console.error('Failed to create fallback profile row:', insertError)
      handle = cleanHandle
    }
  } else {
    handle = profile.handle
  }

  // 3. Fetch all bookmarks belonging to the user
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardClient 
      initialBookmarks={bookmarks || []} 
      userHandle={handle} 
      userEmail={user.email || ''} 
    />
  )
}
