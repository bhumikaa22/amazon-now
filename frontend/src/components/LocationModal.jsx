import { useState } from "react";

const PRESETS = [
  { city: "Mumbai", eta: "8 min" },
  { city: "Delhi",  eta: "10 min" },
  { city: "Bengaluru", eta: "9 min" },
  { city: "Hyderabad", eta: "11 min" },
  { city: "Chennai", eta: "10 min" },
  { city: "Pune",   eta: "12 min" },
];

export default function LocationModal({ onClose, onSet, current }) {
  const [active, setActive]   = useState(current);
  const [manual, setManual]   = useState("");
  const [detecting, setDetect] = useState(false);

  function pick(city) {
    setActive(city);
    onSet(city);
    setTimeout(onClose, 300);
  }

  function detect() {
    setDetect(true);
    navigator.geolocation?.getCurrentPosition(
      () => { pick("Your location"); setDetect(false); },
      () => { setDetect(false); alert("Could not detect location."); }
    );
  }

  function submit(e) {
    e.preventDefault();
    if (manual.trim()) pick(manual.trim());
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>Set delivery location</h3>
        <p>We'll show products available near you with accurate ETAs.</p>

        <form onSubmit={submit}>
          <input
            placeholder="Type your city or area..."
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />
        </form>

        <button className="modal-detect" onClick={detect}>
          {detecting ? "Detecting..." : "📍 Detect my location"}
        </button>

        <div className="modal-presets">
          {PRESETS.map((p) => (
            <button
              key={p.city}
              className={`modal-preset ${active === p.city ? "active" : ""}`}
              onClick={() => pick(p.city)}
            >
              <strong>{p.city}</strong>
              ⚡ {p.eta} delivery
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}