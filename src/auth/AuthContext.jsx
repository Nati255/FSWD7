import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import axios from "axios";
const AuthCtx = createContext(null);
const API = "http://localhost:3001";

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
      const { data } = await axios.post(
        `${API}/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const t = data?.token;
      if (!t) throw new Error("Missing token");

      const d = decodeToken(t);
      localStorage.setItem("token", t);
      localStorage.setItem("role", d.role);
      setToken(t);
      setRole(d.role);
      setUserId(d.id);

      return d.role;
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Login failed";
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async ({ full_name, username, email, password }) => {
    try {
      await axios.post(
        `${API}/api/auth/register`,
        { full_name, username, email, password, role: "customer" },
        { headers: { "Content-Type": "application/json" } }
      );
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message || "Registration failed");
    }
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
