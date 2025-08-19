import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import axios from "axios";


const CartCtx = createContext(null);
const API = "http://localhost:3001";

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
    try {
      const { data } = await axios.get(`http://localhost:3001/api/cart/${userId}`, { headers });
      // { items, total }
      setCart(data);
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message || "Failed to load cart");
    }
  }, [userId, headers]);

  useEffect(() => { load(); }, [load]);

  const add = async (productId, amount = 1) => {
    try {
      const { data } = await axios.post(
        `http://localhost:3001/api/cart`,
        { productId, amount },
        { headers }
      );
      setCart(data);
      setDrawerOpen(true);
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message || "Add failed");
    }
  };

  const setAmount = async (productId, amount) => {
    try {
      const { data } = await axios.put(
        `${API}/api/cart`,
        { userId, productId, amount },
        { headers }
      );
      setCart(data);
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message || "Update failed");
    }
  };

  const remove = async (productId) => {
    try {
      const { data } = await axios.delete(`${API}/api/cart/${userId}/${productId}`, { headers });
      setCart(data);
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message || "Remove failed");
    }
  };

  const clear = async () => {
    try {
      const { data } = await axios.delete(`${API}/api/cart/${userId}`, { headers });
      setCart(data);
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message || "Clear failed");
    }
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
