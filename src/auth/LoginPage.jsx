import React, { useState } from 'react';
import axios from 'axios';
import {useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // נסה לחלץ role מה־JWT (fallback)
  const getRoleFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const r =
        payload?.role ||
        (Array.isArray(payload?.roles) ? payload.roles[0] : null) ||
        payload?.user?.role ||
        null;
      return typeof r === 'string' ? r.toLowerCase() : null;
    } catch {
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password,
      });

      const token = res.data?.token;
      if (!token) throw new Error('Missing token');

      // שמור טוקן
      localStorage.setItem('token', token);

      // קח role מהתשובה או מה־JWT
      const explicitRole = (res.data?.user?.role || res.data?.role || '').toString().toLowerCase();
      const role = explicitRole || getRoleFromToken(token) || 'customer';
      localStorage.setItem('role', role);

      // הפניה לפי role
      if(role === 'admin'){
        navigate('/admin', { replace: true });
      }
      else
        navigate('/customer', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <section className="auth-page">
      <h2>🔐 Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {error && <p className="error-msg">{error}</p>}
      </form>

      <p className="switch-auth">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </section>
  );
}

export default LoginPage;
