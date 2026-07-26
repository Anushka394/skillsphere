import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import DashLayout from "../components/DashLayout";
import { updateProposalStatusApi } from "../api/proposalsApi";
import api from "../api/axios";

const STATUS = { pending: "warning", negotiating: "cyan", accepted: "success", rejected: "danger", withdrawn: "danger" };

export default function MyProposals() {
  const { user } = useSelector((s) => s.auth);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (user?.role === "client") {
      api.get("/proposals/received").then((r) => {
        setProposals(r.data.proposals || []);
      }).catch(() => {
        api.get("/gigs/my").then((r) => {
          setProposals(r.data.gigs || []);
        }).catch(() => {});
      }).finally(() => setLoading(false));
    } else {
      api.get("/proposals/my").then((r) => {
        setProposals(r.data.proposals || []);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [user]);

  const handleStatus = async (id, status) => {
    try {
      await updateProposalStatusApi(id, { status });
      setProposals((ps) => ps.map((p) => p._id === id ? { ...p, status } : p));
      if (status === "accepted") {
        alert("✅ Proposal accepted! Gig is now in progress.");
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const filtered = filter === "all" ? proposals : proposals.filter((p) => p.status === filter);

  return (
    <DashLayout title={user?.role === "freelancer" ? "My Bids" : "Received Proposals"} subtitle="Track your proposal activity">

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
        {["all", "pending", "accepted", "rejected", "negotiating"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "8px 16px", borderRadius: 20, border: "1px solid", fontSize: 13, cursor: "pointer", fontWeight: 600, transition: "all 0.2s", textTransform: "capitalize",
              background: filter === f ? "rgba(108,99,255,0.2)" : "transparent",
              borderColor: filter === f ? "rgba(108,99,255,0.5)" : "var(--glass-border)",
              color: filter === f ? "#a5a0ff" : "var(--text-muted)" }}>
            {f} {f === "all" ? `(${proposals.length})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => <div key={i} className="shimmer" style={{ height: 130, borderRadius: 16 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No proposals here</h3>
          {user?.role === "freelancer" && (
            <Link to="/gigs" className="btn-primary" style={{ display: "inline-block", marginTop: 12, textDecoration: "none", padding: "10px 24px" }}>
              Browse Gigs →
            </Link>
          )}
          {user?.role === "client" && (
            <Link to="/gigs/create" className="btn-primary" style={{ display: "inline-block", marginTop: 12, textDecoration: "none", padding: "10px 24px" }}>
              Post a Gig →
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((p) => (
            <div key={p._id} className="glass-card" style={{ padding: 24, borderLeft: `3px solid ${p.status === "accepted" ? "#10b981" : p.status === "rejected" ? "#ef4444" : p.status === "negotiating" ? "#22d3ee" : "rgba(108,99,255,0.4)"}` }}>

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <Link to={`/gigs/${p.gig?._id || p._id}`} style={{ textDecoration: "none" }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 4 }}>
                      {p.gig?.title || p.title || "Gig"}
                    </h3>
                  </Link>
                  {user?.role === "client" && p.freelancer && (
                    <Link to={`/profile/${p.freelancer._id}`} style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
                      👤 by {p.freelancer.name}
                    </Link>
                  )}
                </div>
                {p.status && (
                  <span className={`badge badge-${STATUS[p.status] || "warning"}`} style={{ flexShrink: 0, fontSize: 12 }}>
                    {p.status === "pending" ? "⏳ Pending" :
                     p.status === "accepted" ? "✅ Accepted" :
                     p.status === "rejected" ? "❌ Rejected" :
                     p.status === "negotiating" ? "💬 Negotiating" :
                     p.status === "withdrawn" ? "↩️ Withdrawn" : p.status}
                  </span>
                )}
              </div>

              {/* Description */}
              {p.description && (
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                  "{p.description?.slice(0, 200)}{p.description?.length > 200 ? "…" : ""}"
                </p>
              )}

              {/* Stats */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16 }}>
                {p.bidAmount && (
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>💰 Bid: </span>
                    <strong style={{ color: "#10b981" }}>₹{p.bidAmount?.toLocaleString()}</strong>
                  </div>
                )}
                {p.estimatedCompletionDays && (
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>⏱️ Timeline: </span>
                    <strong>{p.estimatedCompletionDays} days</strong>
                  </div>
                )}
                {p.budget && (
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>💼 Budget: </span>
                    <strong style={{ color: "#10b981" }}>₹{p.budget?.min?.toLocaleString()}–{p.budget?.max?.toLocaleString()}</strong>
                  </div>
                )}
                {p.createdAt && (
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>📅 </span>
                    {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                )}
              </div>

              {/* CLIENT ACTIONS */}
              {user?.role === "client" && (p.status === "pending" || p.status === "negotiating") && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  <button className="btn-success" onClick={() => handleStatus(p._id, "accepted")}
                    style={{ fontSize: 13, padding: "8px 18px", borderRadius: 10 }}>✅ Accept</button>
                  <button onClick={() => handleStatus(p._id, "negotiating")}
                    style={{ fontSize: 13, padding: "8px 18px", borderRadius: 10, background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.4)", color: "#22d3ee", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                    💬 Negotiate
                  </button>
                  <button className="btn-danger" onClick={() => handleStatus(p._id, "rejected")}
                    style={{ fontSize: 13, padding: "8px 18px", borderRadius: 10 }}>✕ Reject</button>
                </div>
              )}

              {/* CLIENT - Message freelancer */}
              {user?.role === "client" && p.freelancer?._id && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link to={`/chat?userId=${p.freelancer._id}`}
                    style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", color: "#a5a0ff", textDecoration: "none", fontWeight: 600 }}>
                    💬 Message Freelancer
                  </Link>
                  <Link to={`/gigs/${p.gig?._id}`}
                    style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, background: "transparent", border: "1px solid var(--glass-border)", color: "var(--text-muted)", textDecoration: "none" }}>
                    View Gig →
                  </Link>
                </div>
              )}

              {/* FREELANCER - Pending */}
              {user?.role === "freelancer" && p.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-ghost" onClick={() => handleStatus(p._id, "withdrawn")}
                    style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8 }}>↩️ Withdraw</button>
                  {p.gig?.client?._id && (
                    <Link to={`/chat?userId=${p.gig?.client?._id}`}
                      style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", color: "#a5a0ff", textDecoration: "none", fontWeight: 600 }}>
                      💬 Message Client
                    </Link>
                  )}
                </div>
              )}

              {/* FREELANCER - Negotiating */}
              {user?.role === "freelancer" && p.status === "negotiating" && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: "10px 14px", background: "rgba(34,211,238,0.05)", borderRadius: 10, border: "1px solid rgba(34,211,238,0.2)" }}>
                  <span style={{ fontSize: 13, color: "#22d3ee" }}>💬 Client wants to negotiate the price</span>
                  {p.gig?.client?._id && (
                    <Link to={`/chat?userId=${p.gig?.client?._id}`}
                      style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.3)", color: "#22d3ee", textDecoration: "none", fontWeight: 600 }}>
                      💬 Discuss in Chat
                    </Link>
                  )}
                </div>
              )}

              {/* FREELANCER - Accepted */}
              {user?.role === "freelancer" && p.status === "accepted" && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 14px", background: "rgba(16,185,129,0.05)", borderRadius: 10, border: "1px solid rgba(16,185,129,0.2)" }}>
                  <span style={{ fontSize: 13, color: "#34d399" }}>🎉 Congratulations! Your proposal was accepted!</span>
                  {p.gig?.client?._id && (
                    <Link to={`/chat?userId=${p.gig?.client?._id}`}
                      style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399", textDecoration: "none", fontWeight: 600 }}>
                      💬 Message Client
                    </Link>
                  )}
                </div>
              )}

              {/* FREELANCER - Rejected */}
              {user?.role === "freelancer" && p.status === "rejected" && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.05)", borderRadius: 10, border: "1px solid rgba(239,68,68,0.15)" }}>
                  <span style={{ fontSize: 13, color: "#f87171" }}>This proposal was not selected. Keep trying! 💪</span>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </DashLayout>
  );
}