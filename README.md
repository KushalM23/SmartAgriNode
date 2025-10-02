# SmartAgriNode - AI-Powered Agriculture Dashboard

A comprehensive web dashboard that leverages machine learning for crop recommendation and weed detection in agriculture.

## Features

- **User Authentication**: Secure login/signup system with session management
- **Crop Recommendation**: AI-powered crop suggestions based on soil and environmental parameters
- **Weed Detection**: Advanced image processing to identify weeds in agricultural images
- **Dashboard**: A web dashboard for viewing all the insights about the soil and climate conditions.

## Technology Stack

### Backend
- **Framework:** Flask, Flask-SQLAlchemy, Flask-Login, Flask-CORS  
- **ML Libraries:** scikit-learn, joblib, ultralytics (YOLOv8), OpenCV, torch  
- **Database:** SQLite, local model files in `Models/`

### Frontend
- **Framework:** React.js  
- **Dependencies:** Axios, standard React libraries

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
2. Create & activate Python venv
3. Install dependencies
4. Start servers

## Setup Instructions

### 1. Clone repo:
```bash
   git clone https://github.com/KushalM23/SmartAgriNode.git
   cd SmartAgriNode
```

### 2. Create and activate Python venv:
```bash
   python3 -m venv venv
   source venv/bin/activate   # macOS / Linux
   # or
   venv\Scripts\activate      # Windows
```

### 3. Install dependencies:
```bash
   pip install -r requirements.txt
```

### 4. Start servers:
```bash
   python start_servers.py
```
The script will automatically install frontend dependencies (npm install) if missing.



## Usage

Once running at http://localhost:3000 :

### Sign Up / Log In
Create an account or log in to access features.

### Crop Recommendation
- Navigate to the "Crop Recommendation" page.
- Enter soil parameters (N, P, K, pH, temperature, humidity, rainfall).
- Click Submit to get the recommended crop.

### Weed Detection
- Go to the "Weed Detection" page.
- Upload an image of a field/plant.
- The model detects and highlights weeds in the image.

### Dashboard
- Navigate to "Dashboard" page.
- View soil and climate insights in an organized dashboard.

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Login a user
- `GET /logout` - Logout current user
- `GET /user` - Get currently logged-in user info

### Machine Learning
- `POST /crop-recommendation` - Submit soil and climate data to get crop recommendations
- `POST /weed-detection` - Upload image for weed detection

### System / Utility
- `GET /health` - Check backend server status


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