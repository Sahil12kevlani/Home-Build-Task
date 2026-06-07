const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '.env.local')
console.log('Reading env from:', envPath)

let envContent = ''
try {
  envContent = fs.readFileSync(envPath, 'utf8')
} catch (err) {
  console.error('Failed to read .env.local:', err.message)
  process.exit(1)
}

const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
  if (match) {
    const key = match[1]
    let value = match[2] || ''
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }
    env[key] = value.trim()
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Anon Key is missing in .env.local')
  process.exit(1)
}

console.log('Supabase URL:', supabaseUrl)
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log('\n--- Checking profiles table ---')
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(5)
  if (pError) {
    console.error('Error fetching profiles:', pError)
  } else {
    console.log('Successfully fetched profiles. Count:', profiles.length)
    console.log(profiles)
  }

  console.log('\n--- Checking bookmarks table ---')
  const { data: bookmarks, error: bError } = await supabase.from('bookmarks').select('*').limit(5)
  if (bError) {
    console.error('Error fetching bookmarks:', bError)
  } else {
    console.log('Successfully fetched bookmarks. Count:', bookmarks.length)
    console.log(bookmarks)
  }

  console.log('\n--- Checking joined query ---')
  const { data: pBookmarks, error: bErr } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (bErr) {
    console.error('Error fetching bookmarks:', bErr)
  } else if (pBookmarks) {
    console.log('Successfully fetched public bookmarks. Count:', pBookmarks.length)
    const userIds = [...new Set(pBookmarks.map(bm => bm.user_id))]
    console.log('User IDs to fetch:', userIds)

    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, handle')
      .in('id', userIds)

    if (pErr) {
      console.error('Error fetching profiles:', pErr)
    } else {
      console.log('Successfully fetched profiles for bookmarks. Count:', profiles.length)
      const mapped = pBookmarks.map(bm => {
        const profile = profiles.find(p => p.id === bm.user_id)
        return {
          id: bm.id,
          title: bm.title,
          url: bm.url,
          handle: profile?.handle || 'user'
        }
      })
      console.log('Mapped Results:')
      console.log(JSON.stringify(mapped, null, 2))
    }
  }
}

run()
