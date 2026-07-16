import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  const states = {
    loading: { icon: "⏳", title: "Verifying your email…", msg: "Just a moment." },
    success: { icon: "🎉", title: "Email verified!", msg: "Your account is active. You can now sign in." },
    error: { icon: "❌", title: "Link expired or invalid", msg: "Request a new verification link by logging in." },
  };
  const s = states[status];

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>{s.icon}</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>{s.title}</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>{s.msg}</p>
        {status !== "loading" && (
          <Link to="/login" className="btn-primary" style={{ textDecoration: "none", display: "inline-block", padding: "12px 28px" }}>Go to Login →</Link>
        )}
      </div>
    </div>
  );
}
