import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../pages/_app'

export default function PropertyCard({ property, onClick, isRent }) {
  const { user } = useAuth()
  const [saved, setSaved] = useState(property.is_saved || false)
  const [saving, setSaving] = useState(false)

  const fmt = (n) => `EGP ${Number(n).toLocaleString()}`
  const badgeColor = { Featured: '#C9A84C', New: '#27AE60', 'Price Drop': '#E74C3C' }

  const toggleSave = async (e) => {
    e.stopPropagation()
    if (!user) return alert('Please sign in to save listings')
    setSaving(true)
    if (saved) {
      await supabase.from('saved_listings').delete().match({ user_id: user.id, listing_id: property.id })
    } else {
      await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: property.id, listing_type: 'property' })
    }
    setSaved(!saved)
    setSaving(false)
  }

  const imgUrl = property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80'

  return (
    <div className="card" onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Image */}
      <div style={{ position: 'relative' }}>
        <img src={imgUrl} alt={property.title}
          style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80' }}
        />
        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5 }}>
          {property.badge && (
            <span className="badge" style={{ background: badgeColor[property.badge] || '#2E8BC0' }}>{property.badge}</span>
          )}
          <span className="badge" style={{ background: '#1a3a66' }}>{property.property_type}</span>
          <span className="badge" style={{ background: '#1a3a66' }}>{property.phase}</span>
        </div>
        {/* Save Button */}
        <button onClick={toggleSave} disabled={saving} style={{
          position: 'absolute', top: 10, right: 10,
          background: saved ? '#E74C3C' : 'rgba(255,255,255,0.92)',
          border: 'none', borderRadius: '50%', width: 34, height: 34,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill={saved ? '#fff' : '#8A96A4'}>
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
        {/* Views */}
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          background: 'rgba(0,0,0,0.55)', color: '#fff',
          fontSize: 11, padding: '3px 9px', borderRadius: 20,
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {property.views || 0}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '15px 17px' }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#0B1F3A', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {property.title}
        </div>
        <div style={{ color: '#2E8BC0', fontWeight: 800, fontSize: 18, marginBottom: 9 }}>
          {fmt(property.price)}{isRent ? '/month' : ''}
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: '#5A6472', marginBottom: 11 }}>
          <span>🛏 {property.bedrooms} Beds</span>
          <span>🚿 {property.bathrooms} Baths</span>
          <span>📐 {property.area} m²</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#8A96A4' }}>📍 {property.phase}</span>
          <button onClick={e => { e.stopPropagation(); window.open(`https://wa.me/${property.profiles?.phone?.replace(/\D/g,'') || ''}?text=${encodeURIComponent('Hi, I saw your listing on Makadi Heights Marketplace: ' + property.title)}`, '_blank') }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#25D366', color: '#fff', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}
