# SmartAgriNode - AI-Powered Agriculture Dashboard

A comprehensive web dashboard that leverages machine learning for crop recommendation and weed detection in agriculture.

## Features

- **User Authentication**: Secure authentication with Clerk (OAuth, social login, magic links)
- **Crop Recommendation**: AI-powered crop suggestions based on soil and environmental parameters
- **Weed Detection**: Advanced image processing to identify weeds in agricultural images
- **Dashboard**: A web dashboard for viewing all the insights about the soil and climate conditions
- **User History**: Automatic tracking of recommendations and detections (stored in Supabase)

## Technology Stack

### Backend
- **Framework:** FastAPI (async Python web framework)
- **Authentication:** Clerk (JWT-based authentication)
- **Database:** Supabase (PostgreSQL cloud database)
- **ML Libraries:** scikit-learn, joblib, ultralytics (YOLOv8), OpenCV, torch

### Frontend
- **Framework:** React.js with Vite
- **Authentication:** Clerk React SDK
- **HTTP Client:** Fetch API
- **Dependencies:** React Router, ApexCharts

## Project Structure

```
SmartAgriNode/
├── Models/                      # Trained ML model files
│   ├── crop_recommendation_model.pkl
│   └── weed_detection_model.pt
├── backend/                     # FastAPI backend
│   ├── main.py                  # FastAPI application entry point
│   ├── database.py              # Supabase database utilities
│   ├── supabase_schema.sql      # Database schema
│   ├── requirements.txt         # Python dependencies
│   └── uploads/                 # Image upload directory
├── data/                        # Datasets for training/testing
│   ├── weeddataset/             # YOLO format weed detection dataset
│   │   ├── train/
│   │   ├── val/
│   │   ├── test/
│   │   └── data.yaml
│   └── Crop_ds.csv              # Crop recommendation dataset
├── frontend-react/              # React + Vite frontend
│   ├── src/
│   │   ├── Components/          # React components
│   │   ├── lib/                 # API utilities
│   │   ├── App.jsx              # Main app with Clerk provider
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example             # Frontend environment template
├── test_images/                 # Sample images for testing
├── .env.example                 # Backend environment template
├── requirements.txt             # Python backend dependencies
├── setup_database.py            # Database setup helper script
├── start_servers.py             # Start both servers together
├── SETUP_V2.md                  # Detailed setup instructions
├── UPGRADE_SUMMARY.md           # v2.0 upgrade documentation
├── PRD.md                       # Product Requirements Document
└── README.md                    # This file
```

## Quick Start
1. Clone the repository
2. Set up Clerk & Supabase accounts
3. Configure environment variables (.env files)
4. Create & activate Python virtual environment
5. Install backend dependencies (`pip install -r requirements.txt`)
6. Run database schema in Supabase SQL Editor
7. Start servers (`python start_servers.py`)

**Detailed setup instructions available in [SETUP_V2.md](SETUP_V2.md)**

## Setup Instructions

### 1. Clone repo:
```bash
   git clone https://github.com/KushalM23/SmartAgriNode.git
   cd SmartAgriNode
```

### 2. Configure Environment Variables:

**Backend (.env in project root):**
```bash
cp .env.example .env
# Edit .env and add:
# - CLERK_SECRET_KEY (from Clerk dashboard)
# - CLERK_PUBLISHABLE_KEY (from Clerk dashboard)
# - SUPABASE_URL (from Supabase project settings)
# - SUPABASE_ANON_KEY (from Supabase project settings)
# - SUPABASE_SERVICE_ROLE_KEY (from Supabase project settings)
```

**Frontend (.env in frontend-react/):**
```bash
cd frontend-react
cp .env.example .env
# Edit .env and add:
# - VITE_CLERK_PUBLISHABLE_KEY (from Clerk dashboard)
cd ..
```

### 3. Setup Supabase Database:
- Create a Supabase project at https://supabase.com
- Go to SQL Editor and run the schema from `backend/supabase_schema.sql`
- Copy your project URL, anon key, and service role key to `.env`
- Note: You can also run `python setup_database.py` for setup verification

### 4. Setup Clerk Authentication:
- Create a Clerk application at https://clerk.com
- Enable desired authentication methods (email, Google, etc.)
- Copy your publishable key and secret key to `.env` files

### 5. Create and activate Python venv:
```bash
python -m venv venv
source venv/bin/activate   # macOS / Linux
# or
venv\Scripts\activate      # Windows
```

### 6. Install backend dependencies:
```bash
pip install -r requirements.txt
```

### 7. Start servers:
```bash
python start_servers.py
```
The script will automatically install frontend dependencies (npm install) if missing.

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api/docs



## Usage

Once running at http://localhost:5173:

