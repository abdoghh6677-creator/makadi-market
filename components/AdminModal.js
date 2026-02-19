import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminModal({ onClose }) {
  const [tab, setTab] = useState('overview')
  const [pending, setPending] = useState([])
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({ total_users: 0, active_listings: 0, pending_count: 0, reports_count: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [tab])

  const loadData = async () => {
    setLoading(true)
    if (tab === 'overview' || tab === 'pending') {
      const { data } = await supabase.from('listings').select('*, profiles(full_name, email, phone)').eq('status', 'pending').order('created_at', { ascending: false })
      setPending(data || [])
    }
    if (tab === 'users') {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50)
      setUsers(data || [])
    }
    if (tab === 'reports') {
      const { data } = await supabase.from('reports').select('*, listings(title), profiles(full_name)').order('created_at', { ascending: false }).limit(30)
      setReports(data || [])
    }
    if (tab === 'overview') {
      const [{ count: uc }, { count: lc }, { count: pc }, { count: rc }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('reports').select('*', { count: 'exact', head: true })
      ])
      setStats({ total_users: uc||0, active_listings: lc||0, pending_count: pc||0, reports_count: rc||0 })
    }
    setLoading(false)
  }

  const approve = async (id) => {
    await supabase.from('listings').update({ status: 'approved' }).eq('id', id)
    setPending(p => p.filter(l => l.id !== id))
  }
  const reject = async (id) => {
    await supabase.from('listings').update({ status: 'rejected' }).eq('id', id)
    setPending(p => p.filter(l => l.id !== id))
  }
  const suspendUser = async (id) => {
    await supabase.from('profiles').update({ suspended: true }).eq('id', id)
    setUsers(u => u.map(usr => usr.id === id ? { ...usr, suspended: true } : usr))
  }

  const STAT_CARDS = [
    { label: 'Total Users', val: stats.total_users, icon: '👥', color: '#2E8BC0' },
    { label: 'Active Listings', val: stats.active_listings, icon: '🏠', color: '#27AE60' },
    { label: 'Pending Review', val: stats.pending_count, icon: '⏳', color: '#F39C12' },
    { label: 'Total Reports', val: stats.reports_count, icon: '🚩', color: '#E74C3C' },
  ]

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" style={{ maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: 18, color: '#0B1F3A' }}>🛡️ Admin Dashboard</h2>
          <button onClick={onClose} style={{ background: '#F0F2F5', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: 20, color: '#5A6472' }}>×</button>
        </div>
        <div className="modal-body">
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 7, marginBottom: 22 }}>
            {[['overview','Overview'], ['pending','Pending'], ['users','Users'], ['reports','Reports']].map(([v,l]) => (
              <button key={v} onClick={() => setTab(v)} style={{
                padding: '8px 16px', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontWeight: 600, fontSize: 13,
                background: tab === v ? '#0B1F3A' : '#F0F2F5',
                color: tab === v ? '#fff' : '#5A6472'
              }}>{l}</button>
            ))}
          </div>

          {loading && <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }}/></div>}

          {!loading && tab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 13, marginBottom: 22 }}>
                {STAT_CARDS.map(s => (
                  <div key={s.label} style={{ background: '#fff', border: '1px solid #E2E6EA', borderRadius: 13, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 26, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: '#8A96A4', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {pending.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, color: '#0B1F3A', marginBottom: 12, fontSize: 15 }}>⏳ Pending Approvals</div>
                  {pending.slice(0,3).map(l => (
                    <PendingRow key={l.id} listing={l} onApprove={() => approve(l.id)} onReject={() => reject(l.id)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && tab === 'pending' && (
            <div>
              <div style={{ color: '#5A6472', fontSize: 13, marginBottom: 14 }}>{pending.length} listings awaiting approval</div>
              {pending.length === 0 && <EmptyState msg="No pending listings 🎉" />}
              {pending.map(l => <PendingRow key={l.id} listing={l} onApprove={() => approve(l.id)} onReject={() => reject(l.id)} />)}
            </div>
          )}

          {!loading && tab === 'users' && (
            <div>
              <div style={{ background: '#F0F2F5', borderRadius: 9, padding: '9px 14px', marginBottom: 12, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, fontSize: 12, fontWeight: 700, color: '#5A6472' }}>
                <span>User</span><span>Role</span><span>Joined</span><span>Action</span>
              </div>
              {users.map(u => (
                <div key={u.id} style={{ padding: '11px 14px', borderBottom: '1px solid #F0F2F5', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0B1F3A', fontSize: 14 }}>{u.full_name || 'N/A'}</div>
                    <div style={{ fontSize: 11, color: '#8A96A4' }}>{u.email}</div>
                  </div>
                  <span className="badge" style={{ background: u.role === 'admin' ? '#E74C3C' : u.role === 'service_provider' ? '#C9A84C' : '#2E8BC0', fontSize: 10 }}>{u.role}</span>
                  <span style={{ fontSize: 12, color: '#5A6472' }}>{new Date(u.created_at).toLocaleDateString('en-GB')}</span>
                  {u.suspended
                    ? <span style={{ fontSize: 12, color: '#E74C3C', fontWeight: 600 }}>Suspended</span>
                    : <button onClick={() => suspendUser(u.id)} style={{ background: '#E74C3C', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Suspend</button>
                  }
                </div>
              ))}
            </div>
          )}

          {!loading && tab === 'reports' && (
            <div>
              {reports.length === 0 && <EmptyState msg="No reports yet" />}
              {reports.map(r => (
                <div key={r.id} style={{ background: 'rgba(231,76,60,0.05)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: '#E74C3C', fontSize: 13 }}>🚩 Report</span>
                    <span style={{ fontSize: 12, color: '#8A96A4' }}>{new Date(r.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div style={{ fontSize: 14, color: '#0B1F3A', fontWeight: 600, marginBottom: 3 }}>{r.listings?.title || 'Unknown listing'}</div>
                  <div style={{ fontSize: 13, color: '#5A6472', marginBottom: 10 }}>Reported by: {r.profiles?.full_name || 'Anonymous'} · "{r.reason}"</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => reject(r.listing_id)} style={{ background: '#E74C3C', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>Remove Listing</button>
                    <button style={{ background: '#E2E6EA', color: '#5A6472', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PendingRow({ listing, onApprove, onReject }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E6EA', borderRadius: 10, padding: '13px 16px', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 12 }}>
      {listing.images?.[0] && <img src={listing.images[0]} style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 7, flexShrink: 0 }} />}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: '#0B1F3A', fontSize: 14 }}>{listing.title}</div>
        <div style={{ fontSize: 12, color: '#8A96A4' }}>
          {listing.listing_type === 'sale' ? 'For Sale' : 'For Rent'} · {listing.phase} · By {listing.profiles?.full_name || 'Unknown'} · EGP {Number(listing.price).toLocaleString()}
        </div>
      </div>
      <button onClick={onApprove} style={{ background: '#27AE60', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Approve</button>
      <button onClick={onReject} style={{ background: '#E74C3C', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Reject</button>
    </div>
  )
}

function EmptyState({ msg }) {
  return <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8A96A4' }}>
    <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
    <div style={{ fontSize: 14, fontWeight: 600 }}>{msg}</div>
  </div>
}
