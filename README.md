# StudyBuddyAI

> An AI powered technology built to support students learning process and retain cognitive effort in a world of AI

A typical chatbot --> Give me 200 word essay.. (AI does it)
StudyBuddy --> Give me 200 word essay.. (AI generates ideas, hints and guides for the student to work out the essay by himself and can eventually refine the student idea)

# Tech Stack

## Frontend

* JavaScript
* React
* Vite
* Axios

## Backend

* Node.js
* Express.js
* MongoDB
* Multer for file upload
* JWT


# How I made it?
I built the backend framework, which involves a regular chatbot system i.e a user connected to a regular AI model. However, I furthered implemented context engineering and RAG to ensure that my AI follows a cognitive approach to learning and meets the objective of the application. I built the frontend to be minimalistic which is best for learning. I hosted the frontend and backend respectively and everything worked just as fine!!


# How to Setup?
Follow the steps to run StudyBuddyAI locally.
## 1. Clone the repository
git clone https://github.com/Achiever864/StudyBuddyAI
cd StudyBuddyAI

# Backend setup

Navigate into the backend:

```bash
cd backend
npm run dev
```

### Environment Variables
Create a `.env` file inside the `backend` directory.

```env
NODE_ENV=development_or_production
FRONTEND_URL=http://localhost:5173

PORT=your_port
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=your_callback_url

GEMINI_AI=your_api_key
GEMINI_CHAT_MODEL=your_ai_model
```



### Frontend setup

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

---
# Live Demo URL
https://study-buddy-ai-lemon.vercel.app

---

# Author
**Adeoluwa Igaga**