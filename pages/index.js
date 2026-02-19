import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import { useAuth } from './_app'
import Header from '../components/Header'
import PropertyCard from '../components/PropertyCard'
import PropertyDetail from '../components/PropertyDetail'
import AuthModal from '../components/AuthModal'
import PostModal from '../components/PostModal'
import AdminModal from '../components/AdminModal'

const PHASES = ['All', 'Phase 1', 'Phase 2']
const TYPES = ['All', 'Villa', 'Twin House', 'Chalet', 'Studio', 'Penthouse', 'Apartment']
const BEDS = ['Any', '1', '2', '3', '4', '5+']

export default function Home() {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState('sale')
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null) // 'auth' | 'post' | 'admin'
  const [filters, setFilters] = useState({ phase: 'All', type: 'All', beds: 'Any', minPrice: '', maxPrice: '' })

  const loadListings = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('listings')
      .select('*, profiles(full_name, phone, email)')
      .eq('status', 'approved')
      .eq('listing_type', tab)
      .order('created_at', { ascending: false })

    if (filters.phase !== 'All') q = q.eq('phase', filters.phase)
    if (filters.type !== 'All') q = q.eq('property_type', filters.type)
    if (filters.minPrice) q = q.gte('price', Number(filters.minPrice))
    if (filters.maxPrice) q = q.lte('price', Number(filters.maxPrice))
    if (filters.beds !== 'Any') {
      const n = parseInt(filters.beds)
      if (filters.beds.includes('+')) q = q.gte('bedrooms', n)
      else q = q.eq('bedrooms', n)
    }
    if (search) q = q.ilike('title', `%${search}%`)

    const { data } = await q
    setListings(data || [])
    setLoading(false)
  }, [tab, filters, search])

  useEffect(() => {
    const t = setTimeout(loadListings, 300)
    return () => clearTimeout(t)
  }, [loadListings])

  const resetFilters = () => setFilters({ phase: 'All', type: 'All', beds: 'Any', minPrice: '', maxPrice: '' })
  const hasFilters = filters.phase !== 'All' || filters.type !== 'All' || filters.beds !== 'Any' || filters.minPrice || filters.maxPrice

  const selStyle = (current, val) => ({
    border: `1.5px solid ${current === val ? '#2E8BC0' : '#E2E6EA'}`,
    background: current === val ? 'rgba(46,139,192,0.08)' : '#fff',
    color: current === val ? '#2E8BC0' : '#5A6472',
    padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
    fontWeight: 600, fontSize: 13, transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif'
  })

  return (
    <>
      <Head>
        <title>Makadi Heights — Private Marketplace</title>
        <meta name="description" content="Makadi Heights private property marketplace for verified residents. Find properties for sale and rent in Phase 1 & Phase 2." />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏖</text></svg>" />
      </Head>

      <Header
        onAuthOpen={() => setModal('auth')}
        onPostOpen={() => user ? setModal('post') : setModal('auth')}
        onAdminOpen={() => setModal('admin')}
        search={search}
        setSearch={setSearch}
      />

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0B1F3A 0%, #1a3a66 55%, #1B4F8A 100%)', padding: '44px 0 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 34 }} className="fade-up">
            <h1 style={{ color: '#fff', fontSize: 'clamp(22px,4vw,40px)', marginBottom: 10, lineHeight: 1.2 }}>
              Makadi Heights<br/>
              <span style={{ color: '#C9A84C', fontStyle: 'italic' }}>Private Marketplace</span>
            </h1>
            <p style={{ color: '#4AA8D8', fontSize: 15, letterSpacing: '0.02em' }}>
              Exclusively for verified residents · Hurghada, Red Sea
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 30 }}>
            {[['Phase 1 & 2', 'Community'], [listings.length || '0', 'Active Listings'], ['100%', 'Verified']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#C9A84C', fontFamily: 'Playfair Display, serif' }}>{n}</div>
                <div style={{ fontSize: 12, color: '#4AA8D8', letterSpacing: '0.05em' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Tab Bar */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {[['sale', '🏠 For Sale'], ['rent', '🔑 For Rent']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding: '13px 32px', border: 'none',
                background: tab === id ? '#fff' : 'transparent',
                color: tab === id ? '#0B1F3A' : 'rgba(255,255,255,0.7)',
                fontWeight: 700, fontSize: 14.5, cursor: 'pointer',
                borderRadius: '11px 11px 0 0', transition: 'all 0.2s',
                fontFamily: 'DM Sans, sans-serif'
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* NOTICE BAR */}
      <div className="notice-bar">
        <span style={{ fontWeight: 700, color: '#C9A84C' }}>⚠️ Verified Residents Only:</span>{' '}
        Only verified residents of Makadi Heights may post listings. Administration reserves the right to remove unverified accounts.
      </div>

      {/* MAIN CONTENT */}
      <main className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', marginBottom: 24, boxShadow: '0 2px 12px rgba(11,31,58,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', flex: 1 }}>
              {/* Phase Filter */}
              <div style={{ display: 'flex', gap: 5 }}>
                {PHASES.map(p => <button key={p} onClick={() => setFilters({ ...filters, phase: p })} style={selStyle(filters.phase, p)}>{p}</button>)}
              </div>
              <div style={{ width: 1, background: '#E2E6EA', margin: '0 4px' }} />
              {/* Type Filter */}
              <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}
                style={{ border: '1.5px solid #E2E6EA', borderRadius: 9, padding: '7px 12px', fontSize: 13, color: '#0B1F3A', background: '#fff', cursor: 'pointer', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              {/* Beds */}
              <select value={filters.beds} onChange={e => setFilters({ ...filters, beds: e.target.value })}
                style={{ border: '1.5px solid #E2E6EA', borderRadius: 9, padding: '7px 12px', fontSize: 13, color: '#0B1F3A', background: '#fff', cursor: 'pointer', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}>
                <option value="Any">Any Beds</option>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+ Beds</option>)}
              </select>
              {/* Price Range */}
              <input placeholder="Min Price" type="number" value={filters.minPrice} onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                style={{ border: '1.5px solid #E2E6EA', borderRadius: 9, padding: '7px 12px', fontSize: 13, color: '#0B1F3A', width: 110, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
              <input placeholder="Max Price" type="number" value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                style={{ border: '1.5px solid #E2E6EA', borderRadius: 9, padding: '7px 12px', fontSize: 13, color: '#0B1F3A', width: 110, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
            </div>
            {hasFilters && (
              <button onClick={resetFilters} style={{ background: '#E74C3C', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>✕ Clear</button>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 22, color: '#0B1F3A', marginBottom: 3, fontFamily: 'Playfair Display, serif' }}>
              Properties {tab === 'sale' ? 'For Sale' : 'For Rent'}
            </h2>
            {!loading && <div style={{ fontSize: 13, color: '#8A96A4' }}>{listings.length} listing{listings.length !== 1 ? 's' : ''} found</div>}
          </div>
          {!user && (
            <button onClick={() => setModal('auth')} className="btn-primary" style={{ fontSize: 13, padding: '9px 18px' }}>
              + Post a Listing
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '70px 20px', color: '#8A96A4' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🔍</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: '#0B1F3A' }}>No listings found</div>
            <div style={{ fontSize: 14 }}>Try adjusting your filters or be the first to post!</div>
            {user && <button onClick={() => setModal('post')} className="btn-accent" style={{ marginTop: 18 }}>Post a Listing</button>}
          </div>
        ) : (
          <div className="grid-3">
            {listings.map(l => (
              <PropertyCard key={l.id} property={l} isRent={tab === 'rent'}
                onClick={() => setSelected(l)} />
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ background: '#0B1F3A', color: 'rgba(255,255,255,0.55)', padding: '32px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: 16, marginBottom: 4, fontFamily: 'Playfair Display, serif' }}>🏖 Makadi Heights</div>
            <div style={{ fontSize: 12 }}>Private Marketplace · Hurghada, Red Sea · Phase 1 & Phase 2</div>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            {['Terms of Use', 'Privacy Policy', 'Contact Admin'].map(l => (
              <span key={l} style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}>{l}</span>
            ))}
          </div>
          <div style={{ fontSize: 12 }}>© {new Date().getFullYear()} Makadi Heights. All rights reserved.</div>
        </div>
      </footer>

      {/* MODALS */}
      {selected && <PropertyDetail property={selected} isRent={tab === 'rent'} onClose={() => setSelected(null)} />}
      {modal === 'auth' && <AuthModal onClose={() => setModal(null)} />}
      {modal === 'post' && <PostModal onClose={() => { setModal(null); loadListings() }} />}
      {modal === 'admin' && <AdminModal onClose={() => setModal(null)} />}
    </>
  )
}
