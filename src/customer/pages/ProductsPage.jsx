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
import axios from "axios";

const API =  "http://localhost:3001";
const toImgSrc = (u) => {
  if (!u) return "";
  const s = String(u).trim();
  if (!s || s.startsWith("/api/")) return "";
  return normalizeImageUrl(s);
};
const pickImage = (it) =>
  toImgSrc(it.image_url || it.image || it.img || it.thumbnail || it.thumb);

export default function ProductsPage() {
  const { items: cartItems, add } = useCart();
  const { isAuth, openAuth } = useAuth();

  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(8); // Show 8 items initially

  const [params, setParams] = useSearchParams();
  const q    = params.get("q")    ?? "";
  const sort = params.get("sort") ?? "price-asc";
  const min  = params.get("min")  ?? "";
  const max  = params.get("max")  ?? "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const { data: rows } = await axios.get(`${API}/api/products`);
        const mapped = rows.map(p => ({
          id: String(p.id),
          title: p.title,
          price: Number(p.price),
          stock: Number(p.stock ?? 0),
          image: normalizeImageUrl(p.image_url)
        }));
        setProducts(mapped);
      } catch (e) {
        setErr(e.response?.data?.error || e.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(8);
  }, [q, sort, min, max]);

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

  // Get items to display based on current displayCount
  const displayedProducts = filtered.slice(0, displayCount);
  const hasMoreProducts = filtered.length > displayCount;

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

  const loadMore = () => {
    setDisplayCount(prev => prev + 4); // Load 4 more items
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
            <p className="muted center">
              Showing {displayedProducts.length} of {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="products-center">
              {displayedProducts.map(prod => {
                const isInCart = inCartIds.has(prod.id);
                const isOut = (prod.stock ?? 0) <= 0;
                return (
                  <article key={prod.id} className="product">
                    <div className="img-container">
                      <img
                        src={pickImage(prod) || " "}
                        alt={prod.title || "product"}
                        width={280}
                        height={224}
                        onError={(e) => { e.currentTarget.src = " "; }}
                      />
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

            {/* Load More Button */}
            {hasMoreProducts && (
              <div className="load-more-container">
                <button className="banner-btn load-more-btn" onClick={loadMore}>
                  Load More items
                </button>
              </div>
            )}

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