import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "../api/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await forgotPasswordApi({ email }); setSent(true); }
    catch {}
    finally { setLoading(false); setSent(true); } // always show success (anti-enumeration)
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{sent ? "Email sent!" : "Reset password"}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>
            {sent ? `If ${email} exists, a reset link is on its way. Check spam too.` : "Enter your email and we'll send you a reset link."}
          </p>
        </div>
        {!sent && (
          <div className="glass-card" style={{ padding: 32 }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <input className="input-glass" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="btn-primary" disabled={loading} style={{ padding: "13px", borderRadius: 12, fontSize: 15 }}>{loading ? "Sending…" : "Send Reset Link →"}</button>
            </form>
          </div>
        )}
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-muted)" }}>
          <Link to="/login" style={{ color: "var(--primary)", textDecoration: "none" }}>← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
