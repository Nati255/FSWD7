import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import CartDrawer from "../components/CartDrawer";
import Footer from "../components/Footer";
import AuthModal from "../../auth/AuthModal";
import { useCart } from "../context/CartContext";
import { useAuth } from "../../auth/AuthContext";
import { normalizeImageUrl } from "../../utils/imageUrl";
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

function Hero() {
  const { isAuth } = useAuth();
  const productsHref = isAuth ? "/home/customer/products" : "/home/products";

  return (
    <header className="hero" id="home">
      <div className="banner">
        <h1 className="banner-title">furniture collection</h1>
        <a href={productsHref} className="banner-btn">
          shop now
        </a>
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
        image: normalizeImageUrl(p.image_url),
        stock: Number(p.stock ?? 0),
        category: p.category ?? p.category_name ?? p.cat ?? null,
      })))
      .then(setProducts);
  }, []);

  const inCartIds = useMemo(() => new Set(cartItems.map(i => String(i.id))), [cartItems]);
  const handleAdd = (id) => (isAuth ? add(id) : openAuth());

  const FEATURED_LIMIT = 4;

  const featured = useMemo(() => {
    if (!products.length) return [];

    const hasCats = products.some(p => p.category);
    if (hasCats) {
      const byCat = new Map();
      for (const p of products) {
        const key = p.category || "General";
        if (!byCat.has(key)) byCat.set(key, []);
        byCat.get(key).push(p);
      }
      const catLists = [...byCat.keys()].sort((a,b)=>a.localeCompare(b)).map(k => byCat.get(k));
      const out = [];
      
      for (let round = 0; out.length < FEATURED_LIMIT; round++) {
        let pickedInRound = 0;
        for (const list of catLists) {
          if (list[round]) { out.push(list[round]); pickedInRound++; }
          if (out.length >= FEATURED_LIMIT) break;
        }
        if (pickedInRound === 0) break; 
      }
      return out.slice(0, FEATURED_LIMIT);
    }

    return products.slice(0, FEATURED_LIMIT);
  }, [products]);

  const productsHref = isAuth ? "/home/customer/products" : "/home/products";

  return (
    <section className="products" id="products">
      <div className="section-title"><h2>featured products</h2></div>

      <div className="products-center">
        {featured.map(prod => {
          const isInCart = inCartIds.has(prod.id);
          const isOut = (prod.stock ?? 0) <= 0;
          return (
            <article key={prod.id} className="product">
              <div className="img-container">
                {safeUrl(prod.image) ? (
                  <img src={safeUrl(prod.image)} alt={prod.title} className="product-img" />
                ) : (
                  <div className="product-img" />
                )}
                <button
                  className="bag-btn"
                  disabled={isOut || isInCart}
                  onClick={() => { if (!isOut) handleAdd(prod.id); }}
                >
                  {isOut ? "Out of stock" :  (isInCart ? "In Cart" : (<><i className="fas fa-shopping-cart" /> add to cart</>))}
                </button>
              </div>
              <h3>{prod.title}</h3>
              <h4>${prod.price}</h4>
            </article>
          );
        })}
      </div>

      <div className="center" style={{ marginTop: "2rem" }}>
        <a href={productsHref} className="banner-btn">See more products</a>
      </div>
    </section>
  );
}
