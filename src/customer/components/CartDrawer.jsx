import { useNavigate } from "react-router-dom";
import { useCart } from "../../customer/context/CartContext";
import { useAuth } from "../../auth/AuthContext";
import { normalizeImageUrl } from "../../utils/imageUrl";
import "../../styles/HomeShop.css";

const CloseIcon = () => <i className="fas fa-window-close" />;
const UpIcon = () => <i className="fas fa-chevron-up" />;
const DownIcon = () => <i className="fas fa-chevron-down" />;
const toImgSrc = (u) => {
  if (!u) return "";
  const s = String(u).trim();
  if (!s || s.startsWith("/api/")) return "";
  return normalizeImageUrl(s);
};
const pickImage = (it) =>
  toImgSrc(it.image_url || it.image || it.img || it.thumbnail || it.thumb);
export default function CartDrawer() {
  const { drawerOpen, close, items, total, inc, dec, remove, clear } = useCart();
  const { isAuth, openAuth } = useAuth();
  const nav = useNavigate();

  return (
    <div className={`cart-overlay ${drawerOpen ? "transparentBcg" : ""}`}>
      <div className={`cart ${drawerOpen ? "showCart" : ""}`}>
        <span className="close-cart" onClick={close}><CloseIcon /></span>
        <h2>your cart</h2>
        <div className="cart-content">
          {items.map((it) => (
            <div className="cart-item" key={it.id}>
              <img
                src={pickImage(it) || " "}
                alt={it.title || "product"}
                width={75}
                height={75}
                onError={(e) => { e.currentTarget.src = " "; }}
              />
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
          <div className="btn-row">
            <button className="clear-cart banner-btn" onClick={clear}>clear cart</button>
            <button
              className="banner-btn"
              onClick={() => (!items.length ? null : (isAuth ? nav("/home/checkout") : openAuth()))}
              disabled={items.length === 0}
            >
              checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
