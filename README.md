# ✈️ AI-Powered Travel Planner

A full-stack travel planning application where users describe their trip in natural language and receive a structured, day-by-day AI-generated itinerary — powered by the Gemini API and built with the MERN stack.

---

## 🔗 Links

- **Live Demo:** [travel-planner-rho-topaz.vercel.app](https://travel-planner-rho-topaz.vercel.app)
- **GitHub:** [github.com/srijan110705/Travel-Planner](https://github.com/srijan110705/Travel-Planner.git)

---

## ✨ Features

- **AI-Generated Itineraries** — Describe your trip in plain English and receive a structured day-by-day travel plan via Gemini API
- **Natural Language Processing** — No forms or dropdowns; just type what you want (e.g. *"Plan a 5-day budget trip to Tokyo focusing on food and culture"*)
- **JWT Authentication** — Secure user sign-up and login with persistent sessions
- **Group Expense Tracking** — Log expenses in real time; the app automatically calculates who owes whom
- **Trip Dashboard** — Create new trips, manage itineraries, and toggle between Itinerary and Finance views
- **Responsive UI** — Clean, mobile-friendly interface built with Tailwind CSS

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| AI Integration | Google Gemini API |
| Authentication | JSON Web Tokens (JWT) |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

```
Travel-Planner/
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Finances.jsx
│   │   │   ├── ProtectedTripRoute.jsx
│   │   │   └── Itinerary.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── JoinTrip.jsx
│   │   │   ├── MyTrips.jsx
│   │   │   └── CreateTrip.jsx
│   │   └── App.jsx
│
├── backend/                    # Node.js + Express backend
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── trip.controller.js
│   │   └── ai.controller.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── trip.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── trip.routes.js
│   │   └── ai.routes.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── db/
│   │   └── db.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Google Gemini API Key
- npm

### 1. Clone the Repository
```bash
git clone https://github.com/srijan110705/Travel-Planner.git
cd Travel-Planner
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY_1=your_gemini_api_key1
GEMINI_API_KEY_2=your_gemini_api_key2
GEMINI_API_KEY_3=your_gemini_api_key3
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:
```bash
npm run dev
```

---

## 🤖 How the AI Works

```
User types a natural language prompt
        ↓
Frontend sends prompt to Express backend
        ↓
Backend forwards prompt to Gemini API
        ↓
Gemini returns structured JSON itinerary
        ↓
Backend parses and stores itinerary in MongoDB
        ↓
Frontend renders day-by-day travel plan
```

---

## 💰 Expense Tracking Flow

```
User logs an expense with amount and payer
        ↓
Backend calculates total spend per member
        ↓
Fair share = Total spend / Number of members
        ↓
App displays who owes whom and how much
```

---

## 📦 Deployment

- **Frontend** deployed on [Vercel](https://vercel.com)
- **Backend** deployed on [Render](https://render.com)
- CORS configured to allow secure cross-origin communication between frontend and backend
- Environment variables managed separately for production and development

---

## 🔐 Authentication Flow

```
User registers / logs in
        ↓
Backend validates credentials and returns JWT token
        ↓
Token stored securely on the client
        ↓
All protected routes verified via auth middleware
        ↓
User can create and manage their trips
```

---

## 🤝 Collaboration
This project was collaboratively developed by Srijan Ponaganti and Kruthika Reddy as a team project, with contributions spanning frontend development, backend architecture, and AI integration.

---

## 👥 Authors

**Srijan Ponaganti**
- GitHub: [@srijan110705](https://github.com/srijan110705)
- LinkedIn: [Srijan Ponaganti](https://www.linkedin.com/in/srijan-ponaganti-70491b367)
- Email: rao.srijan1175@gmail.com

**Kruthika Reddy**
- GitHub: [@kruthikaa1805](https://github.com/kruthikaa1805)
- LinkedIn: [Kruthika Reddy](https://www.linkedin.com/in/kruthika-reddy-772aa32b2)
- Email: kruthikareddy1805@gmail.com

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
