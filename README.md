# SkillSphere — Intelligent Hyperlocal Freelance Ecosystem

A full-stack MERN platform connecting clients with freelancers — built during Nayoda Full Stack Development Internship.

**Live at**: https://skillsphere-bay.vercel.app/

---

## Tech Stack

**Frontend**: React 18, Redux Toolkit, Vite, Tailwind CSS, Socket.IO Client

**Backend**: Node.js, Express.js, MongoDB Atlas, Socket.IO, JWT

**Integrations**: HuggingFace AI, Cloudinary, Nodemailer (Gmail SMTP)

---

## Key Features

- **Multi-role Auth** — Client, Freelancer with JWT + Email verification
- **Gig Marketplace** — Post gigs with milestones, budget, location filters
- **AI Job Matching** — HuggingFace skill similarity scoring for freelancer recommendations
- **Proposal System** — Submit, accept, reject, negotiate proposals
- **Real-time Chat** — Socket.IO instant messaging with typing indicators
- **Notifications** — Real-time alerts for proposals, messages, reviews
- **Review System** — Weighted reputation scoring with fraud detection

---

## Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev            # runs on port 5000

# Frontend
cd frontend
npm install
npm run dev            # runs on port 5173
```

---

## Development Timeline

| Week | Backend | Frontend |
|---|---|---|
| 1 | Auth, JWT, Profiles | Login, Register, Dashboard |
| 2 | Gig APIs, Proposals, AI Matching | Marketplace, Gig Detail, Proposals |
| 3 | Socket.IO Chat, Reviews, Notifications | Chat UI, Notifications |
| 4 | APIs, Security | Dashboard, UI Polish |

---

*Built for Nayoda Internship — Project Review: 22 July 2026*
