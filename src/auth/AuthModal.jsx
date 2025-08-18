import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function AuthModal() {
  const { authOpen, closeAuth, login, register } = useAuth();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  if (!authOpen) return null;

  const onLogin = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    try {
      const role = await login({ email, password });
      setLoading(false); closeAuth();
      if (role === "admin") nav("/admin", { replace: true });
      else {
        nav("/home/customer", { replace: true });
      }
    } catch(e) {
      setLoading(false); setErr(e?.message || "Login failed. Check your credentials.");
    }
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    const full_name = e.target.full_name.value.trim();
    const username  = e.target.username.value.trim();
    const email     = e.target.email.value.trim();
    const password  = e.target.password.value;
    try {
      await register({ full_name, username, email, password });
      setTab("login"); setLoading(false);
    } catch {
      setLoading(false); setErr("Registration failed. Please try again.");
    }
  };

  return (
    <div className="auth-overlay" onClick={closeAuth}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={closeAuth} aria-label="Close">×</button>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Login</button>
          <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Register</button>
        </div>

        {tab === "login" ? (
          <form className="auth-form" onSubmit={onLogin}>
            <input id="email" name="email" type="email" placeholder="Email" autoComplete="email" required />
            <input id="password" name="password" type="password" placeholder="Password" autoComplete="current-password" required />
            <button type="submit" className="banner-btn" disabled={loading}>{loading ? "Logging in…" : "Login"}</button>
            {err && <p className="error-msg">{err}</p>}
          </form>
        ) : (
          <form className="auth-form" onSubmit={onRegister}>
            <input id="full_name" name="full_name" type="text" placeholder="Full Name" autoComplete="name" required />
            <input id="username"  name="username"  type="text" placeholder="Username" autoComplete="username" required />
            <input id="email"     name="email"     type="email" placeholder="Email" autoComplete="email" required />
            <input id="password"  name="password"  type="password" placeholder="Password" autoComplete="new-password" required />
            <button type="submit" className="banner-btn" disabled={loading}>{loading ? "Registering…" : "Register"}</button>
            {err && <p className="error-msg">{err}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
