import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getGigByIdApi } from "../api/gigsApi";
import { submitProposalApi } from "../api/proposalsApi";
import Modal from "../components/Modal";

const STATUS_COLORS = { open: "success", in_progress: "warning", completed: "cyan", cancelled: "danger" };

export default function GigDetail() {
  const { id } = useParams();
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposal, setProposal] = useState({ description: "", bidAmount: "", estimatedCompletionDays: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getGigByIdApi(id).then((r) => { setGig(r.data.gig); setRecommendations(r.data.recommendations || []); })
      .catch(() => navigate("/gigs"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleProposal = async (e) => {
    e.preventDefault(); setSubmitting(true); setError("");
    try {
      await submitProposalApi(id, { ...proposal, bidAmount: Number(proposal.bidAmount), estimatedCompletionDays: Number(proposal.estimatedCompletionDays) });
      setSubmitted(true); setProposalOpen(false);
    } catch (err) { setError(err.response?.data?.message || "Failed to submit proposal"); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ maxWidth: 900, margin: "60px auto", padding: "0 24px" }}>
      <div className="shimmer" style={{ height: 300, borderRadius: 20, marginBottom: 20 }} />
    </div>
  );

  if (!gig) return null;

  const isOwner = user?._id === gig.client?._id;
  const isFreelancer = user?.role === "freelancer";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        {/* Main */}
        <div>
          {/* Header */}
          <div className="glass-card" style={{ padding: 32, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  <span className="badge badge-primary">{gig.category}</span>
                  <span className={`badge badge-${STATUS_COLORS[gig.status] || "warning"}`}>{gig.status?.replace("_", " ")}</span>
                  {gig.location?.isRemote && <span className="badge badge-cyan">🌐 Remote</span>}
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.3, marginBottom: 8 }}>{gig.title}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(108,99,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                    {gig.client?.name?.[0]}
                  </div>
                  <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Posted by <strong style={{ color: "var(--text-primary)" }}>{gig.client?.name}</strong></span>
                  {gig.client?.location?.city && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>📍 {gig.client.location.city}</span>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981" }}>₹{gig.budget.min.toLocaleString()}–{gig.budget.max.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{gig.budget.type}</div>
              </div>
            </div>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.8 }}>{gig.description}</p>
          </div>

          {/* Skills */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Skills Required</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {gig.skillsRequired?.map((s) => (
                <span key={s} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, background: "rgba(108,99,255,0.12)", color: "#a5a0ff", border: "1px solid rgba(108,99,255,0.25)" }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Milestones */}
          {gig.milestones?.length > 0 && (
            <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Project Milestones</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {gig.milestones.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</span>
                        <span style={{ color: "#10b981", fontWeight: 700, fontSize: 14 }}>₹{m.amount.toLocaleString()}</span>
                      </div>
                      {m.description && <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{m.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations (client view only) */}
          {isOwner && recommendations.length > 0 && (
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>🤖</span>
                <h3 style={{ fontWeight: 700 }}>AI-Recommended Freelancers</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recommendations.map((r, i) => (
                  <Link key={i} to={`/profile/${r.userId}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)", transition: "all 0.2s" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, rgba(108,99,255,0.3), rgba(34,211,238,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{r.name?.[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.location?.city || "Remote"}</div>
                      </div>
                      <span className="badge badge-success">Match: {Math.round(r.score * 100)}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position: "sticky", top: 80 }}>
          <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#6c63ff" }}>{gig.proposalsCount || 0}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Proposals</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#22d3ee" }}>{gig.deadline ? new Date(gig.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Open"}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Deadline</div>
              </div>
            </div>

            {submitted && (
              <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, padding: "12px", marginBottom: 16, fontSize: 14, color: "#34d399", textAlign: "center" }}>
                ✅ Proposal submitted!
              </div>
            )}

            {isFreelancer && gig.status === "open" && !submitted && (
              <button className="btn-primary" onClick={() => setProposalOpen(true)} style={{ width: "100%", padding: "14px", borderRadius: 12, fontSize: 15, marginBottom: 10 }}>
                Submit Proposal →
              </button>
            )}
            {!user && (
              <Link to="/login" className="btn-primary" style={{ display: "block", textAlign: "center", textDecoration: "none", padding: "14px", borderRadius: 12, fontSize: 15, marginBottom: 10 }}>
                Sign in to Apply →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Proposal Modal */}
      <Modal open={proposalOpen} onClose={() => setProposalOpen(false)} title="Submit a Proposal" width={520}>
        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: "#f87171" }}>{error}</div>}
        <form onSubmit={handleProposal} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Cover Letter</label>
            <textarea className="input-glass" placeholder="Describe your approach, relevant experience, and why you're the best fit…" required rows={5}
              value={proposal.description} onChange={(e) => setProposal({ ...proposal, description: e.target.value })}
              style={{ resize: "vertical", minHeight: 120 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Your Bid (₹)</label>
              <input className="input-glass" type="number" placeholder="5000" required min={1}
                value={proposal.bidAmount} onChange={(e) => setProposal({ ...proposal, bidAmount: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Days to Complete</label>
              <input className="input-glass" type="number" placeholder="7" required min={1}
                value={proposal.estimatedCompletionDays} onChange={(e) => setProposal({ ...proposal, estimatedCompletionDays: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="button" className="btn-ghost" onClick={() => setProposalOpen(false)} style={{ flex: 1, borderRadius: 12, padding: "12px" }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 1, borderRadius: 12, padding: "12px" }}>
              {submitting ? "Sending…" : "Submit Proposal"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
