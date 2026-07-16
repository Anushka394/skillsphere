import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { registerApi } from "../api/authApi";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "freelancer" || role === "client") setForm((f) => ({ ...f, role }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await registerApi(form); setSuccess(true); }
    catch (err) { setError(err.response?.data?.message || "Registration failed"); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>📬</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Check your inbox</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.7 }}>We sent a verification link to <strong style={{ color: "var(--text-primary)" }}>{form.email}</strong>. Click it to activate your account.</p>
        <Link to="/login" className="btn-primary" style={{ display: "inline-block", marginTop: 28, textDecoration: "none", padding: "12px 28px" }}>Go to Login →</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(108,99,255,0.2))", border: "1px solid rgba(34,211,238,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px" }}>🚀</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Create your account</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Join thousands on SkillSphere</p>
        </div>
        <div className="glass-card" style={{ padding: 36 }}>
          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#f87171" }}>{error}</div>}

          {/* Role selector */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            {[{ r: "client", icon: "💼", label: "I'm Hiring" }, { r: "freelancer", icon: "🎯", label: "I'm Freelancing" }].map(({ r, icon, label }) => (
              <button key={r} type="button"
                onClick={() => setForm({ ...form, role: r })}
                style={{ padding: "16px 12px", borderRadius: 12, border: `2px solid ${form.role === r ? "var(--primary)" : "var(--glass-border)"}`, background: form.role === r ? "rgba(108,99,255,0.12)" : "transparent", color: form.role === r ? "#a5a0ff" : "var(--text-muted)", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14 }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[{ key: "name", label: "Full Name", type: "text", ph: "Your name" }, { key: "email", label: "Email", type: "email", ph: "you@example.com" }, { key: "password", label: "Password", type: "password", ph: "Min. 6 characters" }].map(({ key, label, type, ph }) => (
              <div key={key}>
                <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>
                <input className="input-glass" type={type} placeholder={ph} required minLength={key === "password" ? 6 : undefined}
                  value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <button className="btn-primary" disabled={loading} style={{ marginTop: 8, fontSize: 15, padding: "14px", borderRadius: 12, width: "100%" }}>
              {loading ? "Creating account…" : `Join as ${form.role === "client" ? "Client" : "Freelancer"} →`}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-muted)" }}>Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link></p>
      </div>
    </div>
  );
}
