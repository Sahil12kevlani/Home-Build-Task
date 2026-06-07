'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// Helper to validate and clean URLs
function cleanUrl(url: string): string {
  let cleaned = url.trim()
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'https://' + cleaned
  }
  try {
    new URL(cleaned)
    return cleaned
  } catch {
    throw new Error('Invalid URL format')
  }
}

export async function addBookmark(currentState: any, formData: FormData) {
  const title = formData.get('title') as string
  const urlInput = formData.get('url') as string
  const isPublic = formData.get('is_public') === 'on'

  if (!title || !urlInput) {
    return { error: 'Title and URL are required' }
  }

  let url = ''
  try {
    url = cleanUrl(urlInput)
  } catch (err: any) {
    return { error: err.message }
  }

  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthenticated. Please log in.' }
  }

  // Insert bookmark
  const { error } = await supabase.from('bookmarks').insert({
    user_id: user.id,
    title: title.trim(),
    url,
    is_public: isPublic,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, message: 'Bookmark added successfully' }
}

export async function editBookmark(currentState: any, formData: FormData) {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const urlInput = formData.get('url') as string
  const isPublic = formData.get('is_public') === 'on'

  if (!id || !title || !urlInput) {
    return { error: 'Bookmark ID, title, and URL are required' }
  }

  let url = ''
  try {
    url = cleanUrl(urlInput)
  } catch (err: any) {
    return { error: err.message }
  }

  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthenticated. Please log in.' }
  }

  // Update bookmark. Constraint check: must belong to the user
  const { error } = await supabase
    .from('bookmarks')
    .update({
      title: title.trim(),
      url,
      is_public: isPublic,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, message: 'Bookmark updated successfully' }
}

export async function deleteBookmark(bookmarkId: string) {
  if (!bookmarkId) {
    return { error: 'Bookmark ID is required' }
  }

  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthenticated. Please log in.' }
  }

  // Delete bookmark. Constraint check: must belong to the user
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
