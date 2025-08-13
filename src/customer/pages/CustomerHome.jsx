// src/customer/pages/CustomerHome.jsx
import React, { useEffect, useState,useMemo } from "react";
import { useCart } from "../context/CartContext";

// חשוב: וודא שהקובץ styles.css נגיש ב-/styles.css (למשל public/styles.css)
import '../../styles/HomeShop.css';
// למעלה בקובץ CustomerHome.jsx (או בקומפוננטות)
const safeUrl = (u) => (typeof u === "string" && u.trim() ? u : null);

// אייקונים של FontAwesome (אפשר גם להטמיע בקובץ index.html הראשי של ה-React-App)
const CartIcon = () => <i className="fas fa-cart-plus" />;
const BarsIcon = () => <i className="fas fa-bars" />;
const CloseIcon = () => <i className="fas fa-window-close" />;
const UpIcon = () => <i className="fas fa-chevron-up" />;
const DownIcon = () => <i className="fas fa-chevron-down" />;

export default function CustomerHome() {
  return (
    <>
      <Navbar />
      <Hero />
      <ProductsSection />
      <CartDrawer />
    </>
  );
}

function Navbar() {
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-center">
        <img src="/images/logo2.jpeg" alt="store logo" />
        <ul className={`nav-links ${menuOpen ? "show" : ""}`}>
          <li><a href="#home" className="nav-link" onClick={() => setMenuOpen(false)}>Home</a></li>
          <li><a href="#products" className="nav-link" onClick={() => setMenuOpen(false)}>Products</a></li>
          <li><a href="#cart" className="nav-link" onClick={() => { setMenuOpen(false); open(); }}>Cart</a></li>
        </ul>
        <div className="cart-btn" onClick={open}>
          <span className="nav-icon"><CartIcon /></span>
          <div className="cart-items">{count}</div>
        </div>
      </div>
      <span className="hamburger" onClick={() => setMenuOpen(s => !s)}><BarsIcon /></span>
    </nav>
  );
}

function Hero() {
  return (
    <header className="hero" id="home">
      <div className="banner">
        <h1 className="banner-title">furniture collection</h1>
        <button className="banner-btn" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>
          shop now
        </button>
      </div>
    </header>
  );
}

function ProductsSection() {
  const { items: cartItems, add } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/products") // או /api/products עם proxy
      .then(r => r.json())
      .then(rows => rows.map(p => ({
        id: String(p.id),
        title: p.title,
        price: Number(p.price),
        image: p.image_url
      })))
      .then(setProducts);
  }, []);

  const inCartIds = useMemo(() => new Set(cartItems.map(i => String(i.id))), [cartItems]);

  return (
    <section className="products" id="products">
      <div className="section-title"><h2>our products</h2></div>
      <div className="products-center">
        {products.map(prod => {
          const isInCart = inCartIds.has(prod.id);
          return (
            <article key={prod.id} className="product">
              <div className="img-container">
                {safeUrl(prod.image)? <img src={safeUrl(prod.image)} alt="product" className="product-img" />
                : <div className="product-img" /> /* פלייסהולדר בגובה נכון */}

                <button
                  className="bag-btn"
                  disabled={isInCart}
                  onClick={() => add(prod.id)}
                >
                  {isInCart ? "In Cart" : <><i className="fas fa-shopping-cart" /> add to cart</>}
                </button>
              </div>
              <h3>{prod.title}</h3>
              <h4>${prod.price}</h4>
            </article>
          );
        })}
      </div>
    </section>
  );
}
function CartDrawer() {
  const { drawerOpen, close, items, total, inc, dec, remove, clear } = useCart();

  return (
    <div className={`cart-overlay ${drawerOpen ? "transparentBcg" : ""}`}>
      <div className={`cart ${drawerOpen ? "showCart" : ""}`}>
        <span className="close-cart" onClick={close}><CloseIcon /></span>
        <h2>your cart</h2>
        <div className="cart-content">
          {items.map(it => (
            <div className="cart-item" key={it.id}>
              {safeUrl(it.image_url)  ? <img src={safeUrl(it.image_url)} alt="product" />
                : <div style={{ width: 75, height: 75 }} /> }
              <div>
                <h4>{it.title}</h4>
                <h5>${Number(it.price).toFixed(2)}</h5>
                <span className="remove-item" onClick={() => remove(it.id)}>remove</span>
              </div>
              <div>
                <span onClick={() => inc(it.id)}><UpIcon /></span>
                <p className="item-amount">{it.amount}</p>
                <span onClick={() => dec(it.id)}><DownIcon /></span>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-footer">
          <h3>your total : $ <span className="cart-total">{total.toFixed(2)}</span></h3>
          <button className="clear-cart banner-btn" onClick={clear}>clear cart</button>
        </div>
      </div>
    </div>
  );
}
