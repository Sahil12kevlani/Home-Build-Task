'use client'

import { useState, useActionState, useEffect } from 'react'
import { login, signup } from './actions'
import { Bookmark, AtSign, Mail, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ActionState {
  error?: string
  success?: boolean
  message?: string
}

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [handle, setHandle] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Unified handler to ensure return type matches useActionState's signature
  const handleAuth = async (
    prevState: ActionState | null,
    formData: FormData
  ): Promise<ActionState | null> => {
    if (mode === 'login') {
      const res = await login(prevState, formData)
      return res || null
    } else {
      const res = await signup(prevState, formData)
      return res || null
    }
  }

  // Use React 19 useActionState hook
  const [state, formAction, isPending] = useActionState(handleAuth, null)

  // Clear errors on mode switch or handle changes
  useEffect(() => {
    setErrorMsg(null)
  }, [mode, handle])

  // Capture errors from server actions — coerce to string to prevent {} rendering
  const rawError = errorMsg || (state && 'error' in state ? state.error : null)
  const displayError: string | null = rawError
    ? (typeof rawError === 'string' ? rawError : JSON.stringify(rawError))
    : null
  const displaySuccess = mode === 'signup' && state && 'success' in state ? state.success : false
  const displayMessage = state && 'message' in state ? state.message : ''

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setHandle(val)
  }

  return (
    <main className="flex-center" style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '40px 32px' }}>
        
        {/* Header / Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" className="logo flex-center" style={{ fontSize: '2rem', marginBottom: '8px' }}>
            <Bookmark size={32} strokeWidth={2.5} style={{ color: 'var(--accent-primary)' }} />
            <span>Pinpoint</span>
          </Link>
          <p style={{ fontSize: '0.95rem' }}>
            {mode === 'login' ? 'Welcome back! Sign in to manage your bookmarks.' : 'Create your secure account to start saving links.'}
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '28px'
        }}>
          <button
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`btn ${mode === 'login' ? 'btn-secondary' : ''}`}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              background: mode === 'login' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              border: 'none',
              fontSize: '0.9rem',
              color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setErrorMsg(null); }}
            className={`btn ${mode === 'signup' ? 'btn-secondary' : ''}`}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              background: mode === 'signup' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              border: 'none',
              fontSize: '0.9rem',
              color: mode === 'signup' ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
          >
            Register
          </button>
        </div>

        {/* Status Messages */}
        {displayError && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: 'var(--error)',
            fontSize: '0.88rem',
            lineHeight: '1.4',
            marginBottom: '24px'
          }}>
            {displayError}
          </div>
        )}

        {displaySuccess && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '10px',
            padding: '16px',
            color: 'var(--success)',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            marginBottom: '24px'
          }}>
            {displayMessage}
          </div>
        )}

        {/* Auth Form */}
        {!displaySuccess && (
          <form action={formAction}>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="handle">Claim Handle</label>
                <div className="input-with-prefix">
                  <span className="input-prefix">@</span>
                  <input
                    id="handle"
                    name="handle"
                    type="text"
                    required
                    placeholder="username"
                    value={handle}
                    onChange={handleHandleChange}
                    className="form-control"
                    maxLength={20}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Your public bookmarks profile will be at <strong>/{handle || 'handle'}</strong>
                </p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="form-control"
                  style={{ paddingLeft: '48px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-control"
                  style={{ paddingLeft: '48px' }}
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              {isPending ? 'Processing...' : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}
        
        {/* Back Link */}
        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ← Back to Home Page
          </Link>
        </div>

      </div>
    </main>
  )
}
