# SmartAgriNode - AI-Powered Agriculture Dashboard

A comprehensive web dashboard that leverages machine learning for crop recommendation and weed detection in agriculture.

## Features

- **User Authentication**: Secure login/signup system with session management
- **Crop Recommendation**: AI-powered crop suggestions based on soil and environmental parameters
- **Weed Detection**: Advanced image processing to identify weeds in agricultural images
- **Modern UI**: Beautiful, responsive design with red accents and smooth animations
- **Real-time Processing**: Instant results with loading indicators and notifications

## Technology Stack

### Backend
- **Flask**: Python web framework
- **Flask-SQLAlchemy**: Database ORM
- **Flask-Login**: User authentication
- **Flask-CORS**: Cross-origin resource sharing
- **SQLite**: Lightweight database
- **Joblib**: Machine learning model loading
- **Ultralytics**: YOLOv8 for weed detection
- **OpenCV**: Image processing

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables and animations
- **JavaScript (ES6+)**: Interactive functionality and API integration
- **Font Awesome**: Icon library
- **Google Fonts**: Typography

### Machine Learning Models
- **Crop Recommendation**: Random Forest model trained on agricultural data
- **Weed Detection**: YOLOv8 model for object detection in images

## Project Structure

```
SmartAgriNode/
├── backend/
│   ├── app.py                 # Flask backend application
│   └── uploads/              # Temporary file storage
├── Frontend/
│   ├── index.html            # Main dashboard page
│   ├── style.css             # Styling and animations
│   └── app.js                # Frontend functionality
├── Models/
│   ├── crop_recommendation_model.pkl    # Trained crop model
│   └── weed_detection_model.pt         # Trained weed detection model
├── data/
│   ├── Crop_ds.csv           # Crop recommendation dataset
│   └── weeddataset/          # Weed detection dataset
├── requirements.txt           # Python dependencies
└── README.md                 # This file
```

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Modern web browser

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r ../requirements.txt
   ```

3. **Run the Flask application:**
   ```bash
   python app.py
   ```

   The backend will start on `http://localhost:5000`

### Frontend Setup

1. **Open the Frontend folder in your file explorer**

2. **Open `index.html` in your web browser**
   - Double-click the file, or
   - Drag and drop into your browser, or
   - Use a local server (recommended)

3. **For local development server (optional):**
   ```bash
   # Using Python
   cd Frontend
   python -m http.server 8000
   # Then visit http://localhost:8000
   
   # Using Node.js (if you have it installed)
   cd Frontend
   npx serve .
   ```

## Usage

### 1. User Registration/Login
- Click "Sign Up" to create a new account
- Use "Login" to access existing account
- Only authenticated users can use the ML models

### 2. Crop Recommendation
- Navigate to the "Crop Recommendation" section
- Input the following parameters:
  - **N**: Nitrogen content in soil
  - **P**: Phosphorus content in soil
  - **K**: Potassium content in soil
  - **Temperature**: Average temperature (°C)
  - **Humidity**: Relative humidity (%)
  - **pH**: Soil pH level (0-14)
  - **Rainfall**: Annual rainfall (mm)
- Click "Get Recommendation" to receive AI-powered crop suggestions

### 3. Weed Detection
- Navigate to the "Weed Detection" section
- Upload an image by:
  - Clicking the upload area to browse files, or
  - Dragging and dropping an image
- The system will process the image and display:
  - Original image
  - Processed image with weed detections highlighted
  - Number of detected weeds

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user info

### Machine Learning
- `POST /api/crop-recommendation` - Get crop recommendations
- `POST /api/weed-detection` - Process images for weed detection
- `GET /api/health` - System health check

## Model Information

### Crop Recommendation Model
- **Algorithm**: Random Forest
- **Input Features**: 7 numerical parameters (N, P, K, temperature, humidity, pH, rainfall)
- **Output**: Recommended crop type with confidence score
- **Training Data**: Agricultural dataset with soil and environmental parameters

### Weed Detection Model
- **Algorithm**: YOLOv8 (You Only Look Once)
- **Input**: RGB images
- **Output**: Annotated images with bounding boxes around detected weeds
- **Training Data**: Custom weed dataset with labeled images

## Customization

### Styling
- Modify `Frontend/style.css` to change colors, fonts, and animations
- Update CSS variables in `:root` section for consistent theming
- Red accent colors can be changed by modifying `--primary-color` variable

### Backend Configuration
- Update `app.config['SECRET_KEY']` in `backend/app.py` for production
- Modify database URI for different database systems
- Adjust file upload limits and allowed file types

## Troubleshooting

### Common Issues

1. **Models not loading:**
   - Ensure model files exist in `Models/` directory
   - Check file paths in `backend/app.py`
   - Verify model file formats are correct

2. **CORS errors:**
   - Backend must be running on `http://localhost:5000`
   - Check browser console for error messages
   - Verify Flask-CORS is properly configured

3. **Image upload issues:**
   - Check file size limits (16MB max)
   - Ensure image format is supported (JPEG, PNG, etc.)
   - Verify upload directory permissions

4. **Authentication problems:**
   - Clear browser cookies and local storage
   - Check if backend is running
   - Verify database is properly initialized

### Performance Tips

- Use smaller images for weed detection (recommended: <5MB)
- Close other applications when running ML models
- Ensure adequate RAM for model loading

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

## Future Enhancements

- User dashboard with prediction history
- Batch processing for multiple images
- Export functionality for results
- Mobile app development
- Additional ML models integration
- Real-time monitoring capabilities