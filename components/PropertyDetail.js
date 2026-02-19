import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../pages/_app'

export default function PropertyDetail({ property, onClose, isRent }) {
  const { user } = useAuth()
  const [imgIdx, setImgIdx] = useState(0)
  const [reporting, setReporting] = useState(false)
  const [reported, setReported] = useState(false)

  const fmt = (n) => `EGP ${Number(n).toLocaleString()}`
  const imgs = property.images?.length ? property.images : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80']

  const waMsg = encodeURIComponent(`Hi, I saw your listing on Makadi Heights Marketplace:\n"${property.title}"\nI'm interested, please contact me.`)
  const waLink = `https://wa.me/${property.profiles?.phone?.replace(/\D/g,'') || ''}?text=${waMsg}`

  const report = async () => {
    if (!user) return alert('Please sign in to report')
    setReporting(true)
    await supabase.from('reports').insert({ listing_id: property.id, reporter_id: user.id, reason: 'User reported', created_at: new Date().toISOString() })
    setReported(true); setReporting(false)
  }

  // Track view
  const trackView = async () => {
    await supabase.from('listings').update({ views: (property.views || 0) + 1 }).eq('id', property.id)
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: 18, color: '#0B1F3A', maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.title}</h2>
          <button onClick={onClose} style={{ background: '#F0F2F5', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: 20, color: '#5A6472' }}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 26 }}>
            {/* Left - Images */}
            <div>
              <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 10, position: 'relative' }}>
                <img src={imgs[imgIdx]} alt={property.title}
                  style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80' }}
                />
                {imgs.length > 1 && <>
                  <button onClick={() => setImgIdx(i => Math.max(0, i-1))} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                  <button onClick={() => setImgIdx(i => Math.min(imgs.length-1, i+1))} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                </>}
              </div>
              {imgs.length > 1 && (
                <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }}>
                  {imgs.map((img, i) => (
                    <img key={i} src={img} onClick={() => setImgIdx(i)}
                      style={{ width: 70, height: 52, objectFit: 'cover', borderRadius: 7, cursor: 'pointer', border: i === imgIdx ? '2px solid #2E8BC0' : '2px solid transparent', flexShrink: 0 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right - Details */}
            <div>
              <div style={{ color: '#2E8BC0', fontWeight: 800, fontSize: 24, marginBottom: 6 }}>
                {fmt(property.price)}{isRent ? '/month' : ''}
              </div>
              <div style={{ display: 'flex', gap: 7, marginBottom: 14, flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: '#1a3a66' }}>{property.property_type}</span>
                <span className="badge" style={{ background: '#1a3a66' }}>{property.phase}</span>
                {property.badge && <span className="badge" style={{ background: '#C9A84C' }}>{property.badge}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 16 }}>
                {[['🛏 Bedrooms', property.bedrooms], ['🚿 Bathrooms', property.bathrooms], ['📐 Area', `${property.area} m²`], ['📍 Location', property.phase]].map(([l, v]) => (
                  <div key={l} style={{ background: '#F0F2F5', borderRadius: 9, padding: '10px 13px' }}>
                    <div style={{ fontSize: 11, color: '#8A96A4', marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0B1F3A' }}>{v}</div>
                  </div>
                ))}
              </div>

              {property.description && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#5A6472', marginBottom: 6 }}>Description</div>
                  <p style={{ fontSize: 13.5, color: '#3A4250', lineHeight: 1.7 }}>{property.description}</p>
                </div>
              )}

              <div style={{ borderTop: '1px solid #E2E6EA', paddingTop: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#8A96A4', marginBottom: 3 }}>Listed by</div>
                <div style={{ fontWeight: 700, color: '#0B1F3A', marginBottom: 3 }}>{property.profiles?.full_name || 'Resident'}</div>
                <div style={{ fontSize: 12, color: '#27AE60', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#27AE60" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
                  Verified Resident
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25D366', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'none' }}>
                  <svg width={17} height={17} viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Contact on WhatsApp
                </a>
                {reported
                  ? <div style={{ textAlign: 'center', fontSize: 13, color: '#27AE60' }}>✅ Listing reported. Thank you.</div>
                  : <button onClick={report} disabled={reporting} style={{ background: '#F0F2F5', color: '#5A6472', border: 'none', borderRadius: 9, padding: '9px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>🚩 Report Listing</button>
                }
              </div>

              <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 12, color: '#8A96A4' }}>
                <span>👁 {property.views || 0} views</span>
                <span>🆔 #{property.id?.slice(0,8)}</span>
                <span>📅 {new Date(property.created_at).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
