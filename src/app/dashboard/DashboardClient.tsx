'use client'

import { useState, useTransition, useActionState, useEffect } from 'react'
import { addBookmark, editBookmark, deleteBookmark, signout } from './actions'
import { 
  LogOut, Plus, Edit2, Trash2, Globe, Lock, Search, ExternalLink, X, Bookmark, Link2 
} from 'lucide-react'
import Link from 'next/link'

interface BookmarkItem {
  id: string
  title: string
  url: string
  is_public: boolean
  created_at: string
}

interface DashboardClientProps {
  initialBookmarks: BookmarkItem[]
  userHandle: string
  userEmail: string
}

export default function DashboardClient({ 
  initialBookmarks, 
  userHandle, 
  userEmail 
}: DashboardClientProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(initialBookmarks)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | null>(null)
  
  // Form values for Add/Edit
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // useTransition for deleting
  const [isPendingDelete, startDeleteTransition] = useTransition()

  // Sync bookmarks state when initialBookmarks changes
  useEffect(() => {
    setBookmarks(initialBookmarks)
  }, [initialBookmarks])

  // Handle Edit Action State
  const [editState, editAction, isPendingEdit] = useActionState(
    async (state: any, formData: FormData) => {
      setErrorMsg(null)
      const res = await editBookmark(state, formData)
      if (res.error) {
        setErrorMsg(res.error)
        return res
      }
      // Reset editing
      setEditingBookmark(null)
      setTitle('')
      setUrl('')
      setIsPublic(false)
      return res
    },
    null
  )

  // Handle Add Action State
  const [addState, addAction, isPendingAdd] = useActionState(
    async (state: any, formData: FormData) => {
      setErrorMsg(null)
      const res = await addBookmark(state, formData)
      if (res.error) {
        setErrorMsg(res.error)
        return res
      }
      // Reset form
      setTitle('')
      setUrl('')
      setIsPublic(false)
      return res
    },
    null
  )

  // Trigger editing mode
  const startEdit = (bm: BookmarkItem) => {
    setEditingBookmark(bm)
    setTitle(bm.title)
    setUrl(bm.url)
    setIsPublic(bm.is_public)
    setErrorMsg(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingBookmark(null)
    setTitle('')
    setUrl('')
    setIsPublic(false)
    setErrorMsg(null)
  }

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      startDeleteTransition(async () => {
        const res = await deleteBookmark(id)
        if (res?.error) {
          alert(res.error)
        }
      })
    }
  }

  // Filtered Bookmarks
  const filteredBookmarks = bookmarks.filter(bm => 
    bm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bm.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header className="app-header">
        <div className="container nav-container">
          <Link href="/dashboard" className="logo">
            <Bookmark size={26} strokeWidth={2.5} style={{ color: 'var(--accent-primary)' }} />
            <span>Pinpoint</span>
          </Link>
          
          <div className="nav-links">
            <Link href={`/${userHandle}`} className="user-tag" target="_blank">
              <Globe size={16} />
              <span>@{userHandle}</span>
              <ExternalLink size={12} style={{ opacity: 0.7 }} />
            </Link>
            
            <button 
              onClick={() => signout()} 
              className="btn btn-secondary flex-center"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <LogOut size={16} />
              <span className="d-none d-sm-inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, padding: '40px 24px' }}>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '40px',
          alignItems: 'start'
        }} className="dashboard-grid">
          
          {/* Form Block (Add or Edit) */}
          <div className="glass-panel animate-fade-in" style={{ padding: '28px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={20} style={{ color: 'var(--accent-primary)' }} />
              <span>{editingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}</span>
            </h2>

            {/* Error Message */}
            {errorMsg && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--error)',
                fontSize: '0.85rem',
                marginBottom: '16px'
              }}>
                {errorMsg}
              </div>
            )}

            <form action={editingBookmark ? editAction : addAction}>
              {editingBookmark && (
                <input type="hidden" name="id" value={editingBookmark.id} />
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="title">Bookmark Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Next.js Documentation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="url">Destination URL</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Link2 size={18} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
                  <input
                    id="url"
                    name="url"
                    type="text"
                    required
                    placeholder="e.g. nextjs.org/docs"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '48px' }}
                  />
                </div>
              </div>

              {/* Privacy Toggle Switch */}
              <div className="switch-group">
                <div className="switch-label-container">
                  <span className="switch-title">Public Bookmark</span>
                  <span className="switch-desc">Visible to anyone on your public portfolio</span>
                </div>
                <label className="switch">
                  <input 
                    name="is_public" 
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={isPendingAdd || isPendingEdit}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {isPendingAdd || isPendingEdit ? 'Saving...' : 'Save Bookmark'}
                </button>
                {editingBookmark && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="btn btn-secondary"
                    style={{ padding: '12px 18px' }}
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Bookmarks List Block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Search and Title */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              justifyContent: 'space-between',
              alignItems: 'stretch'
            }} className="list-header">
              <div>
                <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)' }}>My Bookmarks</h1>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Signed in as <span style={{ color: 'var(--text-secondary)' }}>{userEmail}</span>
                </p>
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '360px', width: '100%' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '48px', paddingTop: '10px', paddingBottom: '10px' }}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')} 
                    style={{ 
                      position: 'absolute', 
                      right: '16px', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      color: 'var(--text-muted)' 
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Bookmarks Grid */}
            {filteredBookmarks.length === 0 ? (
              <div className="glass-panel" style={{ 
                padding: '48px', 
                textAlign: 'center', 
                border: '1px dashed var(--border-color)',
                background: 'rgba(255, 255, 255, 0.01)'
              }}>
                <Link2 size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No Bookmarks Found</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {searchQuery ? 'No bookmarks match your search term.' : "You don't have any bookmarks yet. Create one on the left!"}
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '16px'
              }} className="bookmarks-container">
                {filteredBookmarks.map((bm) => (
                  <div 
                    key={bm.id}
                    className="glass-panel animate-fade-in"
                    style={{ 
                      padding: '20px 24px', 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '20px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <h3 style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: '600', 
                          textOverflow: 'ellipsis', 
                          overflow: 'hidden', 
                          whiteSpace: 'nowrap'
                        }}>
                          {bm.title}
                        </h3>
                        {bm.is_public ? (
                          <span className="badge badge-public">
                            <Globe size={10} style={{ marginRight: '4px' }} />
                            Public
                          </span>
                        ) : (
                          <span className="badge badge-private">
                            <Lock size={10} style={{ marginRight: '4px' }} />
                            Private
                          </span>
                        )}
                      </div>
                      
                      <a 
                        href={bm.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          fontSize: '0.85rem', 
                          color: 'var(--text-muted)',
                          wordBreak: 'break-all',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>{bm.url}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => startEdit(bm)}
                        className="btn btn-secondary btn-icon flex-center"
                        title="Edit Bookmark"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(bm.id)}
                        className="btn btn-danger btn-icon flex-center"
                        title="Delete Bookmark"
                        disabled={isPendingDelete}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </main>

    </div>
  )
}
