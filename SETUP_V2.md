# SmartAgriNode v2.0 - Setup Guide

## Overview
SmartAgriNode v2.0 uses modern cloud services for authentication and database management:
- **Backend:** FastAPI (Python)
- **Frontend:** React with Vite
- **Authentication:** Clerk
- **Database:** Supabase (PostgreSQL)
- **ML Models:** Random Forest + YOLOv8

---

## Prerequisites

### Required Software
- **Python 3.8+** - [Download](https://python.org)
- **Node.js 16+** - [Download](https://nodejs.org)
- **Git** - [Download](https://git-scm.com)

### Required Accounts
- **Clerk Account** - [Sign up](https://clerk.com) (Free tier available)
- **Supabase Account** - [Sign up](https://supabase.com) (Free tier available)

---

## Step 1: Clone Repository

```bash
git clone https://github.com/KushalM23/SmartAgriNode.git
cd SmartAgriNode
```

---

## Step 2: Setup Clerk Authentication

### 2.1 Create Clerk Application
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click "Create Application"
3. Name it "SmartAgriNode" (or your preference)
4. Select authentication methods:
   - ✅ Email (with password)
   - ✅ Google OAuth (optional)
   - ✅ GitHub OAuth (optional)
5. Click "Create Application"

### 2.2 Get Clerk API Keys
1. In your Clerk dashboard, go to "API Keys"
2. Copy the following keys:
   - **Publishable Key** (starts with `pk_test_...`)
   - **Secret Key** (starts with `sk_test_...`)
3. Keep these safe - you'll need them in Step 4

### 2.3 Configure Allowed Origins (Optional for production)
1. Go to "Settings" → "Domains"
2. Add your production domain when deploying

---

## Step 3: Setup Supabase Database

### 3.1 Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name:** SmartAgriNode
   - **Database Password:** (create a strong password - save it!)
   - **Region:** Choose closest to your users
4. Wait 2-3 minutes for project creation

### 3.2 Create Database Schema
1. In Supabase dashboard, go to "SQL Editor"
2. Click "New Query"
3. Open `backend/supabase_schema.sql` from your local repo
4. Copy the entire SQL content and paste into Supabase SQL Editor
5. Click "Run" to execute the schema
6. Verify tables created: Go to "Table Editor" - you should see:
   - `users`
   - `crop_recommendations`
   - `weed_detections`

### 3.3 Get Supabase API Keys
1. Go to "Settings" → "API"
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)
   - **Service Role Key** (starts with `eyJ...` - keep this secret!)

---

## Step 4: Configure Environment Variables

### 4.1 Backend Configuration

Create `.env` file in project root:

```bash
# In project root (SmartAgriNode/)
cp .env.example .env
```

Edit `.env` and add your keys:

```env
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Application Configuration
ENVIRONMENT=development
DEBUG=True
```

### 4.2 Frontend Configuration

Create `.env` file in `frontend-react/`:

```bash
# In frontend-react/ directory
cd frontend-react
cp .env.example .env
```

Edit `frontend-react/.env`:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
```

**Important:** Return to project root:
```bash
cd ..
```

---

## Step 5: Install Dependencies

### 5.1 Create Python Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 5.2 Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- FastAPI & Uvicorn
- Supabase client
- ML libraries (scikit-learn, ultralytics, PyTorch)
- Image processing (OpenCV, Pillow)

### 5.3 Install Frontend Dependencies

Frontend dependencies are automatically installed by `start_servers.py`, but you can install manually:

```bash
cd frontend-react
npm install
cd ..
```

---

## Step 6: Start the Application

### 6.1 Using Start Script (Recommended)

```bash
python start_servers.py
```

This script will:
1. Start FastAPI backend on http://localhost:5000
2. Install frontend dependencies (if needed)
3. Start React dev server on http://localhost:5173

### 6.2 Manual Start (Alternative)

**Terminal 1 - Backend:**
```bash
# Make sure venv is activated
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend-react
npm run dev
```

---

## Step 7: Verify Installation

### 7.1 Check Backend Health

Open browser: http://localhost:5000/api/health

Expected response:
```json
{
  "status": "healthy",
  "crop_model_loaded": true,
  "weed_model_loaded": true,
  "models_loaded": true
}
```

### 7.2 Check API Documentation

- **Swagger UI:** http://localhost:5000/api/docs
- **ReDoc:** http://localhost:5000/api/redoc

### 7.3 Access Frontend

Open browser: http://localhost:5173

You should see the SmartAgriNode home page.

---

## Step 8: Test Authentication Flow

1. Click "Sign In" button
2. You'll see Clerk's authentication UI
3. Sign up with email or social provider
4. After successful authentication, you'll be redirected to Dashboard
5. Try navigating to "Crop Recommendation" or "Weed Detection"

---

## Step 9: Test ML Features

### Test Crop Recommendation
1. Navigate to "Crop Recommendation"
2. Enter test values:
   - N: 90
   - P: 42
   - K: 43
   - Temperature: 20.8
   - Humidity: 82
   - pH: 6.5
   - Rainfall: 202.9
3. Click "Get Recommendations"
4. Verify you receive a crop recommendation

### Test Weed Detection
1. Navigate to "Weed Detection"
2. Upload a test image from `test_images/` folder
3. Click "Detect Weeds"
4. Verify you see annotated image with bounding boxes

---

## Troubleshooting

### Backend won't start
- ✅ Check Python virtual environment is activated
- ✅ Verify all dependencies installed: `pip list`
- ✅ Check `.env` file exists in project root
- ✅ Verify ML model files exist in `Models/` folder

### Frontend won't start
- ✅ Check Node.js and npm installed: `node -v` and `npm -v`
- ✅ Try manual install: `cd frontend-react && npm install`
- ✅ Check `.env` file exists in `frontend-react/`

### Authentication not working
- ✅ Verify Clerk keys in both `.env` files
- ✅ Check Clerk publishable key matches in frontend `.env`
- ✅ Ensure no typos in environment variable names
- ✅ Restart both servers after changing `.env`

### Database errors
- ✅ Verify Supabase URL and keys are correct
- ✅ Check Supabase project is active (not paused)
- ✅ Verify SQL schema was executed successfully
- ✅ Check Supabase dashboard for any error logs

### ML models not loading
- ✅ Verify model files exist:
  - `Models/crop_recommendation_model.pkl`
  - `Models/weed_detection_model.pt`
- ✅ Check terminal output for model loading messages
- ✅ Visit `/api/health` to see model status

### CORS errors
- ✅ Ensure frontend is running on port 5173 or 3000
- ✅ Check CORS origins in `backend/main.py` match your frontend URL
- ✅ Clear browser cache and cookies

---

## Development Tips

### Hot Reload
Both servers support hot reload:
- **Backend:** Changes to `.py` files auto-reload
- **Frontend:** Changes to `.jsx` files auto-update in browser

### Viewing Logs
- **Backend logs:** Check terminal running `start_servers.py`
- **Frontend logs:** Check browser console (F12)
- **Supabase logs:** Check Supabase dashboard → Logs

### Database Management
- View data: Supabase Dashboard → Table Editor
- Run queries: Supabase Dashboard → SQL Editor
- Monitor usage: Supabase Dashboard → Settings → Usage

---

## Production Deployment (Coming Soon)

For production deployment, consider:
- Deploy backend to Railway, Render, or AWS
- Deploy frontend to Vercel, Netlify, or Cloudflare Pages
- Update Clerk allowed origins
- Configure Supabase RLS policies
- Enable HTTPS
- Update CORS settings
- Use production environment variables

---

## Getting Help

- **GitHub Issues:** [Create an issue](https://github.com/KushalM23/SmartAgriNode/issues)
- **Clerk Docs:** https://clerk.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com

---

## Next Steps

After successful setup:
1. Explore the API documentation at `/api/docs`
2. Test all features thoroughly
3. Check Supabase database for stored history
4. Customize the UI in `frontend-react/src/Components/`
5. Train models with your own data (see `Notebooks/`)

Happy farming! 🌱
