import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DashLayout from "../components/DashLayout";
import { getMyProfileApi, updateMyProfileApi, updateFreelancerProfileApi, updateClientProfileApi } from "../api/profileApi";

const PROFICIENCIES = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function MyProfile() {
  const { user } = useSelector((s) => s.auth);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("basic");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Basic fields
  const [basic, setBasic] = useState({ name: "", phone: "", city: "", state: "", country: "" });
  // Freelancer fields
  const [fl, setFl] = useState({ title: "", bio: "", pricing: { hourlyRate: "", milestoneBased: true }, skills: [], resumeUrl: "" });
  const [newSkill, setNewSkill] = useState({ name: "", proficiency: "Intermediate" });

  useEffect(() => {
    getMyProfileApi().then((r) => {
      const u = r.data.user;
      const p = r.data.profile;
      setProfile(p);
      setBasic({ name: u.name || "", phone: u.phone || "", city: u.location?.city || "", state: u.location?.state || "", country: u.location?.country || "" });
      if (u.role === "freelancer" && p) {
        setFl({ title: p.title || "", bio: p.bio || "", pricing: { hourlyRate: p.pricing?.hourlyRate || "", milestoneBased: p.pricing?.milestoneBased ?? true }, skills: p.skills || [], resumeUrl: p.resumeUrl || "" });
      }
    });
  }, []);

  const saveBasic = async () => {
    setLoading(true);
    try {
      await updateMyProfileApi({ name: basic.name, phone: basic.phone, location: { city: basic.city, state: basic.state, country: basic.country } });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch {}
    finally { setLoading(false); }
  };

  const saveFreelancer = async () => {
    setLoading(true);
    try {
      await updateFreelancerProfileApi({ title: fl.title, bio: fl.bio, skills: fl.skills, pricing: { hourlyRate: Number(fl.pricing.hourlyRate), milestoneBased: fl.pricing.milestoneBased }, resumeUrl: fl.resumeUrl });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch {}
    finally { setLoading(false); }
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    setFl((f) => ({ ...f, skills: [...f.skills, { name: newSkill.name.trim(), proficiency: newSkill.proficiency }] }));
    setNewSkill({ name: "", proficiency: "Intermediate" });
  };
  const removeSkill = (i) => setFl((f) => ({ ...f, skills: f.skills.filter((_, idx) => idx !== i) }));

  const tabs = [{ key: "basic", label: "Basic Info" }, ...(user?.role === "freelancer" ? [{ key: "freelancer", label: "Freelancer Profile" }] : [{ key: "client", label: "Business Info" }])];

  const inputLabel = (t) => <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{t}</label>;

  return (
    <DashLayout title="Your Profile" subtitle="Manage your public profile and settings">
      {saved && (
        <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, padding: "12px 20px", marginBottom: 20, fontSize: 14, color: "#34d399" }}>
          ✅ Profile saved!
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid var(--glass-border)", paddingBottom: 0 }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: tab === t.key ? "var(--primary)" : "var(--text-muted)", borderBottom: `2px solid ${tab === t.key ? "var(--primary)" : "transparent"}`, transition: "all 0.2s", fontFamily: "'Space Grotesk', sans-serif" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "basic" && (
        <div className="glass-card" style={{ padding: 32, maxWidth: 600, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, rgba(108,99,255,0.4), rgba(168,85,247,0.3))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, border: "2px solid rgba(108,99,255,0.4)" }}>
              {basic.name?.[0] || user?.name?.[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{basic.name || user?.name}</div>
              <span className={`badge badge-${user?.isEmailVerified ? "success" : "warning"}`} style={{ marginTop: 4 }}>
                {user?.isEmailVerified ? "✅ Verified" : "⚠️ Unverified"}
              </span>
            </div>
          </div>
          <div>
            {inputLabel("Full Name")}
            <input className="input-glass" value={basic.name} onChange={(e) => setBasic({ ...basic, name: e.target.value })} />
          </div>
          <div>
            {inputLabel("Phone")}
            <input className="input-glass" placeholder="+91 98765 43210" value={basic.phone} onChange={(e) => setBasic({ ...basic, phone: e.target.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              {inputLabel("City")}
              <input className="input-glass" placeholder="Mumbai" value={basic.city} onChange={(e) => setBasic({ ...basic, city: e.target.value })} />
            </div>
            <div>
              {inputLabel("Country")}
              <input className="input-glass" placeholder="India" value={basic.country} onChange={(e) => setBasic({ ...basic, country: e.target.value })} />
            </div>
          </div>
          <button className="btn-primary" onClick={saveBasic} disabled={loading} style={{ borderRadius: 12, padding: "12px 28px", alignSelf: "flex-start" }}>
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}

      {tab === "freelancer" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 680 }}>
          <div className="glass-card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 18 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Professional Info</h3>
            <div>
              {inputLabel("Professional Title")}
              <input className="input-glass" placeholder="e.g. Full Stack React Developer" value={fl.title} onChange={(e) => setFl({ ...fl, title: e.target.value })} />
            </div>
            <div>
              {inputLabel("Bio")}
              <textarea className="input-glass" placeholder="Tell clients about your expertise, experience, and what makes you stand out…" rows={4} value={fl.bio} onChange={(e) => setFl({ ...fl, bio: e.target.value })} style={{ resize: "vertical", minHeight: 110 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                {inputLabel("Hourly Rate (₹)")}
                <input className="input-glass" type="number" placeholder="500" value={fl.pricing.hourlyRate} onChange={(e) => setFl({ ...fl, pricing: { ...fl.pricing, hourlyRate: e.target.value } })} />
              </div>
              <div>
                {inputLabel("Resume URL")}
                <input className="input-glass" placeholder="https://drive.google.com/…" value={fl.resumeUrl} onChange={(e) => setFl({ ...fl, resumeUrl: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="glass-card" style={{ padding: 32 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Skills</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {fl.skills.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.25)" }}>
                  <span style={{ fontSize: 13, color: "#a5a0ff", fontWeight: 600 }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>· {s.proficiency}</span>
                  <button onClick={() => removeSkill(i)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, lineHeight: 1, marginLeft: 2 }}>✕</button>
                </div>
              ))}
              {fl.skills.length === 0 && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>No skills added yet.</span>}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input className="input-glass" placeholder="Skill name" style={{ flex: 1, minWidth: 150 }} value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
              <select className="input-glass" style={{ width: 140 }} value={newSkill.proficiency} onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}>
                {PROFICIENCIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <button className="btn-ghost" onClick={addSkill} style={{ borderRadius: 10, padding: "10px 16px", fontSize: 13 }}>+ Add</button>
            </div>
          </div>

          <button className="btn-primary" onClick={saveFreelancer} disabled={loading} style={{ borderRadius: 12, padding: "12px 28px", alignSelf: "flex-start" }}>
            {loading ? "Saving…" : "Save Profile"}
          </button>
        </div>
      )}
    </DashLayout>
  );
}
