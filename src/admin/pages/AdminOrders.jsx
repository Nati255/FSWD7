import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import AdminSidebar from '../../admin/components/AdminSidebar';
import '../../styles/adminOrders.css'; 

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null); 
  const token = localStorage.getItem('token');

  const fetchOrders = async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    if (status) qs.set('status', status);
    const res = await fetch(`http://localhost:3001/api/orders?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredCount = useMemo(() => orders.length, [orders]);

  const handleChangeStatus = async (orderId, nextStatus) => {
    const res = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: nextStatus })
    });
    if (!res.ok) return alert('Failed to update status');
    const updated = await res.json();
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, ...updated } : o)));
  };

  const openDetails = async (orderId) => {
    const res = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    setSelected(data);
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar />

      <main className="admin-content">
        <header className="admin-header">
          <h1 className="admin-title">
            <i className="fas fa-receipt" />
            <span>Orders</span>
          </h1>
          <div className="admin-actions">
            <div className="admin-search">
              <i className="fas fa-search" />
              <input
                placeholder="Search by name or email..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              />
            </div>
            <select
              className="admin-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button className="btn primary" onClick={fetchOrders}>
              <i className="fas fa-sync-alt" /> Refresh
            </button>
          </div>
        </header>

        <section className="card">
          <div className="card-header">
            <strong>{filteredCount}</strong> orders
          </div>

          <div className="table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Total</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="t-center">Loading…</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan="8" className="t-center">No orders</td></tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.full_name}</td>
                      <td>{o.email}</td>
                      <td>${Number(o.total_price).toFixed(2)}</td>
                      <td>{o.items_count ?? '-'}</td>
                      <td>
                        <span className={`badge ${o.status}`}>
                          {o.status}
                        </span>
                      </td>
                      <td>{o.created_at ? format(new Date(o.created_at), 'dd/MM/yyyy HH:mm') : '-'}</td>
                      <td className="row-actions">
                        <select
                          className="status-inline"
                          value={o.status}
                          onChange={(e) => handleChangeStatus(o.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button className="btn ghost" onClick={() => openDetails(o.id)}>
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Order #{selected.id}</h3>
              <button className="icon-btn" onClick={() => setSelected(null)}>
                <i className="fas fa-times" />
              </button>
            </header>
            <div className="modal-body">
              <div className="order-meta">
                <div><strong>Customer:</strong> {selected.user_id}</div>
                <div><strong>Status:</strong> <span className={`badge ${selected.status}`}>{selected.status}</span></div>
                <div><strong>Total:</strong> ${Number(selected.total_price).toFixed(2)}</div>
                <div><strong>Created:</strong> {selected.created_at ? format(new Date(selected.created_at), 'dd/MM/yyyy HH:mm') : '-'}</div>
              </div>

              <h4 className="items-title">Items</h4>
              <div className="items-list">
                {selected.items?.map((it, idx) => (
                  <div key={idx} className="item-row">
                    <img src={it.image_url} alt={it.title} />
                    <div className="item-info">
                      <div className="it-title">{it.title}</div>
                      <div className="it-sub">Qty: {it.amount} · ${Number(it.price_at_order).toFixed(2)}</div>
                    </div>
                    <div className="it-total">${(Number(it.price_at_order) * it.amount).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
            <footer className="modal-footer">
              <button className="btn" onClick={() => setSelected(null)}>Close</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
