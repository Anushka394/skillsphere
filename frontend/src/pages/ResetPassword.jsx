import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../api/authApi";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await resetPasswordApi(token, { password }); setDone(true); setTimeout(() => navigate("/login"), 2000); }
    catch (err) { setError(err.response?.data?.message || "Reset failed — link may be expired."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{done ? "✅" : "🔒"}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{done ? "Password updated!" : "Set new password"}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{done ? "Redirecting you to login…" : "Choose a strong password."}</p>
        </div>
        {!done && (
          <div className="glass-card" style={{ padding: 32 }}>
            {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: "#f87171" }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <input className="input-glass" type="password" placeholder="New password (min 6 chars)" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button className="btn-primary" disabled={loading} style={{ padding: "13px", borderRadius: 12, fontSize: 15 }}>{loading ? "Saving…" : "Update Password →"}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
