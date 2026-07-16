import { useEffect, useState } from "react";
import DashLayout from "../components/DashLayout";
import { getAdminStatsApi, getUsersApi, suspendUserApi, verifyFreelancerApi, getDisputesApi, resolveDisputeApi } from "../api/adminApi";
import Modal from "../components/Modal";

const tabs = ["Overview", "Users", "Disputes"];

export default function AdminDashboard() {
  const [tab, setTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suspendModal, setSuspendModal] = useState({ open: false, userId: null, reason: "" });

  useEffect(() => {
    getAdminStatsApi().then((r) => setStats(r.data)).catch(() => {});
    getUsersApi().then((r) => setUsers(r.data.users || [])).catch(() => {});
    getDisputesApi().then((r) => setDisputes(r.data.disputes || [])).catch(() => {});
    setLoading(false);
  }, []);

  const handleSuspend = async () => {
    await suspendUserApi(suspendModal.userId, suspendModal.reason).catch(() => {});
    setUsers((us) => us.map((u) => u._id === suspendModal.userId ? { ...u, isSuspended: true } : u));
    setSuspendModal({ open: false, userId: null, reason: "" });
  };

  const handleVerify = async (id) => {
    await verifyFreelancerApi(id).catch(() => {});
    setUsers((us) => us.map((u) => u._id === id ? { ...u, isVerified: true } : u));
  };

  const handleResolve = async (id, outcome) => {
    await resolveDisputeApi(id, { outcome }).catch(() => {});
    setDisputes((ds) => ds.map((d) => d._id === id ? { ...d, status: "resolved", resolution: { outcome } } : d));
  };

  const StatBox = ({ icon, label, value, color }) => (
    <div className="stat-card">
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value ?? "—"}</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <DashLayout title="🛡️ Admin Panel" subtitle="Platform management and oversight">
      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid var(--glass-border)" }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: tab === t ? "var(--primary)" : "var(--text-muted)", borderBottom: `2px solid ${tab === t ? "var(--primary)" : "transparent"}`, transition: "all 0.2s", fontFamily: "'Space Grotesk', sans-serif" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
            <StatBox icon="💰" label="Platform Revenue" value={stats?.revenue ? "₹" + stats.revenue.toLocaleString() : "₹0"} color="#10b981" />
            <StatBox icon="👥" label="Total Users" value={stats?.totalUsers} color="#6c63ff" />
            <StatBox icon="🎯" label="Active Freelancers" value={stats?.activeFreelancers} color="#a855f7" />
            <StatBox icon="📋" label="Open Gigs" value={stats?.openGigs} color="#22d3ee" />
            <StatBox icon="⚖️" label="Open Disputes" value={stats?.openDisputes} color="#ef4444" />
            <StatBox icon="✅" label="Job Success Rate" value={stats?.successRate ? stats.successRate + "%" : "—"} color="#f59e0b" />
          </div>
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn-ghost" onClick={() => setTab("Users")} style={{ borderRadius: 10, fontSize: 13 }}>👥 Manage Users</button>
              <button className="btn-ghost" onClick={() => setTab("Disputes")} style={{ borderRadius: 10, fontSize: 13 }}>⚖️ Review Disputes</button>
            </div>
          </div>
        </>
      )}

      {tab === "Users" && (
        <div>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>User</th><th>Role</th><th>Email Verified</th><th>Suspended</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, rgba(108,99,255,0.3), rgba(168,85,247,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{u.name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge badge-${u.role === "admin" ? "danger" : u.role === "freelancer" ? "cyan" : "primary"}`}>{u.role}</span></td>
                    <td>{u.isEmailVerified ? <span className="badge badge-success">✅ Yes</span> : <span className="badge badge-warning">⚠️ No</span>}</td>
                    <td>{u.isSuspended ? <span className="badge badge-danger">Suspended</span> : <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Active</span>}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {!u.isSuspended && u.role !== "admin" && (
                          <button className="btn-danger" onClick={() => setSuspendModal({ open: true, userId: u._id, reason: "" })} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 7 }}>Suspend</button>
                        )}
                        {u.role === "freelancer" && (
                          <button className="btn-success" onClick={() => handleVerify(u._id)} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 7 }}>Verify</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Disputes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {disputes.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚖️</div>
              <h3 style={{ fontWeight: 700 }}>No open disputes</h3>
            </div>
          )}
          {disputes.map((d) => (
            <div key={d._id} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Gig: {d.gig?.title || d.gig?._id}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Raised by: {d.raisedBy?.name} · Against: {d.against?.name}</p>
                </div>
                <span className={`badge badge-${d.status === "open" ? "danger" : d.status === "resolved" ? "success" : "warning"}`}>{d.status}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}><strong>Reason:</strong> {d.reason}<br />{d.description}</p>
              {d.status === "open" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-success" onClick={() => handleResolve(d._id, "refund_client")} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 9 }}>Refund Client</button>
                  <button className="btn-primary" onClick={() => handleResolve(d._id, "pay_freelancer")} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 9 }}>Pay Freelancer</button>
                  <button className="btn-ghost" onClick={() => handleResolve(d._id, "partial_split")} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 9 }}>Split</button>
                </div>
              )}
              {d.status === "resolved" && <span style={{ fontSize: 13, color: "#34d399" }}>✅ Outcome: {d.resolution?.outcome?.replace("_", " ")}</span>}
            </div>
          ))}
        </div>
      )}

      <Modal open={suspendModal.open} onClose={() => setSuspendModal({ open: false, userId: null, reason: "" })} title="Suspend User" width={440}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>This will block the user from accessing their account. You can lift the suspension later.</p>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Reason</label>
            <textarea className="input-glass" rows={3} placeholder="Violation of terms, fraud detected…" value={suspendModal.reason} onChange={(e) => setSuspendModal((s) => ({ ...s, reason: e.target.value }))} style={{ resize: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-ghost" onClick={() => setSuspendModal({ open: false, userId: null, reason: "" })} style={{ flex: 1, borderRadius: 12, padding: "11px" }}>Cancel</button>
            <button className="btn-danger" onClick={handleSuspend} style={{ flex: 1, borderRadius: 12, padding: "11px" }}>Suspend Account</button>
          </div>
        </div>
      </Modal>
    </DashLayout>
  );
}
