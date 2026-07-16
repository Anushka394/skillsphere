import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicProfileApi } from "../api/profileApi";

const PROFICIENCY_COLORS = { Beginner: "#64748b", Intermediate: "#6c63ff", Advanced: "#a855f7", Expert: "#22d3ee" };

export default function PublicProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicProfileApi(userId)
      .then((r) => { setUser(r.data.user); setProfile(r.data.profile); })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div style={{ maxWidth: 900, margin: "60px auto", padding: "0 24px" }}>
      <div className="shimmer" style={{ height: 220, borderRadius: 20, marginBottom: 20 }} />
    </div>
  );

  if (!user || !profile) return (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
      <h2 style={{ fontWeight: 700 }}>Freelancer not found</h2>
    </div>
  );

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>
        {/* Sidebar card */}
        <div style={{ position: "sticky", top: 80 }}>
          <div className="glass-card" style={{ padding: 28, textAlign: "center", marginBottom: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, rgba(108,99,255,0.4), rgba(168,85,247,0.3))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, margin: "0 auto 16px", border: "2px solid rgba(108,99,255,0.4)" }}>
              {user.name?.[0]}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{user.name}</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12 }}>{profile.title || "Freelancer"}</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {profile.verificationBadge !== "none" && (
                <span className="badge badge-cyan">{profile.verificationBadge?.replace("_", " ")}</span>
              )}
              {profile.isVerified && <span className="badge badge-success">✅ Verified</span>}
            </div>
            {user.location?.city && <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>📍 {user.location.city}</p>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { icon: "⭐", val: profile.reputationScore ? profile.reputationScore.toFixed(1) : "—", label: "Score" },
                { icon: "🏆", val: profile.completedGigs ?? 0, label: "Jobs Done" },
                { icon: "👁️", val: profile.profileViews ?? 0, label: "Views" },
                { icon: "💰", val: profile.pricing?.hourlyRate ? "₹" + profile.pricing.hourlyRate + "/hr" : "—", label: "Rate" },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 16 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <Link to={`/chat?userId=${userId}`} className="btn-primary" style={{ display: "block", textDecoration: "none", padding: "11px", borderRadius: 12, fontSize: 14, textAlign: "center" }}>
              💬 Message
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Bio */}
          {profile.bio && (
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>About</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8 }}>{profile.bio}</p>
            </div>
          )}

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Skills</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {profile.skills.map((s, i) => (
                  <div key={i} style={{ padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, background: `${PROFICIENCY_COLORS[s.proficiency]}18`, color: PROFICIENCY_COLORS[s.proficiency] || "#a5a0ff", border: `1px solid ${PROFICIENCY_COLORS[s.proficiency]}30` }}>
                    {s.name} <span style={{ opacity: 0.6, fontWeight: 400 }}>· {s.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {profile.workExperience?.length > 0 && (
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Work Experience</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {profile.workExperience.map((w, i) => (
                  <div key={i} style={{ paddingLeft: 16, borderLeft: "2px solid rgba(108,99,255,0.4)" }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{w.roleTitle}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>{w.company} · {w.startDate ? new Date(w.startDate).getFullYear() : "?"} – {w.endDate ? new Date(w.endDate).getFullYear() : "Present"}</div>
                    {w.description && <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{w.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {profile.portfolio?.length > 0 && (
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Portfolio</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                {profile.portfolio.map((p, i) => (
                  <a key={i} href={p.projectUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--glass-border)", transition: "all 0.2s" }}>
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.title} style={{ width: "100%", height: 120, objectFit: "cover" }} />
                        : <div style={{ height: 120, background: "linear-gradient(135deg, rgba(108,99,255,0.2), rgba(168,85,247,0.1))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🎨</div>}
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.title}</div>
                        {p.description && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{p.description}</div>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
