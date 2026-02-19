import { useState } from 'react'
import { useAuth } from '../pages/_app'
import { supabase } from '../lib/supabase'

export default function Header({ onAuthOpen, onPostOpen, onAdminOpen, search, setSearch }) {
  const { user, profile } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const signOut = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
  }

  return (
    <header style={{
      background: '#0B1F3A', position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 24px rgba(0,0,0,0.25)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 66, gap: 18 }}>

        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', minWidth: 'fit-content' }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #C9A84C, #2E8BC0)',
            borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
          }}>🏖</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '0.01em', fontFamily: 'Playfair Display, serif' }}>Makadi Heights</div>
            <div style={{ fontSize: 9, color: '#4AA8D8', letterSpacing: '0.12em', fontWeight: 600 }}>PRIVATE MARKETPLACE</div>
          </div>
        </a>

        {/* Search */}
        <form onSubmit={e => e.preventDefault()} style={{ flex: 1, maxWidth: 460, position: 'relative' }}>
          <input
            placeholder="Search properties, listings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.1)',
              border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 11,
              padding: '9px 42px 9px 16px', color: '#fff', fontSize: 14,
              outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif'
            }}
          />
          <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}
            width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#4AA8D8" strokeWidth={2.5}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </form>

        {/* Right Actions */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {user && (
            <button onClick={onPostOpen} className="btn-gold" style={{ fontSize: 13, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Post Listing
            </button>
          )}
          {profile?.role === 'admin' && (
            <button onClick={onAdminOpen} style={{
              background: '#E74C3C', color: '#fff', border: 'none', borderRadius: 8,
              padding: '8px 13px', fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}>🛡️ Admin</button>
          )}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 10, padding: '6px 12px', cursor: 'pointer', color: '#fff'
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2E8BC0, #C9A84C)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14
                }}>{(profile?.full_name || user.email)[0].toUpperCase()}</div>
                <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name?.split(' ')[0] || 'Account'}
                </span>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%',
                  background: '#fff', borderRadius: 12, padding: '8px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)', minWidth: 180, zIndex: 200
                }}>
                  <a href="/my-listings" style={{ display: 'block', padding: '10px 14px', color: '#0B1F3A', textDecoration: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500 }}
                    onMouseEnter={e => e.target.style.background='#F0F2F5'} onMouseLeave={e => e.target.style.background='transparent'}>
                    📋 My Listings
                  </a>
                  <a href="/profile" style={{ display: 'block', padding: '10px 14px', color: '#0B1F3A', textDecoration: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500 }}
                    onMouseEnter={e => e.target.style.background='#F0F2F5'} onMouseLeave={e => e.target.style.background='transparent'}>
                    👤 My Profile
                  </a>
                  <a href="/saved" style={{ display: 'block', padding: '10px 14px', color: '#0B1F3A', textDecoration: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500 }}
                    onMouseEnter={e => e.target.style.background='#F0F2F5'} onMouseLeave={e => e.target.style.background='transparent'}>
                    ❤️ Saved Listings
                  </a>
                  <div style={{ height: 1, background: '#E2E6EA', margin: '6px 0' }}/>
                  <button onClick={signOut} style={{
                    display: 'block', width: '100%', padding: '10px 14px',
                    color: '#E74C3C', background: 'none', border: 'none',
                    borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left'
                  }}
                    onMouseEnter={e => e.target.style.background='#FFF0EE'} onMouseLeave={e => e.target.style.background='transparent'}>
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onAuthOpen} className="btn-accent" style={{ fontSize: 14, padding: '9px 20px' }}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
