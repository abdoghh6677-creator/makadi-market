import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', role: 'resident' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password })
        if (error) throw error
        onClose()
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: f.email,
          password: f.password,
          options: {
            data: { full_name: f.name, phone: f.phone, role: f.role }
          }
        })
        if (error) throw error
        // Create profile
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: f.name,
            phone: f.phone,
            role: f.role,
            email: f.email,
            verified: false,
            created_at: new Date().toISOString()
          })
        }
        setSuccess('Account created! Please check your email to verify your account.')
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const inputStyle = {
    border: '1.5px solid #E2E6EA', borderRadius: 10, padding: '11px 14px',
    fontSize: 14, width: '100%', color: '#0B1F3A', background: '#fff',
    fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: 20, color: '#0B1F3A' }}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <button onClick={onClose} style={{ background: '#F0F2F5', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: 20, color: '#5A6472', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div className="modal-body">
          {/* Notice */}
          <div style={{ background: '#0B1F3A', borderRadius: 10, padding: '11px 15px', marginBottom: 20, fontSize: 12.5, color: '#A8C4E0', lineHeight: 1.6 }}>
            <strong style={{ color: '#C9A84C' }}>⚠️ Residents Only:</strong> Only verified residents of Makadi Heights may post listings. Admin approval required.
          </div>

          {/* Mode Toggle */}
          <div className="tab-bar" style={{ marginBottom: 22 }}>
            <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); setSuccess('') }}>Sign In</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); setSuccess('') }}>Register</button>
          </div>

          {error && <div style={{ background: '#FFF0EE', border: '1px solid #E74C3C', borderRadius: 8, padding: '10px 14px', color: '#E74C3C', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}
          {success && <div style={{ background: '#F0FFF6', border: '1px solid #27AE60', borderRadius: 8, padding: '10px 14px', color: '#27AE60', fontSize: 13, marginBottom: 16 }}>✅ {success}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {mode === 'register' && (
              <>
                <input className="input" placeholder="Full Name" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
                <input className="input" placeholder="Phone Number (+20...)" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
                <select className="input" value={f.role} onChange={e => setF({ ...f, role: e.target.value })}>
                  <option value="resident">Resident</option>
                  <option value="service_provider">Service Provider</option>
                </select>
              </>
            )}
            <input className="input" placeholder="Email Address" type="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
            <input className="input" placeholder="Password (min 8 characters)" type="password" required minLength={8} value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />

            {mode === 'login' && (
              <div style={{ textAlign: 'right', fontSize: 13, color: '#2E8BC0', cursor: 'pointer' }}>Forgot Password?</div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
