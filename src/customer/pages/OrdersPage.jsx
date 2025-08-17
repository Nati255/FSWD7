import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import "../../styles/Order.css";
const safeUrl = (u) => (typeof u === "string" && u.trim() ? u : null);
const API = import.meta.env?.VITE_API_BASE || "http://localhost:3001";
const fmtDate = (s) => { try { return new Date(s).toLocaleString(); } catch { return s; } };

export default function OrdersPage() {
  const { isAuth, userId, headers} = useAuth();
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    if (!userId || !headers) return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/orders/user/${userId}`, { headers });
        if (!res.ok) throw new Error(`Failed to load orders (${res.status})`);
        setOrders(await res.json());
      } catch (e) { setErr(e.message); }
    })();
  }, [ userId, headers]);

  return (
    <>
      <Navbar />
      <section className="products orders-section">
        <div className="section-head">
          <div className="section-title">
            <h2>my orders</h2>
          </div>
          <div className="section-actions">
            <button className="btn-outline" onClick={() => nav(-1)}>
              <i className="fas fa-arrow-left" /> Back
            </button>
          </div>
        </div>

        {err && <p className="error-msg center">{err}</p>}
        {!orders.length && !err && (
          <div className="empty-state">
            <i className="far fa-box" />
            <p>No orders yet.</p>
            <a href="#products" className="banner-btn">Shop now</a>
          </div>
        )}

        <div className="orders-list">
          {orders.map(o => <OrderCard key={o.id} order={o} headers={headers} />)}
        </div>
      </section>
      <Footer />
      <CartDrawer />
    </>  
  );
}

function OrderCard({ order, headers }) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(null);

  const API = import.meta.env?.VITE_API_BASE || "http://localhost:3001";
  const toggle = async () => {
    if (!open && !details) {
      const res = await fetch(`${API}/api/orders/${order.id}`, { headers });
      const data = await res.json();
      setDetails(data);
    }
    setOpen(!open);
  };

  return (
    <article className={`card order-card ${open ? "open" : ""}`}>
      <div className="order-header">
        <div className="order-meta">
          <h3 className="order-title">Order #{order.id}</h3>
          <p className="order-sub">
            {fmtDate(order.created_at)} • total: ${Number(order.total_price).toFixed(2)}
          </p>
        </div>
        <div className="order-status">
          <span className={`badge badge-${order.status || "pending"}`}>
            {order.status}
          </span>
          <button className="banner-btn btn-sm" onClick={toggle}>
            {open ? "Hide" : "Details"}
          </button>
        </div>
      </div>

      {open && details && (
        <>
          <div className="divider" />
          <div className="order-items">
            {details.items.map((it, idx) => (
              <div className="cart-item" key={idx}>
                {it.image_url?.trim()
                  ? <img src={it.image_url} alt="product" />
                  : <div style={{ width: 75, height: 75 }} />}
                <div>
                  <h4>{it.title}</h4>
                  <h5>${Number(it.price_at_order).toFixed(2)}</h5>
                </div>
                <div><p className="item-amount">x{it.amount}</p></div>
              </div>
            ))}
          </div>
        </>
      )}
    </article>
  );
}
