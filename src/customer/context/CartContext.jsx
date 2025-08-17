// src/customer/context/CartContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
const CartCtx = createContext(null);
const API = import.meta.env?.VITE_API_BASE || "http://localhost:3001";

function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id ?? payload?.userId ?? null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }) {
  const { token, userId } = useAuth();
  // אל תשלח Authorization: undefined
  const headers = useMemo(() => {
    const h = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cart, setCart] = useState({ items: [], total: 0 });

  const load = useCallback(async () => {
    if (!userId) {
      setCart({ items: [], total: 0 });
      return;
    }
    const res = await fetch(`http://localhost:3001/api/cart/${userId}`, { headers }); // ← backticks!
    if (!res.ok) throw new Error(`Failed to load cart (${res.status})`);
    const data = await res.json(); // { items, total }
    setCart(data);
  }, [userId, headers]);

  useEffect(() => { load(); }, [load]);

  const add = async (productId, amount = 1) => {
    const res = await fetch(`http://localhost:3001/api/cart`, {
      method: "POST",
      headers,
      body: JSON.stringify({ productId, amount })
    });
    if (!res.ok) throw new Error(`Add failed (${res.status})`);
    const data = await res.json();
    setCart(data);
    setDrawerOpen(true);
  };

  const setAmount = async (productId, amount) => {
    const res = await fetch(`${API}/api/cart`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ userId, productId, amount })
    });
    if (!res.ok) throw new Error(`Update failed (${res.status})`);
    const data = await res.json();
    setCart(data);
  };

  const remove = async (productId) => {
    const res = await fetch(`${API}/api/cart/${userId}/${productId}`, { method: "DELETE", headers });
    if (!res.ok) throw new Error(`Remove failed (${res.status})`);
    const data = await res.json();
    setCart(data);
  };

  const clear = async () => {
    const res = await fetch(`${API}/api/cart/${userId}`, { method: "DELETE", headers });
    if (!res.ok) throw new Error(`Clear failed (${res.status})`);
    const data = await res.json();
    setCart(data);
  };

  const inc = (productId) => {
    const current = cart.items.find(i => String(i.id) === String(productId));
    const next = (current?.amount || 0) + 1;
    return setAmount(productId, next);
  };

  const dec = (productId) => {
    const current = cart.items.find(i => String(i.id) === String(productId));
    const next = Math.max(0, (current?.amount || 1) - 1);
    return setAmount(productId, next);
  };

  const value = {
    items: cart.items || [],
    total: cart.total || 0,
    count: (cart.items || []).reduce((s, it) => s + it.amount, 0),
    open: () => setDrawerOpen(true),
    close: () => setDrawerOpen(false),
    drawerOpen,
    add, inc, dec, remove, clear, reload: load
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  return useContext(CartCtx);
}
