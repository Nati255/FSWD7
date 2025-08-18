import "../../styles/HomeShop.css";
import { useAuth } from "../../auth/AuthContext";
import { useCart } from "../../customer/context/CartContext";
export default function Footer() {
  const { isAuth, openAuth } = useAuth();
  const { open } = useCart();

  const homeHref = isAuth ? "/home/customer" : "/home";
  const productsHref = isAuth ? "/home/customer/products" : "/home/products";

  const handleCartClick = (e) => {
    if (isAuth) open();
    else openAuth();
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Comfy House</h3>
          <p>High quality furniture for your dream home.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href={homeHref}>Home</a></li>
            <li><a href={productsHref}>Products</a></li>
            <li><a href="#cart" onClick={handleCartClick}>Cart</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Us</h4>
          <p><i className="fas fa-envelope"></i> info@comfyhouse.com</p>
          <p><i className="fas fa-phone"></i> +972 50-123-4567</p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Comfy House. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
