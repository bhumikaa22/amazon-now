import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";
import ProfileDrawer from "./ProfileDrawer";
import LocationModal from "./LocationModal";

export default function Navbar() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [cartOpen, setCartOpen]       = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [locOpen, setLocOpen]         = useState(false);
  const [loc, setLoc]                 = useState("Set location");

  return (
    <>
      <nav>
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div className="logo-word">amazon<span>now</span></div>
        <div className="pill">⚡ 10-min</div>

        <div className="nav-r">
          <button className="nav-btn" onClick={() => setLocOpen(true)}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            {loc}
          </button>

          {user ? (
            <button className="nav-btn-icon" onClick={() => setProfileOpen(true)} title="Profile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          ) : (
            <a href="/login" className="nav-btn">Sign in</a>
          )}

          <button className="nav-btn" style={{ position: "relative" }} onClick={() => setCartOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
            </svg>
            Cart
            {itemCount > 0 && <div className="cart-count">{itemCount}</div>}
          </button>
        </div>
      </nav>

      {cartOpen    && <CartDrawer    onClose={() => setCartOpen(false)} />}
      {profileOpen && <ProfileDrawer onClose={() => setProfileOpen(false)} />}
      {locOpen     && <LocationModal onClose={() => setLocOpen(false)} onSet={setLoc} current={loc} />}
    </>
  );
}