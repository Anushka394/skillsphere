import { useEffect, useState } from "react";
import DashLayout from "../components/DashLayout";
import { getNotificationsApi, markReadApi, markAllReadApi } from "../api/notificationsApi";

const TYPE_ICONS = {
  new_gig_posted: "🎯", proposal_received: "📩", proposal_accepted: "✅", proposal_rejected: "❌",
  payment_received: "💰", review_added: "⭐", message_received: "💬", dispute_update: "⚖️",
  milestone_update: "🏁", account_alert: "🔔",
};

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotificationsApi().then((r) => setNotifs(r.data.notifications || [])).finally(() => setLoading(false));
  }, []);

  const handleRead = async (id) => {
    await markReadApi(id).catch(() => {});
    setNotifs((ns) => ns.map((n) => n._id === id ? { ...n, isRead: true } : n));
  };

  const handleReadAll = async () => {
    await markAllReadApi().catch(() => {});
    setNotifs((ns) => ns.map((n) => ({ ...n, isRead: true })));
  };

  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <DashLayout title="Notifications" subtitle={unread > 0 ? `${unread} unread` : "You're all caught up"}>
      {unread > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button className="btn-ghost" onClick={handleReadAll} style={{ borderRadius: 10, padding: "8px 16px", fontSize: 13 }}>Mark all as read</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => <div key={i} className="shimmer" style={{ height: 70, borderRadius: 14 }} />)}
        </div>
      ) : notifs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No notifications yet</h3>
          <p style={{ fontSize: 14 }}>Activity from gigs, messages and payments will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifs.map((n) => (
            <div key={n._id} onClick={() => !n.isRead && handleRead(n._id)}
              style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 20px", borderRadius: 14, cursor: "pointer", transition: "all 0.2s",
                background: n.isRead ? "rgba(255,255,255,0.02)" : "rgba(108,99,255,0.07)",
                border: `1px solid ${n.isRead ? "var(--glass-border)" : "rgba(108,99,255,0.2)"}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: n.isRead ? "rgba(255,255,255,0.04)" : "rgba(108,99,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {TYPE_ICONS[n.type] || "🔔"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: 14, marginBottom: 3 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(n.createdAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", flexShrink: 0, marginTop: 6 }} />}
            </div>
          ))}
        </div>
      )}
    </DashLayout>
  );
}
