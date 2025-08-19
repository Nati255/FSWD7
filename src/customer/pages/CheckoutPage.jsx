import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { normalizeImageUrl } from "../../utils/imageUrl";
import axios from "axios";
import '../../styles/checkout.css';

const API = "http://localhost:3001";
const toImgSrc = (u) => {
  if (!u) return "";
  const s = String(u).trim();
  if (!s || s.startsWith("/api/")) return "";
  return normalizeImageUrl(s);
};
const pickImage = (it) =>
  toImgSrc(it.image_url || it.image || it.img || it.thumbnail || it.thumb);

export default function CheckoutPage() {
  const { isAuth, userId, headers, openAuth } = useAuth();
  const { items, total, reload } = useCart();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [step, setStep] = useState(1); // Multi-step checkout
  const nav = useNavigate();

  useEffect(() => {
    if (!isAuth) {
      openAuth();
      nav("/customer", { replace: true });
    }
  }, [isAuth, openAuth, nav]);

  const [form, setForm] = useState({
    full_name: "", 
    email: "",
    phone: "", 
    city: "", 
    address: "", 
    postal_code: "",
    notes: "",
    payment_method: "credit_card"
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const nextStep = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (step === 1 && (!form.full_name || !form.email || !form.phone)) {
      setErr("Please fill in all required fields in Step 1");
      return;
    }
    if (step === 2 && (!form.city || !form.address)) {
      setErr("Please fill in all required fields in Step 2");
      return;
    }
    setErr("");
    setStep((s) => Math.min(s + 1, 3)); 
  };


  const prevStep = () => {
    setErr("");
    setStep(step - 1);
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!isAuth) { openAuth(); return; }
    if (!items.length) { setErr("Your cart is empty."); return; }
    setLoading(true); setErr("");

    try {
      await axios.post(
        `${API}/api/orders/${userId}`,
        {
          shipping_info: form,
          items: items,
          total: total
        },
        { headers }
      );

      await reload();
      nav("/orders", { replace: true });
    } catch (ex) {
      const message =
        ex.response?.data?.error ||
        ex.response?.data?.message ||
        ex.message ||
        "Failed to place order.";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="checkout-steps">
      <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
        <div className="step-number">1</div>
        <span>Personal Info</span>
      </div>
      <div className="step-divider"></div>
      <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
        <div className="step-number">2</div>
        <span>Shipping</span>
      </div>
      <div className="step-divider"></div>
      <div className={`step ${step >= 3 ? 'active' : ''}`}>
        <div className="step-number">3</div>
        <span>Payment</span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="checkout-step">
      <h3 className="step-title">
        <i className="fas fa-user"></i>
        Personal Information
      </h3>
      <div className="form-row">
        <input 
          className="form-control" 
          name="full_name" 
          placeholder="Full Name *" 
          required 
          value={form.full_name} 
          onChange={onChange} 
        />
        <input 
          className="form-control" 
          name="email" 
          type="email"
          placeholder="Email Address *" 
          required 
          value={form.email} 
          onChange={onChange} 
        />
      </div>
      <input 
        className="form-control" 
        name="phone" 
        placeholder="Phone Number *" 
        required 
        value={form.phone} 
        onChange={onChange} 
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="checkout-step">
      <h3 className="step-title">
        <i className="fas fa-shipping-fast"></i>
        Shipping Address
      </h3>
      <div className="form-row">
        <input 
          className="form-control" 
          name="city" 
          placeholder="City *" 
          required 
          value={form.city} 
          onChange={onChange} 
        />
        <input 
          className="form-control" 
          name="postal_code" 
          placeholder="Postal Code" 
          value={form.postal_code} 
          onChange={onChange} 
        />
      </div>
      <input 
        className="form-control" 
        name="address" 
        placeholder="Street Address *" 
        required 
        value={form.address} 
        onChange={onChange} 
      />
      <textarea 
        className="form-control" 
        name="notes" 
        placeholder="Delivery Notes (optional)" 
        rows={3} 
        value={form.notes} 
        onChange={onChange} 
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="checkout-step">
      <h3 className="step-title">
        <i className="fas fa-credit-card"></i>
        Payment Method
      </h3>
      <div className="payment-options">
        <label className={`payment-option ${form.payment_method === 'credit_card' ? 'selected' : ''}`}>
          <input 
            type="radio" 
            name="payment_method" 
            value="credit_card" 
            checked={form.payment_method === 'credit_card'}
            onChange={onChange}
          />
          <div className="payment-content">
            <i className="fas fa-credit-card"></i>
            <span>Credit Card</span>
          </div>
        </label>
        <label className={`payment-option ${form.payment_method === 'paypal' ? 'selected' : ''}`}>
          <input 
            type="radio" 
            name="payment_method" 
            value="paypal" 
            checked={form.payment_method === 'paypal'}
            onChange={onChange}
          />
          <div className="payment-content">
            <i className="fab fa-paypal"></i>
            <span>PayPal</span>
          </div>
        </label>
        <label className={`payment-option ${form.payment_method === 'cash_on_delivery' ? 'selected' : ''}`}>
          <input 
            type="radio" 
            name="payment_method" 
            value="cash_on_delivery" 
            checked={form.payment_method === 'cash_on_delivery'}
            onChange={onChange}
          />
          <div className="payment-content">
            <i className="fas fa-money-bill-wave"></i>
            <span>Cash on Delivery</span>
          </div>
        </label>
      </div>
      
      <div className="order-summary-final">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${Number(total).toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping:</span>
          <span>Free</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>${Number(total).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-subtitle">Complete your order in just a few steps</p>
      </div>

      {renderStepIndicator()}

      <div className="checkout-main">
        <div className="checkout-form-section">
          <form onSubmit={step === 3 ? placeOrder : (e) => e.preventDefault()}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {err && <div className="error-banner">{err}</div>}

            <div className="form-navigation">
              {step > 1 && (
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={prevStep}
                >
                  <i className="fas fa-arrow-left"></i>
                  Back
                </button>
              )}
              
              {step < 3 ? (
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={(e) => nextStep(e)}
                >
                  Continue
                  <i className="fas fa-arrow-right"></i>
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn-primary btn-complete" 
                  disabled={loading || items.length === 0}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      Complete Order
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="order-summary-section">
          <div className="summary-card">
            <h3 className="summary-title">
              <i className="fas fa-shopping-bag"></i>
              Order Summary
            </h3>
            
            <div className="summary-items">
              {items.map(item => (
                <div className="summary-item" key={item.id}>
                  <div className="item-image">
                    <img
                      src={pickImage(item) || " "}
                      alt={item.title || "product"}
                      width={75}
                      height={75}
                      onError={(e) => { e.currentTarget.src = " "; }}
                    />
                  </div>
                  <div className="item-details">
                    <h4>{item.title}</h4>
                    <p>Quantity: {item.amount}</p>
                  </div>
                  <div className="item-price">
                    ${(Number(item.price) * item.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-total">
              <div className="total-line">
                <span>Total ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                <span className="total-amount">${Number(total).toFixed(2)}</span>
              </div>
            </div>

            <div className="security-badges">
              <div className="badge-item">
                <i className="fas fa-shield-alt"></i>
                <span>Secure Payment</span>
              </div>
              <div className="badge-item">
                <i className="fas fa-truck"></i>
                <span>Free Delivery</span>
              </div>
              <div className="badge-item">
                <i className="fas fa-undo"></i>
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}