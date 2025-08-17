import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './admin/pages/AdminDashboard';
import CustomerHome from './customer/pages/CustomerHome';
import AdminProducts from './admin/components/AdminProducts';
import AdminOrders from './admin/pages/AdminOrders';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { CartProvider } from "./customer/context/CartContext";
import CheckoutPage from './customer/pages/CheckoutPage';
import OrdersPage from './customer/pages/OrdersPage';

function ProtectedAdmin({ children }) {
  const { isAuth, role } = useAuth();
  if (!isAuth) return <Navigate to="/customer" replace />;
  if (role !== 'admin') return <Navigate to="/customer" replace />;
  return children;
}

function App() {
  return (
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/customer" element={<CustomerHome />} />
            <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
            <Route path="/admin/products" element={<ProtectedAdmin><AdminProducts /></ProtectedAdmin>} />
            <Route path="/admin/orders" element={<ProtectedAdmin><AdminOrders /></ProtectedAdmin>} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="*" element={<Navigate to="/customer" />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    );
}

export default App;
