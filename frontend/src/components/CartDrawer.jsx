import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { checkout } from "../api/orders";

export default function CartDrawer({ onClose }) {
  const { cart, update, remove, clear, fetchCart } = useCart();
  const { showToast } = useToast();
  const [confirmed, setConfirmed] = useState(null);
  const [loading, setLoading]     = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await checkout();
      setConfirmed(res.data);
      await fetchCart();
    } catch (err) {
      showToast(err.response?.data?.error || "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    const eta = new Date(confirmed.eta).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return (
      <>
        <div className="drawer-overlay" onClick={onClose} />
        <div className="drawer">
          <div className="drawer-head">
            <div className="drawer-title">Order Confirmed!</div>
            <button className="drawer-close" onClick={onClose}>✕</button>
          </div>
          <div className="drawer-body">
            <div className="confirm">
              <div className="conf-ring">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 style={{ marginBottom: 8 }}>Order Placed!</h2>
              <p style={{ color: "var(--t2)", marginBottom: 20, fontSize: 14 }}>
                Your items are being picked and packed.
              </p>
              <div className="conf-eta">⚡ Arrives by {eta}</div>
              <div className="conf-items">
                {confirmed.items.map((i) => (
                  <div className="conf-row" key={i.id}>
                    <span>{i.icon} {i.name} x{i.qty}</span>
                    <span>₹{i.price * i.qty}</span>
                  </div>
                ))}
                <div className="conf-total">
                  <span>Total</span>
                  <span>₹{confirmed.total}</span>
                </div>
              </div>
              <div className="conf-oid">Order ID: {confirmed.order_code}</div>
              <button className="btn-primary" onClick={onClose}>Back to shopping</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
          </svg>
          <div className="drawer-title">Your Cart</div>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-body">
          {cart.items.length === 0 ? (
            <div className="drawer-empty">
              <div>🛒</div>
              Your cart is empty.<br/>Search for something urgent!
            </div>
          ) : (
            cart.items.map((item) => (
              <div className="ci" key={item.id}>
                <div className="ci-ic">{item.icon}</div>
                <div className="ci-info">
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-brand">{item.brand}</div>
                </div>
                <div className="ci-qty">
                  <button className="ci-qty-btn minus" onClick={() => update(item.id, item.qty - 1)}>−</button>
                  <div className="ci-qty-num">{item.qty}</div>
                  <button className="ci-qty-btn" onClick={() => update(item.id, item.qty + 1)}>+</button>
                </div>
                <div className="ci-price">₹{item.price * item.qty}</div>
              </div>
            ))
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="drawer-foot">
            <div className="total-row">
              <div>
                <div className="total-lbl">Total</div>
                <div className="total-sub">⚡ Delivery in ~10 min</div>
              </div>
              <div className="total-amt">₹{cart.total}</div>
            </div>
            <button className="btn-primary" onClick={handleCheckout} disabled={loading}>
              {loading ? "Placing order..." : "Place order →"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}