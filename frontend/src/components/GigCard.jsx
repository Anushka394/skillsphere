import { useRef } from "react";
import { Link } from "react-router-dom";
import useTilt from "../hooks/useTilt";

const CATEGORY_COLORS = {
  "Web Dev": "#6c63ff", "Mobile Apps": "#a855f7", "UI/UX Design": "#ec4899",
  "Data Science": "#22d3ee", "Content Writing": "#10b981", "Digital Marketing": "#f59e0b",
  "Video Editing": "#ef4444", "AI/ML": "#6366f1", "DevOps": "#14b8a6", "Blockchain": "#f97316",
};

export default function GigCard({ gig }) {
  const ref = useRef(null);
  useTilt(ref, 8);
  const color = CATEGORY_COLORS[gig.category] || "#6c63ff";

  return (
    <div ref={ref} className="glass-card tilt-card" style={{ padding: 24, cursor: "pointer", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="badge" style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
          {gig.category}
        </span>
        <span className="badge badge-success">
          ₹{gig.budget.min.toLocaleString()}–{gig.budget.max.toLocaleString()}
        </span>
      </div>

      {/* Title */}
      <Link to={`/gigs/${gig._id}`} style={{ textDecoration: "none" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4 }}>{gig.title}</h3>
      </Link>

      {/* Skills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {gig.skillsRequired?.slice(0, 4).map((s) => (
          <span key={s} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", border: "1px solid var(--glass-border)" }}>
            {s}
          </span>
        ))}
        {gig.skillsRequired?.length > 4 && (
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>+{gig.skillsRequired.length - 4}</span>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--glass-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {gig.client?.avatar
            ? <img src={gig.client.avatar} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} alt="" />
            : <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                {gig.client?.name?.[0] || "?"}
              </div>
          }
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{gig.client?.name}</span>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-muted)" }}>
          {gig.location?.isRemote && <span>🌐 Remote</span>}
          {gig.location?.city && !gig.location?.isRemote && <span>📍 {gig.location.city}</span>}
          <span>💼 {gig.proposalsCount || 0} bids</span>
        </div>
      </div>
    </div>
  );
}
