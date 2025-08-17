import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import CartDrawer from "../components/CartDrawer";
import Footer from "../components/Footer";
import AuthModal from "../../auth/AuthModal";
import { useCart } from "../context/CartContext";
import { useAuth } from "../../auth/AuthContext";

const safeUrl = (u) => (typeof u === "string" && u.trim() ? u : null);
import "../../styles/HomeShop.css";

export default function CustomerHome() {
  return (
    <>
      <Navbar />
      <Hero />
      <ProductsSection />
      <Footer />
      <CartDrawer />
      <AuthModal />
    </>
  );
}

/** ---- Local-only components for this page ---- */
function Hero() {
  return (
    <header className="hero" id="home">
      <div className="banner">
        <h1 className="banner-title">furniture collection</h1>
        <button
          className="banner-btn"
          onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
        >
          shop now
        </button>
      </div>
    </header>
  );
}

function ProductsSection() {
  const { items: cartItems, add } = useCart();
  const { isAuth, openAuth } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/products")
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
  const handleAdd = (id) => (isAuth ? add(id) : openAuth());

  return (
    <section className="products" id="products">
      <div className="section-title"><h2>our products</h2></div>
      <div className="products-center">
        {products.map(prod => {
          const isInCart = inCartIds.has(prod.id);
          return (
            <article key={prod.id} className="product">
              <div className="img-container">
                {safeUrl(prod.image) ? (
                  <img src={safeUrl(prod.image)} alt="product" className="product-img" />
                ) : (
                  <div className="product-img" />
                )}
                <button
                  className="bag-btn"
                  disabled={isInCart}
                  onClick={() => handleAdd(prod.id)}
                >
                  {isInCart ? "In Cart" : (<><i className="fas fa-shopping-cart" /> add to cart</>)}
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
