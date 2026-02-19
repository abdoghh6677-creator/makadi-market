import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../pages/_app'

export default function PostModal({ onClose }) {
  const { user, profile } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [f, setF] = useState({
    title: '', price: '', phase: 'Phase 1', property_type: 'Villa',
    bedrooms: '', bathrooms: '', area: '', description: '',
    listing_type: 'sale', badge: ''
  })

  const handleImages = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 10) return setError('Max 10 images allowed')
    setUploading(true)
    const urls = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `listings/${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from('listing-images').upload(path, file)
      if (!upErr) {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    setImages([...images, ...urls])
    setUploading(false)
  }

  const removeImage = (idx) => setImages(images.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (images.length === 0) return setError('Please upload at least one image')
    setLoading(true); setError('')
    const { error } = await supabase.from('listings').insert({
      ...f,
      price: Number(f.price),
      bedrooms: Number(f.bedrooms),
      bathrooms: Number(f.bathrooms),
      area: Number(f.area),
      images,
      user_id: user.id,
      status: 'pending',
      views: 0,
      created_at: new Date().toISOString()
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true); setLoading(false)
  }

  if (success) return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: '40px 26px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: '#0B1F3A', marginBottom: 10, fontSize: 22 }}>Listing Submitted!</h2>
          <p style={{ color: '#5A6472', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Your listing is pending admin approval. You will be notified once it goes live on the marketplace.
          </p>
          <button onClick={onClose} className="btn-primary">Done</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: 19, color: '#0B1F3A' }}>Post New Property Listing</h2>
          <button onClick={onClose} style={{ background: '#F0F2F5', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: 20, color: '#5A6472' }}>×</button>
        </div>
        <div className="modal-body">
          {/* Listing Type Toggle */}
          <div className="tab-bar" style={{ marginBottom: 20 }}>
            {[['sale', '🏠 For Sale'], ['rent', '🔑 For Rent']].map(([val, label]) => (
              <button key={val} className={f.listing_type === val ? 'active' : ''} onClick={() => setF({ ...f, listing_type: val })}>{label}</button>
            ))}
          </div>

          {error && <div style={{ background: '#FFF0EE', border: '1px solid #E74C3C', borderRadius: 8, padding: '10px 14px', color: '#E74C3C', fontSize: 13, marginBottom: 14 }}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <input className="input" placeholder="Property Title (e.g. Sea View Villa — Type A)" required value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input className="input" placeholder={`Price (EGP)${f.listing_type === 'rent' ? ' /month' : ''}`} type="number" required value={f.price} onChange={e => setF({ ...f, price: e.target.value })} />
              <select className="input" value={f.property_type} onChange={e => setF({ ...f, property_type: e.target.value })}>
                {['Villa', 'Twin House', 'Chalet', 'Studio', 'Penthouse', 'Apartment'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <select className="input" value={f.phase} onChange={e => setF({ ...f, phase: e.target.value })}>
                <option value="Phase 1">Phase 1</option>
                <option value="Phase 2">Phase 2</option>
              </select>
              <select className="input" value={f.badge} onChange={e => setF({ ...f, badge: e.target.value })}>
                <option value="">No Badge</option>
                <option value="Featured">Featured</option>
                <option value="New">New</option>
                <option value="Price Drop">Price Drop</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <input className="input" placeholder="Bedrooms" type="number" min="0" required value={f.bedrooms} onChange={e => setF({ ...f, bedrooms: e.target.value })} />
              <input className="input" placeholder="Bathrooms" type="number" min="0" required value={f.bathrooms} onChange={e => setF({ ...f, bathrooms: e.target.value })} />
              <input className="input" placeholder="Area (m²)" type="number" min="0" required value={f.area} onChange={e => setF({ ...f, area: e.target.value })} />
            </div>

            <textarea className="input" placeholder="Description — highlight key features, views, finishing..." rows={4} required value={f.description} onChange={e => setF({ ...f, description: e.target.value })} style={{ resize: 'vertical' }} />

            {/* Image Upload */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5A6472', marginBottom: 8 }}>
                📷 Property Photos ({images.length}/10)
              </label>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed #E2E6EA', borderRadius: 12, padding: '24px 16px',
                cursor: 'pointer', color: '#8A96A4', fontSize: 14,
                background: uploading ? '#F0F2F5' : '#FAFBFC',
                transition: 'all 0.2s'
              }}>
                <span style={{ fontSize: 28, marginBottom: 6 }}>📸</span>
                {uploading ? 'Uploading...' : 'Click to upload photos'}
                <span style={{ fontSize: 12, marginTop: 4 }}>JPG, PNG up to 10MB each</span>
                <input type="file" multiple accept="image/*" onChange={handleImages} style={{ display: 'none' }} disabled={uploading} />
              </label>
              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 10 }}>
                  {images.map((url, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={url} style={{ width: '100%', height: 72, objectFit: 'cover', borderRadius: 8 }} />
                      <button type="button" onClick={() => removeImage(i)} style={{
                        position: 'absolute', top: 3, right: 3, background: '#E74C3C',
                        color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20,
                        cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: 'rgba(249,200,18,0.1)', border: '1px solid rgba(243,156,18,0.4)', borderRadius: 9, padding: '10px 14px', fontSize: 12.5, color: '#5A6472', lineHeight: 1.6 }}>
              ⚠️ Your listing will be reviewed by Makadi Heights admin before appearing on the marketplace. Only verified residents may post.
            </div>

            <button type="submit" className="btn-primary" disabled={loading || uploading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
