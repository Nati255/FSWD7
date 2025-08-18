import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const AuthCtx = createContext(null);
const API = import.meta.env?.VITE_API_BASE || "http://localhost:3001";

function decodeToken(token) {
  try {
    const p = JSON.parse(atob(token.split(".")[1]));
    const id = p?.id ?? p?.userId ?? p?.uid ?? null;
    const roleRaw = p?.role ?? (Array.isArray(p?.roles) ? p.roles[0] : null);
    const role = roleRaw ? String(roleRaw).toLowerCase() : "customer";
    return { id: id == null ? null : Number(id), role };
  } catch {
    return { id: null, role: "customer" };
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [role, setRole] = useState(() => localStorage.getItem("role") || (token ? decodeToken(token).role : "customer"));
  const [userId, setUserId] = useState(() => (token ? decodeToken(token).id : null));
  const [authOpen, setAuthOpen] = useState(false);

  const isAuth = !!token;
  const headers = useMemo(() => {
    const h = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const openAuth = () => setAuthOpen(true);
  const closeAuth = () => setAuthOpen(false);

  const login = useCallback(async ({ email, password }) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        // מנסים להוציא הודעה שימושית מהשרת; אם אין – נשתמש בסטטוס
        let message = `Login failed (${res.status})`;
        try {
          const err = await res.json();
          if (err?.error) message = err.error;
          else if (err?.message) message = err.message;
        } catch {}
        throw new Error(message);
      }

      const data = await res.json();
      const t = data?.token;
      if (!t) throw new Error("Missing token");

      const d = decodeToken(t);
      localStorage.setItem("token", t);
      localStorage.setItem("role", d.role);
      setToken(t); setRole(d.role); setUserId(d.id);
      return d.role;
    } catch (e) {
      throw new Error(e?.message || "Login failed");
    }
  }, []);

  const register = useCallback(async ({ full_name, username, email, password }) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, username, email, password, role: "customer" })
    });
    if (!res.ok) throw new Error("Registration failed");
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(""); setRole("customer"); setUserId(null);
  }, []);

  const value = { isAuth, token, role, userId, headers, login, register, logout, authOpen, openAuth, closeAuth };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() { return useContext(AuthCtx); }
