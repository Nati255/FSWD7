import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import '../../styles/Order.css';
const API = import.meta.env?.VITE_API_BASE || "http://localhost:3001";

export default function CheckoutPage() {
  const { isAuth, userId, headers, openAuth } = useAuth();
  const { items, total, reload } = useCart();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    if (!isAuth) {
      openAuth();
      nav("/customer", { replace: true });
    }
  }, [isAuth, openAuth, nav]);

  const [form, setForm] = useState({
    full_name: "", phone: "", city: "", address: "", notes: ""
  });
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!isAuth) { openAuth(); return; }
    if (!items.length) { setErr("Your cart is empty."); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API}/api/orders/${userId}`, { method: "POST", headers });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Order failed (${res.status})`);
      }
      await reload(); // השרת מנקה עגלה – נטען מחדש לצד לקוח
      nav("/orders", { replace: true });
    } catch (ex) {
      setErr(ex.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="products checkout-section">
      <div className="section-title"><h2>checkout</h2></div>

      <div className="checkout-grid">
        <article className="card">
          <h3 className="card-title">shipping details</h3>
          <form className="form-grid" onSubmit={placeOrder}>
            <input className="form-control" name="full_name" placeholder="Full Name" required value={form.full_name} onChange={onChange} />
            <input className="form-control" name="phone" placeholder="Phone" required value={form.phone} onChange={onChange} />
            <input className="form-control" name="city" placeholder="City" required value={form.city} onChange={onChange} />
            <input className="form-control" name="address" placeholder="Address" required value={form.address} onChange={onChange} />
            <textarea className="form-control" name="notes" placeholder="Notes (optional)" rows={3} value={form.notes} onChange={onChange} />
            <div className="form-actions">
              <button type="submit" className="banner-btn" disabled={loading || items.length === 0}>
                {loading ? "Placing…" : "Place Order"}
              </button>
              {err && <p className="error-msg" style={{ margin: 0 }}>{err}</p>}
            </div>
          </form>
        </article>

        
        <article className="card">
          <h3 className="card-title">order summary</h3>
          <div className="cart-content">
            {items.map(it => (
              <div className="cart-item" key={it.id}>
                {it.image_url?.trim()
                  ? <img src={it.image_url} alt="product" />
                  : <div style={{ width: 75, height: 75 }} />}
                <div>
                  <h4>{it.title}</h4>
                  <h5>${Number(it.price).toFixed(2)}</h5>
                </div>
                <div><p className="item-amount">x{it.amount}</p></div>
              </div>
            ))}
          </div>
          <div className="cart-footer" style={{ marginTop: ".5rem" }}>
            <h3>total : $ <span className="cart-total">{Number(total).toFixed(2)}</span></h3>
          </div>
        </article>
      </div>
    </section>
  );
}
