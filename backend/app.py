from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import pickle
import joblib
import numpy as np
from ultralytics import YOLO
import cv2
from PIL import Image
import io
import base64
import tempfile

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
CORS(app, supports_credentials=True)

# User model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Load ML models
model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Models')

try:
    crop_model_path = os.path.join(model_dir, 'crop_recommendation_model.pkl')
    if os.path.exists(crop_model_path):
        crop_model = joblib.load(crop_model_path)
        print("✅ Crop recommendation model loaded successfully!")
    else:
        print("❌ Crop model file not found at:", crop_model_path)
        crop_model = None
except Exception as e:
    print(f"❌ Error loading crop model: {e}")
    crop_model = None

try:
    weed_model_path = os.path.join(model_dir, 'weed_detection_model.pt')
    if os.path.exists(weed_model_path):
        weed_model = YOLO(weed_model_path)
        print("✅ Weed detection model loaded successfully!")
    else:
        print("❌ Weed model file not found at:", weed_model_path)
        weed_model = None
except Exception as e:
    print(f"❌ Error loading weed model: {e}")
    weed_model = None

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        login_user(user)
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'})

@app.route('/api/user', methods=['GET'])
def get_user():
    if current_user.is_authenticated:
        return jsonify({
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email
        })
    return jsonify({'error': 'Not authenticated'}), 401

@app.route('/api/crop-recommendation', methods=['POST'])
@login_required
def crop_recommendation():
    if not crop_model:
        return jsonify({'error': 'Crop recommendation model not available'}), 500
    
    try:
        data = request.get_json()
        
        # Extract features in the correct order
        features = [
            float(data['N']),
            float(data['P']),
            float(data['K']),
            float(data['temperature']),
            float(data['humidity']),
            float(data['ph']),
            float(data['rainfall'])
        ]
        
        # Make prediction
        prediction = crop_model.predict([features])[0]
        
        return jsonify({
            'recommended_crop': prediction,
            'confidence': 0.95  # Mock confidence score
        })
    
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 400

@app.route('/api/weed-detection', methods=['POST'])
@login_required
def weed_detection():
    if not weed_model:
        return jsonify({'error': 'Weed detection model not available'}), 500
    
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Save uploaded image temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Run weed detection
        results = weed_model(filepath)
        
        # Get the first result
        result = results[0]
        
        # Save the result image
        output_filename = f"weed_detection_{filename}"
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
        
        # Save the annotated image
        annotated_img = result.plot()
        cv2.imwrite(output_path, annotated_img)
        
        # Convert to base64 for frontend display
        with open(output_path, "rb") as img_file:
            img_data = base64.b64encode(img_file.read()).decode('utf-8')
        
        # Clean up temporary files
        os.remove(filepath)
        os.remove(output_path)
        
        return jsonify({
            'result_image': img_data,
            'detections': len(result.boxes) if result.boxes else 0,
            'message': 'Weed detection completed successfully'
        })
    
    except Exception as e:
        return jsonify({'error': f'Weed detection failed: {str(e)}'}), 400

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'crop_model_loaded': crop_model is not None,
        'weed_model_loaded': weed_model is not None,
        'models_loaded': crop_model is not None and weed_model is not None
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
