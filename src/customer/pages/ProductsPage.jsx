import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import AuthModal from "../../auth/AuthModal";
import { useCart } from "../context/CartContext";
import { useAuth } from "../../auth/AuthContext";
import { normalizeImageUrl } from "../../utils/imageUrl";
import { useSearchParams } from "react-router-dom";
import "../../styles/HomeShop.css";
const safeUrl = (u) => (typeof u === "string" && u.trim() ? u : null);
const API = import.meta.env?.VITE_API_BASE || "http://localhost:3001";

export default function ProductsPage() {
  const { items: cartItems, add } = useCart();
  const { isAuth, openAuth } = useAuth();

  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [params, setParams] = useSearchParams();
  const q    = params.get("q")    ?? "";
  const sort = params.get("sort") ?? "price-asc";
  const min  = params.get("min")  ?? "";
  const max  = params.get("max")  ?? "";

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/products`)
      .then(r => (r.ok ? r.json() : Promise.reject(`Failed (${r.status})`)))
      .then(rows => rows.map(p => ({
        id: String(p.id),
        title: p.title,
        price: Number(p.price),
        stock: Number(p.stock ?? 0),
        image: normalizeImageUrl(p.image_url)
      })))
      .then(setProducts)
      .catch(e => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const inCartIds = useMemo(
    () => new Set(cartItems.map(i => String(i.id))),
    [cartItems]
  );

  const filtered = useMemo(() => {
    let list = products;

    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(qq));
    }
    if (min.trim() !== "") {
      const m = parseFloat(min);
      if (!Number.isNaN(m)) list = list.filter(p => p.price >= m);
    }
    if (max.trim() !== "") {
      const m = parseFloat(max);
      if (!Number.isNaN(m)) list = list.filter(p => p.price <= m);
    }

    const sorted = [...list];
    switch (sort) {
      case "price-asc":  sorted.sort((a,b) => a.price - b.price); break;
      case "price-desc": sorted.sort((a,b) => b.price - a.price); break;
      case "title-asc":  sorted.sort((a,b) => a.title.localeCompare(b.title)); break;
      case "title-desc": sorted.sort((a,b) => b.title.localeCompare(a.title)); break;
      default: break;
    }
    return sorted;
  }, [products, q, min, max, sort]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(params);
    if (val === "" || val == null) next.delete(key);
    else next.set(key, val);
    setParams(next, { replace: true });
  };

  const clearFilters = () => {
    const next = new URLSearchParams(params);
    ["q", "min", "max"].forEach(k => next.delete(k));
    next.set("sort", "price-asc");
    setParams(next, { replace: true });
  };

  const handleAdd = (id) => (isAuth ? add(id) : openAuth());

  return (
    <>
      <Navbar />

      <section className="products" id="products">
        <div className="section-head">
          <div className="section-title"><h2>products</h2></div>
          <div className="section-actions">
            {/* bar controls */}
            <div className="products-toolbar">
              <input
                type="search"
                placeholder="Search products…"
                value={q}
                onChange={(e) => setParam("q", e.target.value)}
                className="input"
                aria-label="Search"
              />
              <label className="sr-only" htmlFor="sort">Sort</label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setParam("sort", e.target.value)}
                className="input"
                aria-label="Sort"
              >
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="title-asc">Title: A → Z</option>
                <option value="title-desc">Title: Z → A</option>
              </select>

              <input
                type="number"
                inputMode="decimal"
                placeholder="Min price"
                value={min}
                onChange={(e) => setParam("min", e.target.value)}
                className="input input-num"
                aria-label="Minimum price"
                min="0"
              />
              <input
                type="number"
                inputMode="decimal"
                placeholder="Max price"
                value={max}
                onChange={(e) => setParam("max", e.target.value)}
                className="input input-num"
                aria-label="Maximum price"
                min="0"
              />

              <button className="btn-outline" onClick={clearFilters}>
                Clear
              </button>
            </div>
          </div>
        </div>

        {loading && <p className="center">Loading…</p>}
        {err && <p className="error-msg center">{err}</p>}

        {!loading && !err && (
          <>
            <p className="muted center">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
            <div className="products-center">
              {filtered.map(prod => {
                const isInCart = inCartIds.has(prod.id);
                const isOut = (prod.stock ?? 0) <= 0;
                return (
                  <article key={prod.id} className="product">
                    <div className="img-container">
                      {safeUrl(prod.image)
                        ? <img src={safeUrl(prod.image)} alt={prod.title} className="product-img" />
                        : <div className="product-img" />}
                      <button
                        className="bag-btn"
                        disabled={isOut || isInCart}
                        onClick={() => { if (!isOut) handleAdd(prod.id); }}
                        aria-label={isInCart ? "In Cart" : `Add ${prod.title} to cart`}
                      >
                        {isOut  ? "Out of stock" : (isInCart ? "In Cart" : (<><i className="fas fa-shopping-cart" /> add to cart</>))}
                      </button>
                    </div>
                    <h3>{prod.title}</h3>
                    <h4>${prod.price}</h4>
                  </article>
                );
              })}
            </div>

            {!filtered.length && (
              <div className="empty-state">
                <i className="far fa-box" />
                <p>No matching products.</p>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
      <CartDrawer />
      <AuthModal />
    </>
  );
}
