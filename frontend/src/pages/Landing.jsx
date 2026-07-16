import { useRef } from "react";
import { Link } from "react-router-dom";
import Orbs from "../components/Orbs";
import useTilt from "../hooks/useTilt";

const STATS = [
  { value: "12,000+", label: "Verified Freelancers", icon: "👥" },
  { value: "₹4.2Cr+", label: "Paid Out", icon: "💸" },
  { value: "98%", label: "Job Success Rate", icon: "🏆" },
  { value: "50+", label: "Skill Categories", icon: "🎯" },
];

const FEATURES = [
  { icon: "🤖", title: "AI Job Matching", desc: "HuggingFace-powered skill similarity engine recommends the top freelancers for every gig — not just keyword filters." },
  { icon: "🔒", title: "Escrow Payments", desc: "Clients fund milestones securely. Freelancers get paid automatically on approval. Zero payment disputes." },
  { icon: "📍", title: "Hyperlocal Discovery", desc: "Find verified professionals in your city. Filter by proximity, skill, rating, and hourly rate." },
  { icon: "💬", title: "Real-Time Collaboration", desc: "Instant messaging, file sharing, typing indicators, and optional video calls powered by Socket.IO." },
  { icon: "⭐", title: "Smart Reputation", desc: "Weighted review scores with fraud detection. Verified badges for top-performing freelancers." },
  { icon: "📊", title: "Analytics Dashboards", desc: "Freelancers track earnings and profile views. Clients see project velocity. Admins see everything." },
];

const CATEGORIES = ["Web Dev", "Mobile Apps", "UI/UX Design", "Data Science", "Content Writing", "Digital Marketing", "Video Editing", "AI/ML", "DevOps", "Blockchain"];

const TiltCard = ({ children, style }) => {
  const ref = useRef(null);
  useTilt(ref, 12);
  return (
    <div ref={ref} className="tilt-card glass-card" style={{ padding: 28, ...style }}>
      {children}
    </div>
  );
};

export default function Landing() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <Orbs />

      {/* ── HERO ── */}
      <section className="hero-grid" style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px" }}>
        <div className="animate-fade-up" style={{ marginBottom: 16 }}>
          <span className="badge badge-cyan">🚀 Hyperlocal Freelance Ecosystem</span>
        </div>

        <h1 className="animate-fade-up stagger-1" style={{ fontSize: "clamp(40px, 7vw, 88px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 24 }}>
          Connect. Build.{" "}
          <span className="gradient-text">Get Paid.</span>
        </h1>

        <p className="animate-fade-up stagger-2" style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "var(--text-secondary)", maxWidth: 560, lineHeight: 1.7, marginBottom: 40 }}>
          SkillSphere uses AI to match clients with the best local freelancers — with secure escrow payments, real-time collaboration, and verified reputations.
        </p>

        <div className="animate-fade-up stagger-3" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 60 }}>
          <Link to="/register">
            <button className="btn-primary" style={{ fontSize: 16, padding: "14px 32px", borderRadius: 14 }}>
              Start Free ✨
            </button>
          </Link>
          <Link to="/gigs">
            <button className="btn-ghost" style={{ fontSize: 16, padding: "14px 32px", borderRadius: 14 }}>
              Browse Gigs →
            </button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="animate-fade-up stagger-4" style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
          {STATS.map((s) => (
            <div key={s.label} className="glass" style={{ padding: "16px 24px", borderRadius: 16, textAlign: "center", minWidth: 130 }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: "#f1f5f9" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Floating demo cards — 3D tilt */}
        <div className="animate-fade-up stagger-5" style={{ marginTop: 80, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, width: "100%", maxWidth: 900 }}>
          {[
            { emoji: "🎨", name: "Priya Sharma", role: "UI/UX Designer", score: "98", city: "Mumbai", badge: "Top Rated", color: "#a855f7" },
            { emoji: "⚛️", name: "Arjun Verma",  role: "React Developer",  score: "95", city: "Bangalore", badge: "Verified", color: "#6c63ff" },
            { emoji: "📊", name: "Meera Patel",  role: "Data Scientist",   score: "97", city: "Hyderabad", badge: "Expert", color: "#22d3ee" },
          ].map((f) => (
            <TiltCard key={f.name}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${f.color}40, ${f.color}20)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `1px solid ${f.color}30` }}>{f.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{f.role}</div>
                </div>
                <span className="badge badge-success" style={{ marginLeft: "auto" }}>{f.badge}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>📍 {f.city}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "#fbbf24", fontSize: 14 }}>★</span>
                  <span style={{ fontWeight: 700, color: "#f1f5f9" }}>{f.score}</span>
                </div>
              </div>
              <div className="progress-bar" style={{ marginTop: 14 }}>
                <div className="progress-fill" style={{ width: `${f.score}%` }} />
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="badge badge-primary" style={{ marginBottom: 16, display: "inline-block" }}>Platform Features</span>
          <h2 style={{ fontSize: "clamp(28px,4vw,52px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>
            Everything you need to{" "}
            <span className="gradient-text">freelance smarter</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className="glass-card animate-fade-up" style={{ padding: 28, animationDelay: `${i * 0.1}s`, opacity: 0 }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "60px 24px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20, textTransform: "uppercase", letterSpacing: 2 }}>Popular Categories</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 800, margin: "0 auto" }}>
          {CATEGORIES.map((c) => (
            <Link key={c} to={`/gigs?category=${c}`}>
              <span className="btn-ghost" style={{ fontSize: 13, padding: "8px 18px", borderRadius: 20 }}>{c}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "100px 24px", textAlign: "center" }}>
        <div className="glass" style={{ maxWidth: 700, margin: "0 auto", padding: "60px 40px", borderRadius: 28, background: "linear-gradient(135deg, rgba(108,99,255,0.08), rgba(168,85,247,0.06))", border: "1px solid rgba(108,99,255,0.2)" }}>
          <h2 style={{ fontSize: "clamp(26px,4vw,46px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
            Ready to start your journey?
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 16 }}>Join thousands of freelancers and clients already on SkillSphere.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register?role=freelancer"><button className="btn-primary" style={{ fontSize: 15, padding: "13px 28px" }}>I'm a Freelancer</button></Link>
            <Link to="/register?role=client"><button className="btn-ghost" style={{ fontSize: 15, padding: "13px 28px" }}>I'm Hiring</button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
