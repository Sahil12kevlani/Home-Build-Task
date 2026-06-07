import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Bookmark, Globe, ExternalLink, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ handle: string }>
}

export const dynamic = 'force-dynamic'

export default async function PublicProfilePage({ params }: PageProps) {
  // 1. Await params as required by Next.js 15+ App Router
  const resolvedParams = await params
  const handle = resolvedParams.handle.toLowerCase().replace(/^@/, '')

  const supabase = await createClient()

  // 2. Fetch the profile details
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, handle, created_at')
    .eq('handle', handle)
    .maybeSingle()

  if (profileError || !profile) {
    notFound()
  }

  // 3. Fetch public-only bookmarks for this user
  const { data: publicBookmarks } = await supabase
    .from('bookmarks')
    .select('id, title, url, created_at')
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  // 4. Check if current visitor is the owner (to display dashboard link)
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user && user.id === profile.id

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Dynamic Header */}
      <header className="app-header">
        <div className="container nav-container">
          <Link href="/" className="logo">
            <Bookmark size={26} strokeWidth={2.5} style={{ color: 'var(--accent-primary)' }} />
            <span>Pinpoint</span>
          </Link>
          
          <div className="nav-links">
            {isOwner ? (
              <Link href="/dashboard" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Create Your Own
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="container" style={{ flex: 1, padding: '60px 24px', maxWidth: '680px' }}>
        
        {/* Profile Card Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }} className="animate-fade-in">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--accent-gradient)',
            color: '#ffffff',
            fontSize: '2rem',
            fontWeight: '800',
            marginBottom: '16px',
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)'
          }}>
            {handle.substring(0, 2).toUpperCase()}
          </div>
          
          <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-title)', fontWeight: '800', marginBottom: '6px' }}>
            @{handle}
          </h1>
          
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={14} />
            <span>Public Bookmarks List</span>
          </p>
        </div>

        {/* Bookmarks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
          {!publicBookmarks || publicBookmarks.length === 0 ? (
            <div className="glass-panel" style={{ 
              padding: '48px', 
              textAlign: 'center', 
              border: '1px dashed var(--border-color)',
              background: 'rgba(255, 255, 255, 0.01)'
            }}>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                This user has not added any public bookmarks yet.
              </p>
            </div>
          ) : (
            publicBookmarks.map((bm) => (
              <a 
                key={bm.id} 
                href={bm.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="glass-panel"
                style={{ 
                  padding: '24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '20px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color-hover)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'var(--bg-card-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.background = 'var(--bg-card)';
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: '700', 
                    marginBottom: '4px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-title)'
                  }}>
                    {bm.title}
                  </h3>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    display: 'block'
                  }}>
                    {bm.url}
                  </span>
                </div>
                
                <div style={{ 
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.03)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)'
                }}>
                  <ExternalLink size={16} />
                </div>
              </a>
            ))
          )}
        </div>

      </main>

      {/* Footer */}
      <footer style={{ 
        padding: '40px 24px', 
        textAlign: 'center', 
        borderTop: '1px solid var(--border-color)',
        marginTop: '60px'
      }}>
        <div className="container">
          <Link href="/" style={{ 
            fontSize: '0.85rem', 
            color: 'var(--text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>Powered by</span>
            <span style={{ 
              color: 'var(--text-secondary)', 
              fontWeight: '700',
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Pinpoint</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </footer>

    </div>
  )
}
