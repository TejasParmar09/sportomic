# Spotomic - How to Run

## Prerequisites
- Node.js installed (v16 or higher)
- MongoDB running locally or connection string configured

## Step 1: Setup Backend

### Install backend dependencies (if not already done)
```powershell
npm install
```

### Create .env file in backend root (if not exists)
Create a `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/spotomic
PORT=5000
NODE_ENV=development
```

### Start Backend Server
```powershell
node server.js
```

Or with nodemon (if installed):
```powershell
npx nodemon server.js
```

Backend will run on: `http://localhost:5000`

---

## Step 2: Setup Frontend

### Navigate to frontend directory
```powershell
cd frontend
```

### Install frontend dependencies (Already done ✅)
```powershell
npm install
```

### Start Frontend Development Server
```powershell
npm run dev
```

Frontend will run on: `http://localhost:3000`

---

## Quick Start (Both Servers)

### Terminal 1 - Backend
```powershell
# In backend directory (D:\Spotomic\backend)
node server.js
```

### Terminal 2 - Frontend  
```powershell
# In backend/frontend directory (D:\Spotomic\backend\frontend)
cd frontend
npm run dev
```

---

## Seed Database (Optional)

To populate database with sample data:

```powershell
# In backend directory
node scripts/seedDatabase.js
```

---

## Production Build

### Build Frontend
```powershell
cd frontend
npm run build
```

### Serve Frontend (using Vite preview)
```powershell
npm run preview
```

---

## Quick Reference

### Backend Server
```powershell
# Terminal 1
node server.js
```

### Frontend Server  
```powershell
# Terminal 2
cd frontend
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

