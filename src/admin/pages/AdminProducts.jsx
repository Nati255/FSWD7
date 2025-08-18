import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { normalizeImageUrl } from "../../utils/imageUrl";
import '../../styles/adminProduct.css'; 
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/products';
export default function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [query, setQuery]       = useState('');

  const [modal, setModal] = useState({ open: false, mode: 'create', id: null }); 
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    category: ''
  });

  const token = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;
  
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get(API_BASE, { headers: { Accept: 'application/json' } });
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      sonsole.error(e);
      const msg = (e.response && (e.response.data?.error || e.response.statusText)) || e.message || 'שגיאה בטעינת המוצרים';
      setError(`GET ${API_BASE} failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      [p.title, p.category, p.description]
        .filter(Boolean)
        .some(s => String(s).toLowerCase().includes(q))
    );
  }, [products, query]);

  const openAdd = () => {
    setDraft({ title:'', description:'', price:'', stock:'', image_url:'', category:'' });
    setModal({ open: true, mode: 'create', id: null });
  };

  const openEdit = (p) => {
    setDraft({
      title: String(p.title ?? ''),
      description: String(p.description ?? ''),
      price: p.price != null ? String(p.price) : '',
      stock: p.stock != null ? String(p.stock) : '',
      image_url: String(p.image_url ?? ''),
      category: String(p.category ?? '')
    });
    setModal({ open: true, mode: 'edit', id: p.id });
  };

  const closeModal = () => {
    if (saving) return;
    setModal({ open: false, mode: 'create', id: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const body = {
        title: draft.title?.trim(),
        description: draft.description?.trim() || '',
        price: Number(draft.price),
        stock: Number(draft.stock),
        image_url: draft.image_url?.trim() || '',
        category: draft.category?.trim() || ''
      };
      if (!body.title || !body.price || body.stock == null || Number.isNaN(body.price) || Number.isNaN(body.stock)) {
        throw new Error('שדות חובה: title, price, stock');
      }

      if (modal.mode === 'create') {
        const { data: created } = await axios.post(API_BASE, body, { headers: authHeaders });
        setProducts(prev => [created, ...prev]);
      } else {
        const { data: updated } = await axios.put(`${API_BASE}/${modal.id}`, body, { headers: authHeaders });
        setProducts(prev => prev.map(p => (p.id === modal.id ? updated : p)));
      }

      closeModal();
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login', { replace: true });
        return;
      }
      alert(e.response?.data?.error || e.message || 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };
  const deleteProduct = async (id) => {
    if (!window.confirm(`למחוק מוצר ${id}?`)) return;
    try {
      await axios.delete(`${API_BASE}/${id}`, { headers: authHeaders });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login', { replace: true });
        return;
      }
      alert(e.response?.data?.error || e.message || 'שגיאה במחיקה');
    }
  };

  function toImgSrc(u) {
  if (!u) return "";
  const s = String(u).trim();
  if (!s || s.startsWith("/api/")) return "";     // לא מנסים לטעון API בתור תמונה
  return normalizeImageUrl(s);
}

  const Img = ({ src, alt }) => (
    <img
      src={toImgSrc(src) || " "}
      alt={alt || 'product'}
      className="admin-prod-thumb"
      onError={(ev) => { ev.currentTarget.src = " "; }}
    />
  );

  const [uploading, setUploading] = useState(false);
  const API_ROOT = "http://localhost:3001";
  async function onUploadImage(file) {
  if (!file) return;
  try {
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);

    const token = localStorage.getItem('token');
    const res = await fetch(`${API_ROOT}/api/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: fd, // שים לב: לא מגדירים Content-Type ידנית
    });

    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
    const data = await res.json();

    // ממלאים את שדה ה-URL בטופס אוטומטית
    setDraft((d) => ({ ...d, image_url: data.url }));
  } catch (err) {
    alert(err.message || 'Upload failed');
  } finally {
    setUploading(false);
  }
}
  return (
    <div className="admin-wrapper">
      <AdminSidebar />

      <main className="admin-content">
        <header className="admin-header">
          <h1 className="admin-title">
            <i className="fas fa-box-open" /> Products
          </h1>

          <div className="admin-actions">
            <div className="admin-search">
              <i className="fas fa-search" />
              <input
                type="text"
                placeholder="חיפוש לפי שם/קטגוריה/תיאור…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={openAdd}>
              <i className="fas fa-plus" /> Add Product
            </button>
          </div>
        </header>

        {error && <div className="admin-alert error">{error}</div>}

        <section className="admin-card">
          {loading ? (
            <div className="skeleton skeleton-table">טוען מוצרים…</div>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th className="num">Price</th>
                    <th className="num">Stock</th>
                    <th>Description</th>
                    <th className="actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td><Img src={p.image_url} alt={p.title} /></td>
                      <td><span className="cell-strong">{p.title}</span></td>
                      <td>{p.category || '—'}</td>
                      <td className="num">{`$${Number(p.price).toFixed(2)}`}</td>
                      <td className="num">{p.stock}</td>
                      <td className="desc-cell">
                        <span title={p.description || ''}>
                          {(p.description && p.description.length > 80)
                            ? p.description.slice(0, 80) + '…'
                            : (p.description || '—')}
                        </span>
                      </td>
                      <td className="actions">
                        <button className="btn-ghost" onClick={() => openEdit(p)}>
                          <i className="fas fa-edit" /> Edit
                        </button>
                        <button className="btn-danger" onClick={() => deleteProduct(p.id)}>
                          <i className="fas fa-trash" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!filtered.length && (
                    <tr>
                      <td colSpan={8} className="empty-cell">
                        לא נמצאו מוצרים תואמים
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {modal.open && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <header className="modal-header">
                <h3>
                  {modal.mode === 'create' ? (
                    <> <i className="fas fa-plus" /> New Product</>
                  ) : (
                    <> <i className="fas fa-edit" /> Edit Product #{modal.id}</>
                  )}
                </h3>
                <button className="icon-btn" onClick={closeModal}>
                  <i className="fas fa-times" />
                </button>
              </header>

              <form className="form-grid" onSubmit={handleSubmit}>
                <label>
                  <span>Title *</span>
                  <input
                    type="text"
                    value={draft.title ?? ''}
                    onChange={(e) => setDraft(d => ({ ...d, title: e.target.value }))}
                    required
                  />
                </label>

                <label>
                  <span>Category</span>
                  <input
                    type="text"
                    value={draft.category ?? ''}
                    onChange={(e) => setDraft(d => ({ ...d, category: e.target.value }))}
                  />
                </label>

                <label>
                  <span>Price *</span>
                  <input
                    type="number"
                    step="0.01"
                    value={draft.price ?? ''}
                    onChange={(e) => setDraft(d => ({ ...d, price: e.target.value }))}
                    required
                  />
                </label>

                <label>
                  <span>Stock *</span>
                  <input
                    type="number"
                    step="1"
                    value={draft.stock ?? ''}
                    onChange={(e) => setDraft(d => ({ ...d, stock: e.target.value }))}
                    required
                  />
                </label>

                <label className="full">
                  <span>Image URL</span>
                  <input
                    type="text"
                    value={draft.image_url ?? ''}
                    onChange={(e) => setDraft(d => ({ ...d, image_url: e.target.value }))}
                  />
                </label>
                <label className="full">
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onUploadImage(e.target.files?.[0])}
                    disabled={uploading}
                  />
                  {uploading && <small className="muted">Uploading…</small>}
                </label>
                <label className="full">
                  <span>Description</span>
                  <textarea
                    rows={3}
                    value={draft.description ?? ''}
                    onChange={(e) => setDraft(d => ({ ...d, description: e.target.value }))}
                  />
                </label>

                <footer className="modal-footer">
                  <button
                    type="button"
                    className="btn-ghost"
                    disabled={saving}
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? (
                      <i className="fas fa-circle-notch fa-spin" />
                    ) : (
                      <i className="fas fa-save" />
                    )}
                    <span>{modal.mode === 'create' ? 'Create' : 'Update'}</span>
                  </button>
                </footer>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
