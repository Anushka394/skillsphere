import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";

const NAV = {
  client: [
    { to: "/dashboard", icon: "⚡", label: "Overview" },
    { to: "/gigs", icon: "🔍", label: "Browse Gigs" },
    { to: "/gigs/create", icon: "✏️", label: "Post a Gig" },
    { to: "/proposals", icon: "📋", label: "Proposals" },
    { to: "/chat", icon: "💬", label: "Messages" },
    { to: "/profile", icon: "👤", label: "Profile" },
  ],
  freelancer: [
    { to: "/dashboard", icon: "⚡", label: "Overview" },
    { to: "/gigs", icon: "🔍", label: "Find Gigs" },
    { to: "/proposals", icon: "📤", label: "My Bids" },
    { to: "/chat", icon: "💬", label: "Messages" },
    { to: "/profile", icon: "👤", label: "Profile" },
  ],
  admin: [
    { to: "/admin", icon: "🛡️", label: "Admin Panel" },
    { to: "/dashboard", icon: "⚡", label: "Overview" },
    { to: "/chat", icon: "💬", label: "Messages" },
  ],
};

export default function DashLayout({ children, title, subtitle }) {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const links = NAV[user?.role] || [];

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0, padding: "24px 12px",
        borderRight: "1px solid var(--glass-border)",
        background: "rgba(255,255,255,0.01)",
        display: "flex", flexDirection: "column", gap: 4,
        position: "sticky", top: 64, height: "calc(100vh - 64px)", overflowY: "auto",
      }}>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === "/dashboard" || l.to === "/admin"}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
            <span style={{ fontSize: 18 }}>{l.icon}</span> {l.label}
          </NavLink>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--glass-border)" }}>
          <button
            onClick={() => { dispatch(logout()); navigate("/login"); }}
            className="sidebar-link"
            style={{ width: "100%", background: "none", border: "none", color: "var(--danger)" }}>
            <span style={{ fontSize: 18 }}>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "32px 40px", maxWidth: 1100, overflow: "auto" }}>
        {title && (
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{title}</h1>
            {subtitle && <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
