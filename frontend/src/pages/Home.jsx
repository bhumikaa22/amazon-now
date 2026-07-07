import { useState, useRef } from "react";
import { searchProducts } from "../api/products";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { addToCart } from "../api/cart";
import ProductCard from "../components/ProductCard";

const CHIPS = [
  { label: "🥛 Milk",       q: "milk" },
  { label: "🔌 Charger",    q: "phone charger" },
  { label: "💊 Medicine",   q: "headache medicine" },
  { label: "🍞 Bread",      q: "bread" },
  { label: "🔋 Batteries",  q: "battery" },
  { label: "💧 Water",      q: "water" },
];

export default function Home() {
  const { user }           = useAuth();
  const { fetchCart }      = useCart();
  const { showToast }      = useToast();
  const [query, setQuery]  = useState("");
  const [results, setResults]   = useState(null);
  const [bundle,  setBundle]    = useState(null);
  const [thinking, setThinking] = useState(false);
  const [bundleDismissed, setBundleDismissed] = useState(false);
  const inputRef = useRef(null);

  async function doSearch(q) {
    if (!q.trim()) return;
    setQuery(q);
    setThinking(true);
    setResults(null);
    setBundle(null);
    setBundleDismissed(false);
    try {
      const res = await searchProducts(q);
      setResults(res.data.results);
      setBundle(res.data.bundle);
    } catch {
      showToast("Search failed. Try again.");
    } finally {
      setThinking(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") doSearch(query);
  }

  async function addBundle() {
    if (!user) { window.location.href = "/login"; return; }
    try {
      await addToCart(bundle.id);
      await fetchCart();
      showToast(`✓ ${bundle.name} added to cart`);
      setBundleDismissed(true);
    } catch { showToast("Failed to add item"); }
  }

  return (
    <div>
      {/* HERO */}
      <div className="hero">
        <div className="eyebrow">
          <div className="blink" />
          Live in your area · Powered by AI
        </div>
        <h1>Get it in<br /><em>10 minutes.</em></h1>
        <p>Tell us what you need — we'll find it, pack it, and deliver it before you finish your coffee.</p>

        <div className="sbar">
          <div className="sbar-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            ref={inputRef}
            id="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="What do you urgently need? e.g. milk, charger..."
          />
          <button className="sbar-submit" onClick={() => doSearch(query)}>
            Find now →
          </button>
        </div>

        <div className="chips">
          {CHIPS.map((c) => (
            <button key={c.q} className="chip" onClick={() => doSearch(c.q)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stat"><div className="stat-v">10 min</div><div className="stat-l">Avg Delivery</div></div>
        <div className="stat"><div className="stat-v">2,400+</div><div className="stat-l">Products</div></div>
        <div className="stat"><div className="stat-v">98.4%</div><div className="stat-l">On-time Rate</div></div>
      </div>

      {/* THINKING */}
      {thinking && (
        <div className="thinking">
          <div className="tdots">
            <div className="td" /><div className="td" /><div className="td" />
          </div>
          Finding the best matches for "{query}"...
        </div>
      )}

      {/* RESULTS */}
      {results && (
        <>
          <div className="divider">
            <div className="div-line" />
            <div className="div-label">AI Suggestions</div>
            <div className="div-line" />
          </div>

          <div className="res-hdr">
            <div className="res-title">
              Top picks for <strong>"{query}"</strong>
            </div>
            <div className="res-badge">✓ {results.length} found</div>
          </div>

          {results.length === 0 ? (
            <div className="empty">No results found. Try a different search.</div>
          ) : (
            <div className="products">
              {results.map((p, i) => (
                <ProductCard key={p.id} product={p} isTop={i === 0} />
              ))}
            </div>
          )}

          {bundle && !bundleDismissed && (
            <div className="bundle-suggest">
              <span>
                💡 Often bought together:{" "}
                <strong>{bundle.icon} {bundle.name}</strong> · ₹{bundle.price}
              </span>
              <button className="bundle-add" onClick={addBundle}>+ Add</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}