import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isDash = ["/dashboard", "/profile", "/chat", "/admin", "/proposals", "/notifications", "/gigs"].some((p) => location.pathname.startsWith(p));
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", background: "rgba(7,7,15,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--glass-border)" }}>
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #6c63ff, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>SkillSphere</span>
      </Link>

     {!isDash && !user && (
  <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
    <Link to="/gigs" style={{ textDecoration: "none", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>Browse Gigs</Link>
    <Link to="/register?role=freelancer" style={{ textDecoration: "none", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>For Freelancers</Link>
  </div>
)}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {user ? (
          <>
            <Link to="/notifications" style={{ textDecoration: "none", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", fontSize: 18 }}>🔔</Link>
            <Link to="/chat" style={{ textDecoration: "none", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", fontSize: 18 }}>💬</Link>
            <Link to="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 10, background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, rgba(108,99,255,0.5), rgba(168,85,247,0.4))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                {user.name?.[0]}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{user.name?.split(" ")[0]}</span>
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: "none", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", padding: "8px 16px" }}>Login</Link>
            <Link to="/register">
              <button className="btn-primary" style={{ fontSize: 14, padding: "8px 20px", borderRadius: 10 }}>Get Started →</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
