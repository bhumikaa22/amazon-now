import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const URG = {
  high:   { cls: "high",   lbl: "● Urgent" },
  medium: { cls: "medium", lbl: "◐ Fast pickup" },
  low:    { cls: "low",    lbl: "○ In stock" },
};

export default function ProductCard({ product, isTop }) {
  const { add, update, inCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const u = URG[product.urgency] || URG.medium;
  const cartItem = inCart(product.id);

  async function handleAdd() {
    if (!user) { window.location.href = "/login"; return; }
    await add(product.id);
    showToast(`✓ ${product.name} added to cart`);
  }

  async function handleQty(delta) {
    const newQty = (cartItem?.qty || 0) + delta;
    await update(product.id, newQty);
    if (newQty === 0) showToast(`Removed from cart`);
  }

  return (
    <div className={`pc ${cartItem ? "in-cart" : ""}`}>
      {isTop && <div className="rec-badge">⭐ Recommended</div>}
      <div className={`ptag ${u.cls}`}>{u.lbl}</div>
      <div className="picon">{product.icon}</div>
      <div className="pname">{product.name}</div>
      <div className="pmeta">{product.brand} · {product.size}</div>
      <div className="prow">
        <div className="pprice">₹{product.price}</div>
        <div className="pdel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {product.deliveryTime}
        </div>
      </div>

      {cartItem ? (
        <div className="qty-stepper">
          <button className="qty-btn minus" onClick={() => handleQty(-1)}>−</button>
          <div className="qty-num">{cartItem.qty}</div>
          <button className="qty-btn" onClick={() => handleQty(1)}>+</button>
        </div>
      ) : (
        <button className="padd" onClick={handleAdd}>
          + Add to cart
        </button>
      )}
    </div>
  );
}