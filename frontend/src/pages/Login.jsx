import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { login as loginApi } from "../api/auth";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

async function handleSubmit(e) {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    const res = await loginApi(form);
    login(res.data.token, res.data.user);
    window.location.href = "/";
  } catch (err) {
    const msg = err.response?.data?.error || "Login failed. Try again.";
    setError(msg);
    // If no account found, redirect to signup after 2 seconds
    if (err.response?.status === 401 && msg.includes("No account found")) {
      setError("No account found with this email. Redirecting to sign up...");
      setTimeout(() => {
        window.location.href = `/signup?email=${encodeURIComponent(form.email)}`;
      }, 2000);
    }
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div className="logo-word">amazon<span>now</span></div>
        </div>

        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Sign in to your account to continue</div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?{" "}
          <a onClick={() => window.location.href = "/signup"}>Sign up</a>
        </div>
      </div>
    </div>
  );
}