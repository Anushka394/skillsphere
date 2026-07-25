import { useState } from "react";
import Modal from "./Modal";
import api from "../api/axios";

export default function ReviewModal({ open, onClose, gigId, revieweeId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/reviews", { gigId, revieweeId, rating, comment });
      setDone(true);
      setTimeout(() => { setDone(false); onClose(); }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="⭐ Leave a Review" width={480}>
      {done ? (
        <div style={{ textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontWeight: 700 }}>Review submitted!</h3>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Star rating */}
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Rating</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)}
                  style={{ fontSize: 32, background: "none", border: "none", cursor: "pointer", filter: star <= rating ? "none" : "grayscale(1) opacity(0.3)", transition: "all 0.2s" }}>
                  ⭐
                </button>
              ))}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Comment</label>
            <textarea className="input-glass" placeholder="Share your experience working with this person..." rows={4}
              value={comment} onChange={(e) => setComment(e.target.value)}
              style={{ resize: "vertical", minHeight: 100 }} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1, borderRadius: 12, padding: "12px" }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, borderRadius: 12, padding: "12px" }}>
              {loading ? "Submitting…" : "Submit Review ⭐"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}