import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import { normalizeImageUrl } from "../../utils/imageUrl";
import "../../styles/Order.css";
import axios from "axios";

const API = "http://localhost:3001";
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
        const { data } = await axios.get(`${API}/api/orders/user/${userId}`, { headers });
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.response?.data?.error || e.message || "Failed to load orders");
      }
    })();
  }, [userId, headers]);

  return (
    <>
      <Navbar />
      <section className="products orders-section">
        <div className="section-head">
          <div className="section-title">
            <h2>my orders</h2>
          </div>
        </div>

        {err && <p className="error-msg center">{err}</p>}
        {!orders.length && !err && (
          <div className="empty-state">
            <i className="far fa-box" />
            <p>No orders yet.</p>
            <a href="/home/customer/products" className="banner-btn">Shop now</a>
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


  const toImgSrc = (u) => {
    if (!u) return "";
    const s = String(u).trim();
    if (!s || s.startsWith("/api/")) return "";
    return normalizeImageUrl(s);
  };

  const pickImage = (it) =>
    toImgSrc(it.image_url || it.image || it.img || it.thumbnail || it.thumb);

  const toggle = async () => {
    if (!open && !details) {
      try {
        const { data } = await axios.get(`${API}/api/orders/${order.id}`, { headers });
        setDetails(data);
      } catch (e) {
        // נשמור על אותו UX: אם נכשל, נציג כרטיסה ריקה
        setDetails({ items: [] });
      }
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
                <img
                  src={pickImage(it) || " "}
                  alt={it.title || "product"}
                  width={75}
                  height={75}
                  onError={(e) => { e.currentTarget.src = " "; }}
                />
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
