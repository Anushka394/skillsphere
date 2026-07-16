import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getGigsApi } from "../api/gigsApi";
import GigCard from "../components/GigCard";
import Orbs from "../components/Orbs";

const CATEGORIES = ["", "Web Dev", "Mobile Apps", "UI/UX Design", "Data Science", "Content Writing", "Digital Marketing", "Video Editing", "AI/ML", "DevOps", "Blockchain"];

export default function GigsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gigs, setGigs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    category: searchParams.get("category") || "",
    minBudget: "", maxBudget: "",
    remote: "",
    city: "",
  });

  const fetchGigs = async (f = filters, p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 12, ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)) };
      const { data } = await getGigsApi(params);
      setGigs(data.gigs || []); setTotal(data.total || 0); setPage(p);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGigs(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchGigs(filters, 1); };
  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", padding: "40px 24px", maxWidth: 1300, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <span className="badge badge-cyan" style={{ marginBottom: 12, display: "inline-block" }}>Marketplace</span>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, marginBottom: 8 }}>
          Find your next <span className="gradient-text">opportunity</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>{total.toLocaleString()} gigs available</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 28, alignItems: "start" }}>
        {/* Sidebar Filters */}
        <aside>
          <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 14 }}>Search</h3>
              <input className="input-glass" placeholder="React, design, Python…" value={filters.keyword}
                onChange={(e) => setFilter("keyword", e.target.value)} />
            </div>
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 14 }}>Category</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {CATEGORIES.map((c) => (
                  <button key={c} type="button"
                    onClick={() => setFilter("category", c)}
                    style={{ textAlign: "left", padding: "8px 12px", borderRadius: 8, border: "1px solid", fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                      background: filters.category === c ? "rgba(108,99,255,0.15)" : "transparent",
                      borderColor: filters.category === c ? "rgba(108,99,255,0.4)" : "transparent",
                      color: filters.category === c ? "#a5a0ff" : "var(--text-secondary)" }}>
                    {c || "All Categories"}
                  </button>
                ))}
              </div>
            </div>
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 14 }}>Budget (₹)</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input-glass" placeholder="Min" value={filters.minBudget} onChange={(e) => setFilter("minBudget", e.target.value)} />
                <input className="input-glass" placeholder="Max" value={filters.maxBudget} onChange={(e) => setFilter("maxBudget", e.target.value)} />
              </div>
            </div>
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 14 }}>Location</h3>
              <input className="input-glass" placeholder="City…" style={{ marginBottom: 10 }} value={filters.city} onChange={(e) => setFilter("city", e.target.value)} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>
                <input type="checkbox" checked={filters.remote === "true"} onChange={(e) => setFilter("remote", e.target.checked ? "true" : "")} /> Remote only
              </label>
            </div>
            <button className="btn-primary" type="submit" style={{ borderRadius: 12, padding: "12px", fontSize: 14 }}>Apply Filters 🔍</button>
            <button className="btn-ghost" type="button" style={{ borderRadius: 12, padding: "10px", fontSize: 13 }}
              onClick={() => { setFilters({ keyword: "", category: "", minBudget: "", maxBudget: "", remote: "", city: "" }); fetchGigs({ keyword: "", category: "", minBudget: "", maxBudget: "", remote: "", city: "" }); }}>
              Clear All
            </button>
          </form>
        </aside>

        {/* Gig Grid */}
        <div>
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shimmer" style={{ height: 220, borderRadius: 20 }} />
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 40px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No gigs found</h3>
              <p style={{ fontSize: 14 }}>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {gigs.map((g) => <GigCard key={g._id} gig={g} />)}
              </div>
              {/* Pagination */}
              {total > 12 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
                  {Array.from({ length: Math.ceil(total / 12) }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => fetchGigs(filters, p)}
                      style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                        background: p === page ? "var(--primary)" : "transparent",
                        borderColor: p === page ? "var(--primary)" : "var(--glass-border)",
                        color: p === page ? "white" : "var(--text-muted)" }}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
