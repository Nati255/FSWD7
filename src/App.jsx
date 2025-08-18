import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './admin/pages/AdminDashboard';
import CustomerHome from './customer/pages/CustomerHome';
import AdminProducts from './admin/pages/AdminProducts';
import AdminOrders from './admin/pages/AdminOrders';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { CartProvider } from "./customer/context/CartContext";
import CheckoutPage from './customer/pages/CheckoutPage';
import OrdersPage from './customer/pages/OrdersPage';
import ProductsPage from './customer/pages/ProductsPage';

function ProtectedAdmin({ children }) {
  const { isAuth, role } = useAuth();
  if (!isAuth) return <Navigate to="/home" replace />;
  if (role !== 'admin') return <Navigate to="/home" replace />;
  return children;
}

function ProtectedCustomer({ children }) {
  const { isAuth, role } = useAuth();
  if (!isAuth) return <Navigate to="/home" replace />;
  if (role !== 'customer') return <Navigate to="/admin" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* דף החנות הפומבי */}
          <Route path="/home" element={<CustomerHome />} />

          {/* מוצרים – פתוח */}
          <Route path="/home/products" element={<ProductsPage />} />

          {/* אזור אדמין */}
          <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
          <Route path="/admin/products" element={<ProtectedAdmin><AdminProducts /></ProtectedAdmin>} />
          <Route path="/admin/orders" element={<ProtectedAdmin><AdminOrders /></ProtectedAdmin>} />

          {/* אזור לקוח אחרי התחברות */}
          <Route path="/home/customer" element={<ProtectedCustomer><CustomerHome /></ProtectedCustomer>} />
          <Route path="/home/checkout" element={<ProtectedCustomer><CheckoutPage /></ProtectedCustomer>} />
          <Route path="/home/customer/products" element={<ProtectedCustomer><ProductsPage /></ProtectedCustomer>} />
          <Route path="/home/customer/orders" element={<ProtectedCustomer><OrdersPage /></ProtectedCustomer>} />

          {/* תאימות לאחור */}
          <Route path="/customer" element={<Navigate to="/home" replace />} />

          {/* ברירת מחדל */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
