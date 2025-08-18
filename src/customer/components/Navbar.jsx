import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../customer/context/CartContext";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/HomeShop.css";

const CartIcon = () => <i className="fas fa-cart-plus" />;
const BarsIcon = () => <i className="fas fa-bars" />;

export default function Navbar() {
  const nav = useNavigate();
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuth, openAuth, logout } = useAuth();

  const handleCartClick = () => (isAuth ? open() : openAuth());
  const handleSignAnchorClick = (e) => {
  if (isAuth) {
    logout();
    nav("/home", { replace: true });
  } else {
    openAuth();
  }
};

  return (
    <nav className="navbar">
      <div className="navbar-center">
        <img src="/src/images/logo.svg" alt="store logo" />
        <ul className={`nav-links ${menuOpen ? "show" : ""}`}>
  
          <li>
            <a
              href={isAuth ? "/home/customer" : "/home"}
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </a>
          </li>

          <li>
            <a
            href={isAuth ? "/home/customer/products" : "/home/products"}
            className="nav-link"
            onClick={() => setMenuOpen(false)}>
            Products
          </a>
          </li>

          <li>
            <a
              href={isAuth ? "/home/customer/orders" : "/home"}
              className="nav-link"
              onClick={(e) => {
                setMenuOpen(false);
                if (!isAuth) { e.preventDefault(); openAuth(); }
              }}
            >
              Orders
            </a>
          </li>
          <li>
            <a
              href="#cart"
              className="nav-link"
              onClick={() => {
                setMenuOpen(false);
                handleCartClick();
              }}
            >
              Cart
            </a>
          </li>
          <li>
            <a href="#sign" className="nav-link" onClick={handleSignAnchorClick}>
              {isAuth ? "Logout" : "Sign"}
            </a>
          </li>
        </ul>

        <div className="cart-btn" onClick={handleCartClick}>
          <span className="nav-icon"><CartIcon /></span>
          <div className="cart-items">{count}</div>
        </div>
      </div>
      <span className="hamburger" onClick={() => setMenuOpen((s) => !s)}><BarsIcon /></span>
    </nav>
  );
}
