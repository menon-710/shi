# MediCare AI — MERN Stack Medical Chatbot

A full-stack AI-powered medical chatbot built with **MongoDB, Express, React, Node.js**, and **Google Gemini Flash** API.

---

## ✨ Features

- 🤖 **Gemini Flash 2.0** powered medical AI with a deeply personalized 200+ line system prompt
- 🧠 **Full conversation history** stored in MongoDB — AI reads ALL past sessions for continuity
- 👤 **Rich health profiles**: age, BMI, allergies, chronic conditions, medications, lifestyle
- 📋 **Auto-metadata extraction**: symptoms, urgency level, topics discussed — stored per message
- 🔐 **JWT Authentication** — register/login with secure token auth
- 💬 **Multi-session chat** — create, browse, and delete past conversations
- ⚡ **Quick prompts** — pre-built medical question shortcuts
- 📱 **Beautiful UI** — dark mode, markdown rendering, urgency badges
- 🚨 **Emergency detection** — urgency-level tagging on every AI response

---

## 🗂 Project Structure

```
medical-chatbot/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # MongoDB connection
│   │   │   └── gemini.js      # Gemini API + system prompt builder
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── chatController.js
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT middleware
│   │   ├── models/
│   │   │   ├── User.js        # User + health profile schema
│   │   │   └── ChatSession.js # Chat messages + metadata schema
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── chat.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx        # Session list + navigation
    │   │   ├── MessageBubble.jsx  # Chat messages with markdown
    │   │   ├── TypingIndicator.jsx
    │   │   └── ProfileModal.jsx   # Full health profile editor
    │   ├── context/
    │   │   ├── AuthContext.jsx    # Auth state + API calls
    │   │   └── ChatContext.jsx    # Chat state + API calls
    │   ├── pages/
    │   │   ├── AuthPage.jsx       # Login / Register
    │   │   └── ChatPage.jsx       # Main chat interface
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key — [Get one here](https://aistudio.google.com/app/apikey)

### 2. Backend Setup

```bash
cd backend
npm install

# Create your .env file
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medical-chatbot
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

```bash
npm run dev
# Server starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App opens on http://localhost:3000
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update health profile |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/sessions` | List all sessions |
| POST | `/api/chat/sessions` | Create new session |
| GET | `/api/chat/sessions/:id` | Get session with messages |
| DELETE | `/api/chat/sessions/:id` | Delete session |
| POST | `/api/chat/send` | Send message & get AI response |

---

## 🧠 How the AI Personalization Works

Every message to Gemini includes:

1. **System Prompt** (200+ lines) with:
   - Full patient health profile (age, BMI, allergies, conditions, medications)
   - Summary of ALL past conversation history (recurring symptoms, topics)
   - Clinical response structure guidelines
   - Emergency protocols
   - Cultural context (Indian healthcare system)
   - Domain expertise across 15+ medical specialties

2. **Full conversation history** for the current session (multi-turn memory)

3. **Past session summaries** (last 10 sessions) for long-term continuity

The AI then **auto-extracts metadata** from each response:
- Symptoms mentioned
- Urgency level (low / medium / high / emergency)
- Topics discussed

This metadata is stored in MongoDB and fed back into future prompts.

---

## ⚠️ Medical Disclaimer

This application is for **informational purposes only** and does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical decisions.
