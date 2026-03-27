# Health Emergency Alert System - Deployment Guide

This guide covers how to deploy the Health Emergency Alert System to production using modern platform-as-a-service (PaaS) providers. The easiest approach is to deploy the **Frontend on Vercel** and the **Backend on Render**.

---

## 1. Prepare the Backend for Production

Your backend uses Node.js, Express, MongoDB, and Socket.io. 

### Step 1: Update CORS Settings
In your `server/index.js`, update the Socket.io and Express CORS to explicitly allow your future frontend URL:

```javascript
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://your-production-frontend-url.vercel.app'],
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: ['http://localhost:5173', 'https://your-production-frontend-url.vercel.app']
}));
```

### Step 2: Define Start Scripts
Ensure your `server/package.json` has a robust start script that doesn't use `nodemon` (nodemon is for dev only).
```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

---

## 2. Deploy the Backend (Render)

Render is great for Node.js backends carrying WebSockets.

1. Push your code to a GitHub repository.
2. Sign up at [Render.com](https://render.com) and click **New > Web Service**.
3. Connect your GitHub and select the repository.
4. Set the **Root Directory** to `server`.
5. Configuration:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add **Environment Variables**:
   - `PORT`: `5000` (Render will assign its own, but it's safe to set this)
   - `MONGO_URI`: `mongodb+srv://<user>:<password>@cluster...` (Your MongoDB Atlas connection string)
   - `JWT_SECRET`: Generate a random long string for this.
7. Click **Create Web Service**. 
8. Once deployed, copy the Render URL (e.g., `https://health-alert-backend.onrender.com`).

---

## 3. Prepare the Frontend for Production

Your frontend uses React, Vite, and Tailwind CSS.

### Step 1: Update API URLs
You need to change all hardcoded `http://localhost:5000` references to use an environment variable so that the deployed app knows where to contact the backend.

Create a `.env` file in the `client/` folder:
```
VITE_API_URL=https://health-alert-backend.onrender.com
```

In your React code (`ChatWindow.jsx`, `Login.jsx`, `socket.js`, etc.), replace `http://localhost:5000` with the Vite variable:

**For Axios calls:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
await axios.post(`${API_URL}/api/messages`, ...);
```

**For Socket.io connection (`services/socket.js`):**
```javascript
import { io } from 'socket.io-client';
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL);
```

### Step 2: Build Verification
Run `npm run build` locally in the `client` folder to ensure Vite builds the site properly without TypeScript or linting errors.

---

## 4. Deploy the Frontend (Vercel)

Vercel is the fastest way to host a Vite app.

1. Sign up at [Vercel.com](https://vercel.com) and click **Add New > Project**.
2. Import your GitHub repository.
3. Set the **Root Directory** to `client` (Click Edit next to Root Directory and select the client folder).
4. Vercel will automatically detect **Vite** as a framework and define the commands (`npm run build`).
5. Add **Environment Variables**:
   - Name: `VITE_API_URL`
   - Value: `https://health-alert-backend.onrender.com` (Your exact Render backend URL)
6. Click **Deploy**.

---

## 5. Security & Final Checks

1. **MongoDB Network Access:** Make sure your MongoDB Atlas cluster allows connections from anywhere (`0.0.0.0/0`) since Render IP addresses are dynamic.
2. **WebSocket WSS:** The frontend will now automatically use Secure WebSockets (`wss://`) when attempting to connect to the Render Backend over `https://`. You do not need to configure anything extra natively for this to work natively.
3. Test a full cycle: Sign up → Dispatch Emergency → Verify Dashboard → Resolve!
