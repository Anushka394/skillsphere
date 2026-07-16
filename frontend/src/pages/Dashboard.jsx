import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DashLayout from "../components/DashLayout";
import api from "../api/axios";

const StatCard = ({ icon, label, value, color = "#6c63ff" }) => (
  <div className="stat-card" style={{ position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: -10, right: -10, fontSize: 48, opacity: 0.07 }}>{icon}</div>
    <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color }}>{value}</div>
    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{label}</div>
  </div>
);

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth);
  const [profile, setProfile] = useState(null);
  const [recentGigs, setRecentGigs] = useState([]);

  useEffect(() => {
    api.get("/profile").then((r) => setProfile(r.data.profile)).catch(() => {});
    api.get("/gigs?limit=5").then((r) => setRecentGigs(r.data.gigs || [])).catch(() => {});
  }, []);

  const clientStats = [
    { icon: "📋", label: "Gigs Posted", value: profile?.totalGigsPosted ?? "0", color: "#6c63ff" },
    { icon: "💸", label: "Total Spent", value: profile?.totalSpent ? "₹" + profile.totalSpent.toLocaleString() : "₹0", color: "#a855f7" },
    { icon: "✅", label: "Completed", value: "0", color: "#10b981" },
    { icon: "⭐", label: "Avg Rating", value: "—", color: "#f59e0b" },
  ];
  const freelancerStats = [
    { icon: "💰", label: "Total Earnings", value: profile?.totalEarnings ? "₹" + profile.totalEarnings.toLocaleString() : "₹0", color: "#10b981" },
    { icon: "🏆", label: "Completed Gigs", value: profile?.completedGigs ?? "0", color: "#6c63ff" },
    { icon: "👁️", label: "Profile Views", value: profile?.profileViews ?? "0", color: "#22d3ee" },
    { icon: "⭐", label: "Reputation", value: profile?.reputationScore ? profile.reputationScore.toFixed(1) : "—", color: "#f59e0b" },
  ];
  const stats = user?.role === "freelancer" ? freelancerStats : clientStats;

  return (
    <DashLayout title={"Hey, " + user?.name?.split(" ")[0] + " 👋"} subtitle={user?.role === "freelancer" ? "Your freelancer overview" : "Your client overview"}>
      {!user?.isEmailVerified && (
        <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "12px 20px", marginBottom: 24, fontSize: 14, color: "#fbbf24" }}>
          ⚠️ Please verify your email to unlock all features.
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 32 }}>
        {user?.role === "client" && (
          <Link to="/gigs/create" style={{ textDecoration: "none" }}>
            <div className="glass-card" style={{ padding: 24, cursor: "pointer", borderColor: "rgba(108,99,255,0.3)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✏️</div>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Post a Gig</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Find the perfect freelancer with AI matching</p>
            </div>
          </Link>
        )}
        {user?.role === "freelancer" && (
          <Link to="/gigs" style={{ textDecoration: "none" }}>
            <div className="glass-card" style={{ padding: 24, cursor: "pointer", borderColor: "rgba(34,211,238,0.3)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Find Gigs</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>AI-matched opportunities for your skills</p>
            </div>
          </Link>
        )}
        <Link to="/chat" style={{ textDecoration: "none" }}>
          <div className="glass-card" style={{ padding: 24, cursor: "pointer" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
            <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Messages</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Chat with clients and freelancers</p>
          </div>
        </Link>
        <Link to="/profile" style={{ textDecoration: "none" }}>
          <div className="glass-card" style={{ padding: 24, cursor: "pointer" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
            <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Edit Profile</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Update skills, portfolio and availability</p>
          </div>
        </Link>
      </div>
      {recentGigs.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Latest Open Gigs</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentGigs.map((g) => (
              <Link key={g._id} to={"/gigs/" + g._id} style={{ textDecoration: "none" }}>
                <div className="glass-card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{g.category} · {g.skillsRequired?.slice(0, 3).join(", ")}</div>
                  </div>
                  <span className="badge badge-success">₹{g.budget.min.toLocaleString()}–{g.budget.max.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </DashLayout>
  );
}
