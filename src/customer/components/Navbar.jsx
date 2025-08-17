// src/common/components/Navbar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../customer/context/CartContext";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/HomeShop.css"; // שומר על אותם קלאסים/עיצוב

const CartIcon = () => <i className="fas fa-cart-plus" />;
const BarsIcon = () => <i className="fas fa-bars" />;

export default function Navbar() {
  const nav = useNavigate();
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuth, openAuth, logout } = useAuth();

  const handleCartClick = () => (isAuth ? open() : openAuth());
  const handleSignClick = () => (isAuth ? logout() : openAuth());

  return (
    <nav className="navbar">
      <div className="navbar-center">
        <img src="/images/logo2.jpeg" alt="store logo" />
        <ul className={`nav-links ${menuOpen ? "show" : ""}`}>
          <li><a href="/customer" className="nav-link" onClick={() => setMenuOpen(false)}>Home</a></li>
          <li><a href="#products" className="nav-link" onClick={() => setMenuOpen(false)}>Products</a></li>
          <li>
            <a
              href={isAuth ? "/orders" : "#orders"}
              className="nav-link"
              onClick={(e) => {
                setMenuOpen(false);
                if (!isAuth) {
                  e.preventDefault();
                  openAuth();
                }
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
          <li><a href="#sign" className="nav-link" onClick={handleSignClick}>{isAuth ? "Logout" : "Sign"}</a></li>
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
