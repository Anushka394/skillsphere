# SkillSphere — Intelligent Hyperlocal Freelance Ecosystem

A full-stack MERN platform built for the Nayoda internship.  
**Project review: 22 July 2026**

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Redux Toolkit, React Query, Tailwind CSS, Vite |
| Backend | Node.js, Express.js, MongoDB Atlas, Socket.IO |
| Auth | JWT, Google OAuth 2.0, 2FA (speakeasy), Email verification |
| Payments | Razorpay / Stripe (escrow + milestones) |
| AI Matching | HuggingFace Inference API |
| Files | Cloudinary |
| Email | Nodemailer (SMTP) |

---

## Project Structure

```
skillsphere/
├── backend/
│   ├── config/         db.js, passport.js
│   ├── controllers/    auth, profile, gig, proposal, review, message, payment, notification, admin, search
│   ├── middleware/     authMiddleware.js, errorMiddleware.js
│   ├── models/         User, Freelancer, Client, Gig, Proposal, Review, Message, Payment, Notification, Dispute, AdminLog
│   ├── routes/         all route files
│   ├── utils/          generateToken, sendEmail, socket, aiMatching
│   └── server.js
└── frontend/
    └── src/
        ├── api/        authApi, gigsApi, proposalsApi, profileApi, messagesApi, notificationsApi, adminApi
        ├── components/ Navbar, DashLayout, GigCard, Modal, Orbs
        ├── hooks/      useSocket, useTilt
        ├── pages/      Landing, Login, Register, ForgotPassword, ResetPassword, VerifyEmail,
        │               Dashboard, GigsList, GigDetail, CreateGig, MyProfile, PublicProfile,
        │               Chat, Notifications, MyProposals, AdminDashboard
        ├── redux/      store, slices/authSlice
        └── routes/     ProtectedRoute
```

---

## Setup Instructions

### 1. MongoDB Atlas
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free cluster
2. Database Access → Add user with password
3. Network Access → Allow `0.0.0.0/0`
4. Connect → Copy connection string

### 2. Backend Setup

```bash
cd skillsphere/backend
npm install
cp .env.example .env
```

Fill in `.env`:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/skillsphere
JWT_SECRET=generate_a_long_random_string_here
JWT_REFRESH_SECRET=another_long_random_string_here
CLIENT_URL=http://localhost:5173
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```bash
npm run dev
# → Server running on port 5000
# Test: http://localhost:5000/api/health
```

### 3. Frontend Setup

```bash
cd skillsphere/frontend
npm install
npm run dev
# → App running on http://localhost:5173
```

---

## Week-by-Week Progress

### ✅ Week 1 — Auth + Profiles
- [x] JWT multi-role auth (client / freelancer / admin)
- [x] Google OAuth login
- [x] Email verification
- [x] 2FA with TOTP (speakeasy)
- [x] Password reset via email
- [x] Freelancer + Client profile APIs

### ✅ Week 2 — Gig Marketplace
- [x] Create gigs with milestones, budget, location
- [x] Browse & filter gigs (keyword, category, budget, city, remote)
- [x] Proposal / bidding system
- [x] AI-powered freelancer matching (HuggingFace)
- [x] Advanced search engine (MongoDB Atlas Search)

### ✅ Week 3 — Real-time Features
- [x] Socket.IO instant messaging with typing indicators
- [x] Review & rating system (weighted + fraud detection)
- [x] Real-time notifications (Socket.IO + email)

### ✅ Week 4 — Payments + Admin
- [x] Razorpay escrow + milestone payments
- [x] Admin dashboard (users, gigs, disputes, analytics)
- [x] Freelancer analytics dashboard
- [x] Dispute resolution system
- [x] Full UI polish

---

## Optional Integrations (leave blank until needed)

| Feature | ENV Key | Service |
|---|---|---|
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | [console.cloud.google.com](https://console.cloud.google.com) |
| Email | `SMTP_USER`, `SMTP_PASS` | Gmail App Password |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | [razorpay.com](https://razorpay.com) |
| Cloudinary | `CLOUDINARY_*` | [cloudinary.com](https://cloudinary.com) |
| HuggingFace | `HUGGINGFACE_API_KEY` | [huggingface.co](https://huggingface.co) |

---

## Admin Account

Create one manually in MongoDB Compass or Mongo shell:

```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin", isEmailVerified: true } })
```

---

## Deployment (after July 22 review)

- **Backend**: Railway / Render (free tier)
- **Frontend**: Vercel (`npm run build` → deploy `dist/`)
- **DB**: MongoDB Atlas (already cloud)
