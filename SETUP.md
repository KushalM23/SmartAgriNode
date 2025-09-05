# SmartAgriNode - Setup Guide

## 🌱 Project Overview

SmartAgriNode is an AI-powered agriculture platform featuring:
- **Crop Recommendation**: ML model using Random Forest for optimal crop selection
- **Weed Detection**: YOLO-based computer vision for weed identification
- **Modern Web Interface**: Responsive design with red accents and smooth animations

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <your-repo-url>
   cd SmartAgriNode
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the servers**:
   ```bash
   python start_servers.py
   ```

   This will start:
   - Backend API server on `http://localhost:5000`
   - Frontend web server on `http://localhost:3000`

4. **Access the application**:
   - Open your browser and go to `http://localhost:3000`
   - The backend API will be available at `http://localhost:5000`

## 📁 Project Structure

```
SmartAgriNode/
├── backend/
│   └── app.py                 # Backend API server
├── Frontend/
│   ├── app.py                 # Frontend web server
│   ├── index.html             # Main HTML file
│   ├── style.css              # CSS styles
│   └── script.js              # JavaScript functionality
├── Models/
│   ├── crop_recommendation_model.pkl  # Crop ML model
│   └── weed_detection_model.pt        # Weed detection model
├── data/
│   ├── Crop_ds.csv            # Crop dataset
│   └── weeddataset/           # Weed detection dataset
├── requirements.txt           # Python dependencies
└── start_servers.py          # Server startup script
```

## 🔧 Manual Server Setup

If you prefer to run servers separately:

### Backend Server
```bash
cd backend
python app.py
```
Backend runs on: `http://localhost:5000`

### Frontend Server
```bash
cd Frontend
python app.py
```
Frontend runs on: `http://localhost:3000`

## 🌐 Features

### 1. User Authentication
- **Sign Up**: Create new user accounts
- **Login**: Secure user authentication
- **Session Management**: Persistent login sessions

### 2. Crop Recommendation
Input fields for:
- **Nitrogen (N)**: Soil nitrogen content (ppm)
- **Phosphorus (P)**: Soil phosphorus content (ppm)
- **Potassium (K)**: Soil potassium content (ppm)
- **Temperature**: Average temperature (°C)
- **Humidity**: Relative humidity (%)
- **pH**: Soil acidity/alkalinity level
- **Rainfall**: Annual rainfall (mm)

### 3. Weed Detection
- **Image Upload**: Drag & drop or click to upload
- **Supported Formats**: JPG, PNG, GIF, WebP
- **File Size Limit**: 10MB maximum
- **Real-time Processing**: Instant weed detection results

## 🎨 Design Features

- **Modern UI**: Clean, professional interface
- **Red Accent Theme**: Consistent red color scheme
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: CSS transitions and hover effects
- **Pinned Navigation**: Header stays visible while scrolling
- **Loading States**: Visual feedback during processing
- **Toast Notifications**: User-friendly success/error messages

## 🔒 Security Features

- **Password Hashing**: Secure password storage
- **Session Management**: Flask-Login integration
- **CORS Protection**: Cross-origin request security
- **File Validation**: Image type and size validation
- **Input Sanitization**: Form data validation

## 📱 Mobile Responsiveness

The website is fully responsive and includes:
- **Mobile Navigation**: Hamburger menu for small screens
- **Touch-Friendly**: Optimized for touch interactions
- **Adaptive Layout**: Grid layouts adjust to screen size
- **Readable Text**: Appropriate font sizes for all devices

## 🛠️ API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user info

### ML Models
- `POST /api/crop-recommendation` - Get crop recommendations
- `POST /api/weed-detection` - Detect weeds in uploaded image
- `GET /api/health` - Check server and model status

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Kill processes using ports 3000 or 5000
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5000 | xargs kill -9
   ```

2. **Model Loading Errors**:
   - Ensure model files exist in `Models/` directory
   - Check file permissions
   - Verify model file formats (.pkl for crop, .pt for weed)

3. **Database Issues**:
   - Delete `users.db` file to reset database
   - Check SQLite installation

4. **CORS Errors**:
   - Ensure both servers are running
   - Check API_BASE_URL in script.js matches backend URL

### Logs and Debugging

- Backend logs: Check terminal where backend is running
- Frontend logs: Open browser developer tools (F12)
- Network requests: Monitor Network tab in dev tools

## 🔄 Development

### Making Changes

1. **Frontend Changes**:
   - Edit HTML, CSS, or JavaScript files
   - Refresh browser to see changes
   - No server restart needed

2. **Backend Changes**:
   - Edit `backend/app.py`
   - Restart backend server
   - Frontend will automatically reconnect

### Adding New Features

1. **New API Endpoints**:
   - Add routes in `backend/app.py`
   - Update frontend JavaScript to call new endpoints

2. **New Pages**:
   - Add HTML sections in `index.html`
   - Add navigation links
   - Update JavaScript routing

## 📊 Model Information

### Crop Recommendation Model
- **Algorithm**: Random Forest
- **Input Features**: 7 numerical features
- **Output**: Crop recommendation with confidence score
- **Training Data**: Crop_ds.csv dataset

### Weed Detection Model
- **Algorithm**: YOLO (You Only Look Once)
- **Input**: RGB images
- **Output**: Annotated images with detected weeds
- **Training Data**: Custom weed dataset

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check this setup guide
2. Review the troubleshooting section
3. Check browser console for errors
4. Verify all dependencies are installed

---

**Happy Farming with AI! 🌱🤖**