### Sign Up / Log In
- Click "Sign In" in the navigation
- Sign up with email or social providers (Google, GitHub, etc.)
- Clerk handles all authentication securely
- After login, you'll be redirected to the Dashboard

### Crop Recommendation
- Navigate to the "Crop Recommendation" page (requires authentication)
- Enter soil parameters:
  - N (Nitrogen), P (Phosphorus), K (Potassium)
  - Temperature, Humidity, pH
  - Rainfall
- Click "Get Recommendations" to receive AI-powered crop suggestions
- Results are automatically saved to your history in Supabase

### Weed Detection
- Go to the "Weed Detection" page (requires authentication)
- Upload an image of a field/plant (JPG/PNG, max 16MB)
- Click "Detect Weeds"
- The YOLOv8 model detects and highlights weeds with bounding boxes
- Results are automatically saved to your history in Supabase

### Dashboard
- Navigate to "Dashboard" page (requires authentication)
- View soil and climate insights with interactive charts
- Monitor temperature, humidity, and rainfall with radial gauges
- Track soil pH levels with line charts
- View NPK (Nitrogen, Phosphorus, Potassium) values with bar charts
- Access your recommendation and detection history (coming soon)

## API Endpoints

### System
- `GET /` - API information and version
- `GET /api/health` - Check backend server and ML model status

### Authentication
Authentication is handled by Clerk. All protected endpoints require a valid Clerk JWT token in the `Authorization: Bearer <token>` header.

### Machine Learning (Protected)
- `POST /api/crop-recommendation` - Submit soil and climate data for crop recommendations
  - Requires: Authorization header with Clerk token
  - Body: JSON with N, P, K, temperature, humidity, ph, rainfall
- `POST /api/weed-detection` - Upload image for weed detection
  - Requires: Authorization header with Clerk token
  - Body: Multipart form-data with image file

### User History (Protected)
- `GET /api/history` - Retrieve user's crop recommendations and weed detections history
  - Requires: Authorization header with Clerk token
  - Returns: JSON with crop_recommendations and weed_detections arrays

### API Documentation
Interactive API documentation available at:
- Swagger UI: http://localhost:5000/api/docs
- ReDoc: http://localhost:5000/api/redoc
- OpenAPI JSON: http://localhost:5000/api/openapi.json


## Model Information

### Crop Recommendation Model
- **Algorithm**: Random Forest Classifier
- **Input Features**: 7 numerical parameters (N, P, K, temperature, humidity, pH, rainfall)
- **Output**: Recommended crop type with confidence score
- **Model Location**: `Models/crop_recommendation_model.pkl`
- **Training Data**: Agricultural dataset (`data/Crop_ds.csv`) with soil and environmental parameters

### Weed Detection Model
- **Algorithm**: YOLOv8 Object Detection (nano variant)
- **Input**: RGB images (JPG, PNG, JPEG)
- **Output**: Annotated images with bounding boxes around detected weeds
- **Model Location**: `Models/weed_detection_model.pt`
- **Training Data**: Custom weed dataset (`data/weeddataset/`) with labeled images in YOLO format


## Troubleshooting

### npm not found
- Install Node.js + npm from https://nodejs.org
- Ensure `node -v` and `npm -v` work in your terminal
- Restart your terminal/IDE after installation

### Frontend does not start / blank page
- Run manually:
```bash
cd frontend-react
npm install
npm run dev
```
- Check console logs for React errors
- Verify `.env` file exists in `frontend-react/` with correct Clerk key

### Backend not responding
- Run manually:
```bash
cd backend
python -m uvicorn main:app --reload --port 5000
```
- Verify Python dependencies are installed
- Check `.env` file exists in project root
- Ensure virtual environment is activated

### Models not loading
- Ensure required files exist:
  - `Models/crop_recommendation_model.pkl`
  - `Models/weed_detection_model.pt`
- Check file names match exactly what `backend/main.py` expects
- Visit http://localhost:5000/api/health to verify model status

### Authentication errors
- Verify Clerk keys are correct in `.env` files
- Ensure `CLERK_PUBLISHABLE_KEY` matches in both backend and frontend `.env`
- Check Clerk dashboard for any issues
- Restart both servers after changing environment variables

### Database connection errors
- Verify Supabase URL and keys are correct in `.env`
- Check Supabase project is active (not paused)
- Ensure database schema was executed successfully in SQL Editor
- Check Supabase dashboard logs for errors

### Port already in use
- Kill the existing process using ports 5173 (frontend) or 5000 (backend)
- Or change the ports in `start_servers.py`
- On Windows: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`
- On macOS/Linux: `lsof -ti:5000 | xargs kill -9`

### Browser doesn't open automatically
Open manually at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api/docs

For more detailed troubleshooting, see [SETUP_V2.md](SETUP_V2.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the code comments
- Open an issue on GitHub