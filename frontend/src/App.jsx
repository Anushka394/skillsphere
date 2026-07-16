import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import Orbs from "./components/Orbs";
import ProtectedRoute from "./routes/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

import Dashboard from "./pages/Dashboard";
import GigsList from "./pages/GigsList";
import GigDetail from "./pages/GigDetail";
import CreateGig from "./pages/CreateGig";
import MyProfile from "./pages/MyProfile";
import PublicProfile from "./pages/PublicProfile";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import MyProposals from "./pages/MyProposals";

export default function App() {
  const { user } = useSelector((s) => s.auth);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Orbs />
      <Navbar />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/gigs" element={<GigsList />} />
          <Route path="/gigs/:id" element={<GigDetail />} />
          <Route path="/profile/:userId" element={<PublicProfile />} />

          {/* Protected - any auth */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:conversationId" element={<Chat />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/proposals" element={<MyProposals />} />
          </Route>

          {/* Protected - client only */}
          <Route element={<ProtectedRoute allowedRoles={["client", "admin"]} />}>
            <Route path="/gigs/create" element={<CreateGig />} />
          </Route>

          {/* Protected - admin only */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
