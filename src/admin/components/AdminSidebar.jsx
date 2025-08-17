import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../../auth/AuthContext";
import '../../styles/sidebar.css'; 

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    logout();   
    navigate("/customer", { replace: true });
  };

  return (
    <aside className="admin-sidebar">
      <nav className="sidebar-nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <i className="fas fa-tachometer-alt sidebar-icon" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <i className="fas fa-receipt sidebar-icon" />
          <span>Orders</span>
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <i className="fas fa-box-open sidebar-icon" />
          <span>Products</span>
        </NavLink>
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt sidebar-icon" />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;
