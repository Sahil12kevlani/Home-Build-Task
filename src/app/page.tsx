import { createClient } from '@/utils/supabase/server'
import { Bookmark, Shield, Sparkles, Smartphone, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
