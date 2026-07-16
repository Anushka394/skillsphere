import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashLayout from "../components/DashLayout";
import { createGigApi } from "../api/gigsApi";

const CATEGORIES = ["Web Dev", "Mobile Apps", "UI/UX Design", "Data Science", "Content Writing", "Digital Marketing", "Video Editing", "AI/ML", "DevOps", "Blockchain"];

const emptyMilestone = () => ({ title: "", description: "", amount: "" });

export default function CreateGig() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "", description: "", category: "", skillsRequired: "",
    budgetMin: "", budgetMax: "", budgetType: "fixed",
    isRemote: true, city: "",
    deadline: "",
  });
  const [milestones, setMilestones] = useState([emptyMilestone()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addMilestone = () => setMilestones((m) => [...m, emptyMilestone()]);
  const setMilestone = (i, k, v) => setMilestones((ms) => ms.map((m, idx) => idx === i ? { ...m, [k]: v } : m));
  const removeMilestone = (i) => setMilestones((ms) => ms.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const payload = {
        title: form.title, description: form.description, category: form.category,
        skillsRequired: form.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
        budget: { min: Number(form.budgetMin), max: Number(form.budgetMax), type: form.budgetType },
        location: { isRemote: form.isRemote, city: form.city },
        milestones: milestones.filter((m) => m.title).map((m) => ({ ...m, amount: Number(m.amount) })),
        deadline: form.deadline || undefined,
      };
      const { data } = await createGigApi(payload);
      navigate(`/gigs/${data.gig._id}`);
    } catch (err) { setError(err.response?.data?.message || "Failed to create gig"); }
    finally { setLoading(false); }
  };

  const inputLabel = (text) => (
    <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{text}</label>
  );

  return (
    <DashLayout title="Post a Gig" subtitle="Find the perfect freelancer with AI matching">
      {/* Step indicator */}
      <div style={{ display: "flex", gap: 0, marginBottom: 32, maxWidth: 500 }}>
        {["Basics", "Budget & Location", "Milestones"].map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <div style={{ flex: 1, height: 2, background: step > i ? "var(--primary)" : "var(--glass-border)", transition: "background 0.3s" }} />}
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: step > i ? "var(--primary)" : step === i + 1 ? "rgba(108,99,255,0.3)" : "transparent", border: `2px solid ${step >= i + 1 ? "var(--primary)" : "var(--glass-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: step >= i + 1 ? "white" : "var(--text-muted)", transition: "all 0.3s", flexShrink: 0 }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? "var(--primary)" : "var(--glass-border)" }} />}
            </div>
            <div style={{ fontSize: 11, color: step === i + 1 ? "var(--primary)" : "var(--text-muted)", marginTop: 6 }}>{s}</div>
          </div>
        ))}
      </div>

      {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#f87171" }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="glass-card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20, maxWidth: 680 }}>
            <div>
              {inputLabel("Gig Title")}
              <input className="input-glass" placeholder="e.g. Build a React dashboard with real-time updates" required value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              {inputLabel("Description")}
              <textarea className="input-glass" placeholder="Describe the project requirements, deliverables, and any specific technical details…" required rows={5}
                value={form.description} onChange={(e) => set("description", e.target.value)} style={{ resize: "vertical", minHeight: 130 }} />
            </div>
            <div>
              {inputLabel("Category")}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
                {CATEGORIES.map((c) => (
                  <button key={c} type="button" onClick={() => set("category", c)}
                    style={{ padding: "10px 8px", borderRadius: 10, border: `1px solid ${form.category === c ? "rgba(108,99,255,0.5)" : "var(--glass-border)"}`, background: form.category === c ? "rgba(108,99,255,0.15)" : "transparent", color: form.category === c ? "#a5a0ff" : "var(--text-muted)", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.2s" }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              {inputLabel("Skills Required (comma separated)")}
              <input className="input-glass" placeholder="React, Node.js, MongoDB, TypeScript" value={form.skillsRequired} onChange={(e) => set("skillsRequired", e.target.value)} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="btn-primary" style={{ borderRadius: 12, padding: "12px 28px" }}
                disabled={!form.title || !form.description || !form.category}
                onClick={() => setStep(2)}>
                Next: Budget →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Budget & Location */}
        {step === 2 && (
          <div className="glass-card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20, maxWidth: 680 }}>
            <div>
              {inputLabel("Budget Type")}
              <div style={{ display: "flex", gap: 10 }}>
                {["fixed", "hourly"].map((t) => (
                  <button key={t} type="button" onClick={() => set("budgetType", t)}
                    style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${form.budgetType === t ? "rgba(108,99,255,0.5)" : "var(--glass-border)"}`, background: form.budgetType === t ? "rgba(108,99,255,0.15)" : "transparent", color: form.budgetType === t ? "#a5a0ff" : "var(--text-muted)", cursor: "pointer", fontSize: 14, fontWeight: 600, textTransform: "capitalize", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {t === "fixed" ? "💼 Fixed Price" : "⏰ Hourly Rate"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                {inputLabel("Min Budget (₹)")}
                <input className="input-glass" type="number" placeholder="5000" required min={1} value={form.budgetMin} onChange={(e) => set("budgetMin", e.target.value)} />
              </div>
              <div>
                {inputLabel("Max Budget (₹)")}
                <input className="input-glass" type="number" placeholder="20000" required min={1} value={form.budgetMax} onChange={(e) => set("budgetMax", e.target.value)} />
              </div>
            </div>
            <div>
              {inputLabel("Deadline (optional)")}
              <input className="input-glass" type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} min={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              {inputLabel("Location")}
              <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={form.isRemote} onChange={(e) => set("isRemote", e.target.checked)} />
                <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Remote work accepted</span>
              </label>
              {!form.isRemote && <input className="input-glass" placeholder="City (e.g. Mumbai)" value={form.city} onChange={(e) => set("city", e.target.value)} />}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn-ghost" onClick={() => setStep(1)} style={{ borderRadius: 12, padding: "12px 24px" }}>← Back</button>
              <button type="button" className="btn-primary" onClick={() => setStep(3)} disabled={!form.budgetMin || !form.budgetMax} style={{ borderRadius: 12, padding: "12px 28px" }}>Next: Milestones →</button>
            </div>
          </div>
        )}

        {/* Step 3: Milestones */}
        {step === 3 && (
          <div style={{ maxWidth: 680 }}>
            <div className="glass-card" style={{ padding: 32, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Project Milestones</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Break the project into payment stages</p>
                </div>
                <button type="button" className="btn-ghost" onClick={addMilestone} style={{ borderRadius: 10, padding: "8px 16px", fontSize: 13 }}>+ Add</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {milestones.map((m, i) => (
                  <div key={i} style={{ padding: 20, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Milestone {i + 1}</span>
                      {milestones.length > 1 && <button type="button" onClick={() => removeMilestone(i)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 10 }}>
                      <input className="input-glass" placeholder="Milestone title (e.g. Design mockups)" value={m.title} onChange={(e) => setMilestone(i, "title", e.target.value)} />
                      <input className="input-glass" type="number" placeholder="₹ Amount" value={m.amount} onChange={(e) => setMilestone(i, "amount", e.target.value)} style={{ width: 120 }} />
                    </div>
                    <input className="input-glass" placeholder="Description (optional)" value={m.description} onChange={(e) => setMilestone(i, "description", e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn-ghost" onClick={() => setStep(2)} style={{ borderRadius: 12, padding: "12px 24px" }}>← Back</button>
              <button type="submit" className="btn-primary" disabled={loading} style={{ borderRadius: 12, padding: "12px 28px" }}>
                {loading ? "Posting…" : "🚀 Post Gig"}
              </button>
            </div>
          </div>
        )}
      </form>
    </DashLayout>
  );
}
