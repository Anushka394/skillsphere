import { useState } from "react";
import api from "../api/axios";

export default function PaymentButton({ gigId, milestoneId, amount, milestoneName, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Create order on backend
      const { data } = await api.post("/payments/order", {
        gigId, milestoneId, amount,
      });

      // Open Razorpay popup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "SkillSphere",
        description: `Payment for: ${milestoneName}`,
        order_id: data.orderId,
        handler: async (response) => {
          // Verify payment
          await api.post("/payments/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            paymentId: data.paymentId,
          });
          onSuccess?.();
          alert("✅ Payment successful! Amount held in escrow.");
        },
        prefill: { name: "SkillSphere User" },
        theme: { color: "#6c63ff" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="btn-primary"
      style={{ borderRadius: 12, padding: "12px 20px", fontSize: 14, width: "100%" }}>
      {loading ? "Loading…" : `💳 Pay ₹${amount?.toLocaleString()} (Escrow)`}
    </button>
  );
}