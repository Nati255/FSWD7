import AdminSidebar from '../components/AdminSidebar';
import '../../styles/adminDashboard.css'; 
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n || 0));

export default function AdminDashboard() {
  const [stats, setStats] = useState({ active_orders: 0, total_revenue: 0, top_products: [] });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:3001/api/admin/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      setStats(data || { active_orders: 0, total_revenue: 0, top_products: [] });
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to fetch stats');
      setStats({ active_orders: 0, total_revenue: 0, top_products: [] });
    } finally {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats();  }, []);

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <main className="admin-content">
        <header className="admin-header">
          <h1 className="admin-title">
            <i className="fas fa-tachometer-alt" />
            <span>Dashboard</span>
          </h1>
          <div className="admin-actions">
            <button className="btn" onClick={fetchStats}>
              <i className="fas fa-sync-alt" /> Refresh
            </button>
          </div>
        </header>

        <section className="cards-grid">
          <div className="card kpi">
            <div className="kpi-label">Active Orders</div>
            <div className="kpi-value">{loading ? '…' : stats.active_orders}</div>
            <div className="kpi-sub">pending + paid</div>
          </div>

          <div className="card kpi">
            <div className="kpi-label">Total Revenue</div>
            <div className="kpi-value">{loading ? '…' : currency(stats.total_revenue)}</div>
            <div className="kpi-sub">paid + shipped (all-time)</div>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <strong>Top Sellers</strong> (last 30 days)
          </div>
          <div className="top-list">
            {loading ? (
              <div className="t-center p1">Loading…</div>
            ) : (stats.top_products?.length ?? 0) === 0 ? (
              <div className="empty-state">
                <i className="fas fa-box-open"></i>
                <h3>No data</h3>
              </div>
            ) : (
              stats.top_products.map((p, idx) => (
                <div key={p.product_id} className="top-row">
                  <div className="rank">#{idx + 1}</div>
                  <div className="title">{p.title}</div>
                  <div className="qty">qty: {p.qty_sold}</div>
                  <div className="rev">{currency(p.revenue)}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}