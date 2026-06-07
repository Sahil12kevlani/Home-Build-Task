import { createClient } from '@/utils/supabase/server'
import { Bookmark, Shield, Sparkles, Smartphone, ArrowRight, Globe, ExternalLink, Link2 } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch 10 most recent public bookmarks
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(10)

  let showcaseItems: Array<{ id: string, title: string, url: string, handle: string }> = []

  if (bookmarks && bookmarks.length > 0) {
    // 2. Fetch profiles for these bookmarks to avoid join relationship cache errors
    const userIds = Array.from(new Set(bookmarks.map(bm => bm.user_id)))
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, handle')
      .in('id', userIds)

    // 3. Map handles in-memory
    showcaseItems = bookmarks.map((bm) => {
      const profile = (profiles || []).find(p => p.id === bm.user_id)
      return {
        id: bm.id,
        title: bm.title,
        url: bm.url,
        handle: profile?.handle || 'user',
      }
    })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Header */}
      <header className="app-header">
        <div className="container nav-container">
          <Link href="/" className="logo">
            <Bookmark size={26} strokeWidth={2.5} style={{ color: 'var(--accent-primary)' }} />
            <span>Pinpoint</span>
          </Link>
          
          <div className="nav-links">
            {user ? (
              <Link href="/dashboard" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1 }}>
        
        {/* Intro */}
        <section style={{ 
          textAlign: 'center', 
          padding: '100px 24px 80px 24px',
          maxWidth: '800px',
          margin: '0 auto'
        }} className="animate-fade-in">
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            padding: '6px 16px',
            borderRadius: '40px',
            marginBottom: '24px',
            color: 'var(--accent-primary)',
            fontSize: '0.88rem',
            fontWeight: '600'
          }}>
            <Sparkles size={14} />
            <span>Introducing Pinpoint Bookmarks</span>
          </div>

          <h1 style={{ 
            fontSize: '3.6rem', 
            lineHeight: '1.15', 
            fontFamily: 'var(--font-title)', 
            fontWeight: '800', 
            marginBottom: '24px',
            background: 'linear-gradient(to right, #ffffff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }} className="hero-title">
            Linktree meets Pocket.<br />
            Simply beautiful.
          </h1>

          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '40px',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 40px auto'
          }}>
            Pinpoint is your personal bookmarks manager. Organize your daily web links securely and publish your favorites on a gorgeous public portfolio.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link href="/dashboard" id="btn-cta-dashboard" className="btn btn-primary" style={{ padding: '14px 28px' }}>
                <span>Go to Dashboard</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link href="/login" id="btn-cta-register" className="btn btn-primary" style={{ padding: '14px 28px' }}>
                  <span>Claim Your Handle</span>
                  <ArrowRight size={18} />
                </Link>
                <Link href="/login" id="btn-cta-login" className="btn btn-secondary" style={{ padding: '14px 28px' }}>
                  <span>Learn More</span>
                </Link>
              </>
            )}
          </div>

        </section>

        {/* Public Bookmarks Showcase Section */}
        <section style={{ 
          padding: '40px 24px 80px 24px', 
          maxWidth: '800px',
          margin: '0 auto'
        }} className="animate-fade-in">
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '1.75rem', 
            fontFamily: 'var(--font-title)', 
            marginBottom: '32px',
            color: 'var(--text-primary)'
          }}>
            Explore Community Links
          </h2>

          {showcaseItems.length === 0 ? (
            <div className="glass-panel" style={{ 
              padding: '40px', 
              textAlign: 'center', 
              border: '1px dashed var(--border-color)',
              background: 'rgba(255, 255, 255, 0.01)'
            }}>
              <Link2 size={28} style={{ color: 'var(--text-muted)', marginBottom: '8px', opacity: 0.5 }} />
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                No public bookmarks shared yet. Be the first to share one!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {showcaseItems.map((item) => (
                <div 
                  key={item.id} 
                  className="glass-panel"
                  style={{ 
                    padding: '16px 20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: '20px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          fontSize: '1.05rem', 
                          fontWeight: '600', 
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </span>
                        <ExternalLink size={12} style={{ opacity: 0.6 }} />
                      </a>
                    </div>
                    <span style={{ 
                      fontSize: '0.82rem', 
                      color: 'var(--text-muted)',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      display: 'block'
                    }}>
                      {item.url}
                    </span>
                  </div>

                  {/* Handle Link */}
                  <Link 
                    href={`/${item.handle}`} 
                    className="user-tag"
                    style={{ 
                      padding: '5px 10px', 
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Globe size={12} />
                    <span>@{item.handle}</span>
                  </Link>

                </div>
              ))}
            </div>
          )}
        </section>

        {/* Feature Grid */}
        <section style={{ 
          padding: '60px 24px 100px 24px', 
          background: 'rgba(255, 255, 255, 0.01)',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div className="container">
            <h2 style={{ 
              textAlign: 'center', 
              fontSize: '2rem', 
              fontFamily: 'var(--font-title)', 
              marginBottom: '50px' 
            }}>
              Designed for visual excellence.
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              
              {/* Feature 1 */}
              <div className="glass-panel" style={{ padding: '32px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Shield size={24} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', fontFamily: 'var(--font-title)' }}>Secure & Private</h3>
                <p style={{ fontSize: '0.95rem' }}>
                  Keep your bookmarks personal. Secure authentication ensures only you can view, edit, and manage your private links.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-panel" style={{ padding: '32px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: 'rgba(168, 85, 247, 0.1)', 
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  color: 'var(--accent-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Bookmark size={24} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', fontFamily: 'var(--font-title)' }}>Public / Private Toggle</h3>
                <p style={{ fontSize: '0.95rem' }}>
                  Toggle the visibility of any bookmark with a single switch. Seamlessly compile resource sheets for others.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-panel" style={{ padding: '32px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Smartphone size={24} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', fontFamily: 'var(--font-title)' }}>Unique handles</h3>
                <p style={{ fontSize: '0.95rem' }}>
                  Claim your unique handle `@username` and compile a public portfolio page. Let others explore your favorite links.
                </p>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ padding: '40px 24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div className="container">
          <p>© 2026 Pinpoint. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
