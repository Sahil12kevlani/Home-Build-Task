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

  // 2. Fetch the user's profile handle
  const { data: profile } = await supabase
    .from('profiles')
    .select('handle')
    .eq('id', user.id)
    .single()

  const handle = profile?.handle || 'user'

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
