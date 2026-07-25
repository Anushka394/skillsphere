import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginApi, verify2FAApi } from "../api/authApi";
import { setCredentials } from "../redux/slices/authSlice";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [code, setCode] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const { data } = await loginApi(form);
      if (data.requires2FA) { setRequires2FA(true); setTempUserId(data.userId); return; }
      dispatch(setCredentials(data));
      navigate("/dashboard");
    } catch (err) { setError(err.response?.data?.message || "Login failed"); }
    finally { setLoading(false); }
  };

  const handle2FA = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const { data } = await verify2FAApi({ userId: tempUserId, code });
      dispatch(setCredentials(data)); navigate("/dashboard");
    } catch (err) { setError(err.response?.data?.message || "Invalid code"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, rgba(108,99,255,0.3), rgba(168,85,247,0.2))", border: "1px solid rgba(108,99,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px" }}>
            {requires2FA ? "🔐" : "✨"}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{requires2FA ? "Two-Factor Auth" : "Welcome back"}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{requires2FA ? "Enter the 6-digit code from your authenticator" : "Sign in to your SkillSphere account"}</p>
        </div>
        <div className="glass-card" style={{ padding: 36 }}>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#f87171" }}>
              {error}
            </div>
          )}
          {!requires2FA ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Email</label>
                <input className="input-glass" type="email" placeholder="you@example.com" required
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>Password</label>
                <input className="input-glass" type="password" placeholder="••••••••" required
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div style={{ textAlign: "right" }}>
                <Link to="/forgot-password" style={{ fontSize: 13, color: "var(--primary)", textDecoration: "none" }}>Forgot password?</Link>
              </div>
              <button className="btn-primary" disabled={loading} style={{ marginTop: 8, fontSize: 15, padding: "14px", borderRadius: 12, width: "100%" }}>
                {loading ? "Signing in…" : "Sign In →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handle2FA} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Enter the 6-digit code from your authenticator app</p>
              </div>
              <input className="input-glass" type="text" placeholder="000000" required maxLength={6}
                value={code} onChange={(e) => setCode(e.target.value)}
                style={{ textAlign: "center", fontSize: 24, letterSpacing: 8 }} />
              <button className="btn-primary" disabled={loading} style={{ fontSize: 15, padding: "14px", borderRadius: 12 }}>
                {loading ? "Verifying…" : "Verify →"}
              </button>
              <button type="button" onClick={() => setRequires2FA(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
                ← Back to login
              </button>
            </form>
          )}
        </div>
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-muted)" }}>
          No account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}