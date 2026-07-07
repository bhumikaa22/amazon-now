import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCart, addToCart, updateCart, removeItem, clearCart } from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart]         = useState({ items: [], total: 0 });
  const [loading, setLoading]   = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], total: 0 }); return; }
    try {
      const res = await getCart();
      setCart(res.data);
    } catch { setCart({ items: [], total: 0 }); }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  async function add(productId, qty = 1) {
    setLoading(true);
    try { const res = await addToCart(productId, qty); setCart(res.data); }
    finally { setLoading(false); }
  }

  async function update(productId, qty) {
    const res = await updateCart(productId, qty);
    setCart(res.data);
  }

  async function remove(productId) {
    const res = await removeItem(productId);
    setCart(res.data);
  }

  async function clear() {
    const res = await clearCart();
    setCart(res.data);
  }

  const itemCount = cart.items.reduce((s, i) => s + i.qty, 0);
  const inCart    = (id) => cart.items.find((i) => i.id === id);

  return (
    <CartContext.Provider value={{ cart, loading, add, update, remove, clear, fetchCart, itemCount, inCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}