import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { getProfile, updateProfile } from "../api/profile";
import { getOrders, reorder } from "../api/orders";
import { useEffect } from "react";

const FAQS = [
  { q: "How fast will my order arrive?",       a: "Most orders are delivered within 10 minutes depending on your location and item availability." },
  { q: "How do I change my delivery address?", a: "Go to Profile tab, update the address field, and tap Save." },
  { q: "Can I cancel an order?",               a: "Since orders are dispatched within minutes, cancellations are usually not possible once confirmed." },
  { q: "How do I reorder something?",          a: "Open Orders tab and tap Reorder on any past order to add items to your cart instantly." },
  { q: "Item missing or damaged?",             a: "Use Email Support below with your order ID and we'll resolve it within 24 hours." },
];

export default function ProfileDrawer({ onClose }) {
  const { user, logout } = useAuth();
  const { showToast }    = useToast();
  const { fetchCart }    = useCart();
  const [tab, setTab]    = useState("profile");
  const [profile, setProfile]   = useState(null);
  const [orders,  setOrders]    = useState([]);
  const [faqOpen, setFaqOpen]   = useState(null);
  const [faqQ,    setFaqQ]      = useState("");
  const [saving,  setSaving]    = useState(false);

  useEffect(() => {
    getProfile().then((r) => setProfile(r.data)).catch(() => {});
    getOrders().then((r) => setOrders(r.data)).catch(() => {});
  }, []);

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await updateProfile(profile);
      setProfile(res.data);
      showToast("✓ Profile saved");
    } catch { showToast("Failed to save"); }
    finally { setSaving(false); }
  }

  async function handleReorder(orderId) {
    try {
      await reorder(orderId);
      await fetchCart();
      showToast("🔁 Items added to cart!");
      onClose();
    } catch { showToast("Reorder failed"); }
  }

  function handleLogout() {
    logout();
    onClose();
    window.location.href = "/";
  }

  function initials(name) {
    return (name || "U").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  }

  const filteredFaqs = FAQS.filter(
    (f) => f.q.toLowerCase().includes(faqQ.toLowerCase()) || f.a.toLowerCase().includes(faqQ.toLowerCase())
  );

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <div className="drawer-title">My Account</div>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="profile-tabs">
          {["profile","orders","help"].map((t) => (
            <button key={t} className={`ptab ${tab===t?"active":""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        <div className="drawer-body">
          {/* PROFILE TAB */}
          {tab === "profile" && profile && (
            <div className="profile-sec">
              <div className="profile-avatar">{initials(profile.name)}</div>
              <div className="profile-name">{profile.name}</div>
              <div className="profile-email">{profile.email}</div>

              {[["Full name","name","text"],["Phone","phone","tel"],["Delivery address","address","text"]].map(([lbl,key,type]) => (
                <div className="profile-field" key={key}>
                  <label>{lbl}</label>
                  <input
                    type={type}
                    value={profile[key] || ""}
                    onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  />
                </div>
              ))}

              <button className="btn-primary" onClick={saveProfile} disabled={saving} style={{ marginBottom: 16 }}>
                {saving ? "Saving..." : "Save changes"}
              </button>

              <div style={{ marginTop: 8 }}>
                {[["Order update notifications","notifyOrders"],["Offers & promotions","notifyOffers"]].map(([lbl,key]) => (
                  <div className="profile-row" key={key}>
                    <span>{lbl}</span>
                    <div
                      className={`profile-toggle ${profile[key]?"on":""}`}
                      onClick={() => setProfile({ ...profile, [key]: !profile[key] })}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleLogout}
                style={{ width:"100%", marginTop:20, padding:"10px", background:"var(--red-bg)", border:"1px solid rgba(242,139,130,0.3)", borderRadius:"var(--rsm)", color:"var(--red)", cursor:"pointer", fontWeight:600, fontSize:13 }}
              >
                Sign out
              </button>
            </div>
          )}

          {/* ORDERS TAB */}
          {tab === "orders" && (
            <div className="profile-sec">
              {orders.length === 0 ? (
                <div className="drawer-empty"><div>📦</div>No orders yet.</div>
              ) : (
                orders.map((o) => (
                  <div className="order-card" key={o.id}>
                    <div className="order-top">
                      <span className="order-id">{o.order_code}</span>
                      <span className="order-status">Delivered</span>
                    </div>
                    <div className="order-items-text">
                      {o.items.map((i) => `${i.icon} ${i.name} x${i.qty}`).join(", ")}
                    </div>
                    <div className="order-bottom">
                      <div>
                        <div className="order-total">₹{o.total}</div>
                        <div className="order-date">{new Date(o.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                      </div>
                      <button className="reorder-btn" onClick={() => handleReorder(o.id)}>Reorder</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* HELP TAB */}
          {tab === "help" && (
            <div className="profile-sec">
              <input
                className="help-search"
                placeholder="Search help articles..."
                value={faqQ}
                onChange={(e) => setFaqQ(e.target.value)}
              />
              {filteredFaqs.map((f, i) => (
                <div className="faq-item" key={i}>
                  <div className="faq-q" onClick={() => setFaqOpen(faqOpen===i ? null : i)}>
                    <span>{f.q}</span>
                    <span>{faqOpen===i?"▲":"▾"}</span>
                  </div>
                  {faqOpen===i && <div className="faq-a">{f.a}</div>}
                </div>
              ))}
              <div className="help-contact">
                {[["📧","Email"],["💬","Chat"],["📞","Call"]].map(([ico,lbl]) => (
                  <button key={lbl} className="help-contact-btn" onClick={() => showToast(`${ico} ${lbl} support coming soon`)}>
                    <span className="ico">{ico}</span>{lbl}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}