import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import DashLayout from "../components/DashLayout";
import { getMyProposalsApi, updateProposalStatusApi } from "../api/proposalsApi";

const STATUS = { pending: "warning", negotiating: "cyan", accepted: "success", rejected: "danger", withdrawn: "danger" };

export default function MyProposals() {
  const { user } = useSelector((s) => s.auth);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getMyProposalsApi().then((r) => setProposals(r.data.proposals || [])).finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateProposalStatusApi(id, { status });
      setProposals((ps) => ps.map((p) => p._id === id ? { ...p, status } : p));
    } catch {}
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
            {f}
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
          {user?.role === "freelancer" && <Link to="/gigs" className="btn-primary" style={{ display: "inline-block", marginTop: 12, textDecoration: "none", padding: "10px 24px" }}>Browse Gigs →</Link>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((p) => (
            <div key={p._id} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <Link to={`/gigs/${p.gig?._id}`} style={{ textDecoration: "none" }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 4 }}>{p.gig?.title || "Gig"}</h3>
                  </Link>
                  {user?.role === "client" && p.freelancer && (
                    <Link to={`/profile/${p.freelancer._id}`} style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
                      by {p.freelancer.name}
                    </Link>
                  )}
                </div>
                <span className={`badge badge-${STATUS[p.status] || "warning"}`} style={{ flexShrink: 0 }}>{p.status}</span>
              </div>

              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16 }}>{p.description?.slice(0, 180)}{p.description?.length > 180 ? "…" : ""}</p>

              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: user?.role === "client" && p.status === "pending" ? 16 : 0 }}>
                <div style={{ fontSize: 13 }}><span style={{ color: "var(--text-muted)" }}>Bid: </span><strong style={{ color: "#10b981" }}>₹{p.bidAmount?.toLocaleString()}</strong></div>
                <div style={{ fontSize: 13 }}><span style={{ color: "var(--text-muted)" }}>Timeline: </span><strong>{p.estimatedCompletionDays} days</strong></div>
                <div style={{ fontSize: 13 }}><span style={{ color: "var(--text-muted)" }}>Submitted: </span>{new Date(p.createdAt).toLocaleDateString("en-IN")}</div>
              </div>

              {user?.role === "client" && p.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-success" onClick={() => handleStatus(p._id, "accepted")} style={{ fontSize: 13, padding: "8px 18px", borderRadius: 10 }}>✅ Accept</button>
                  <button className="btn-ghost" onClick={() => handleStatus(p._id, "negotiating")} style={{ fontSize: 13, padding: "8px 18px", borderRadius: 10 }}>💬 Negotiate</button>
                  <button className="btn-danger" onClick={() => handleStatus(p._id, "rejected")} style={{ fontSize: 13, padding: "8px 18px", borderRadius: 10 }}>✕ Reject</button>
                </div>
              )}
              {user?.role === "freelancer" && p.status === "pending" && (
                <button className="btn-ghost" onClick={() => handleStatus(p._id, "withdrawn")} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8 }}>Withdraw</button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashLayout>
  );
}
