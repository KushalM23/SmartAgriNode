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
├── Models/ # trained model files
├── Notebooks/ # Jupyter notebooks
├── Outputs/ # test runs
│ └── test_runs/
│   └── WeedDetection/
├── backend/ # Flask backend
│ ├── app.py # backend entrypoint
│ ├── instance # saves users.db file
│ └── uploads/ # upload directory (images)
├── data/ # datasets used for training/testing
│ ├── weeddataset 
│ └── Crop_ds.csv
├── frontend-react/ # React frontend
│ ├── package.json
│ ├── package-lock.json
│ ├── public/
│ └── src/
├── instance/ # Flask instance / runtime files (if used)
├── test_images/ # sample images for testing
├── requirements.txt # Python backend dependencies
├── start_servers.py # Start both frontend and backend together
├── SETUP.md # Setup instructions
├── README.md # This file
└── package-lock.json # created by npm
```

## Quick Start
1. Clone the repo
2. Configure environment variables (Clerk & Supabase)
3. Create & activate Python venv
4. Install backend dependencies
5. Install frontend dependencies
6. Start servers

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
- Copy your project URL and anon key to `.env`

### 4. Setup Clerk Authentication:
- Create a Clerk application at https://clerk.com
- Enable desired authentication methods (email, Google, etc.)
- Copy your publishable key and secret key to `.env` files

### 5. Create and activate Python venv:
```bash
   python3 -m venv venv
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



## Usage

Once running at http://localhost:5173 :

### Sign Up / Log In
- Click "Sign In" in the navigation
- Sign up with email or social providers (Google, GitHub, etc.)
- Clerk handles all authentication securely

### Crop Recommendation
- Navigate to the "Crop Recommendation" page
- Enter soil parameters (N, P, K, pH, temperature, humidity, rainfall)
- Click "Get Recommendations" to receive AI-powered crop suggestions
- Results are automatically saved to your history

### Weed Detection
- Go to the "Weed Detection" page
- Upload an image of a field/plant (JPG/PNG, max 16MB)
- Click "Detect Weeds"
- The YOLOv8 model detects and highlights weeds with bounding boxes
- Results are automatically saved to your history

### Dashboard
- Navigate to "Dashboard" page
- View soil and climate insights
- Access your recommendation and detection history

## API Endpoints

### System
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

### API Documentation
Interactive API documentation available at:
- Swagger UI: http://localhost:5000/api/docs
- ReDoc: http://localhost:5000/api/redoc


## Model Information

### Crop Recommendation Model
- **Algorithm**: Random Forest
- **Input Features**: 7 numerical parameters (N, P, K, temperature, humidity, pH, rainfall)
- **Output**: Recommended crop type with confidence score
- **Model Location**: `Models/RandomForest.pkl`
- **Training Data**: Agricultural dataset with soil and environmental parameters

### Weed Detection Model
- **Algorithm**: YOLOv8
- **Input**: RGB images
- **Output**: Annotated images with bounding boxes around detected weeds
- **Model Location**: `Models/YOLOv8.pt`
- **Training Data**: Custom weed dataset with labeled images


## Troubleshooting

### npm not found
- Install Node.js + npm from https://nodejs.org
- Ensure node -v and npm -v work in your terminal

### Frontend does not start / blank page
- Run manually:
```bash
   cd frontend-react
   npm install
   npm start
```
- Check console logs for React errors

### Backend not responding
- Run manually:
```bash
   python backend/app.py
```
- Verify Python dependencies are installed

### Models not loading
- Ensure required .pkl and .pt files are inside Models/
- File names must match what backend/app.py expects

### Port already in use
- Kill the existing process using ports 3000 (frontend) or 5000 (backend)
- Or change the ports in start_servers.py

### Browser doesn’t open automatically
Open manually at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

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