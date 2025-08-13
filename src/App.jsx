import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import AdminDashboard from './admin/pages/AdminDashboard';
import CustomerHome from './customer/pages/CustomerHome';
import AdminProducts from './admin/components/AdminProducts';
import AdminOrders from './admin/pages/AdminOrders';
import { CartProvider } from "./customer/context/CartContext";
function App() {
  const token = localStorage.getItem('token');

  return (
    
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/admin"
          element={
            token ? <AdminDashboard /> : <Navigate to="/login" replace />
          }
        />
        
        <Route
        path="/customer"
        element={
          token ? (
            <CartProvider>
              <CustomerHome />
            </CartProvider>
          ) : (
            <Navigate to="/login" replace />
          )
        }/>
        <Route path="/admin/products" element={<AdminProducts />} /> 
        <Route path="/admin/orders" element={<AdminOrders />} /> 
        <Route path="*" element={<Navigate to="/login" />} />
        
      </Routes>
    
  );
}

export default App;
