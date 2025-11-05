"""
SmartAgriNode FastAPI Backend
AI-powered agriculture dashboard with crop recommendation and weed detection
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional
import os
import joblib
from ultralytics import YOLO
import cv2
import base64
import tempfile
from dotenv import load_dotenv
from database import SupabaseDB

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="SmartAgriNode API",
    description="AI-powered agriculture dashboard for crop recommendation and weed detection",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model paths and lazy loaders (improves startup time)
model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Models')
upload_dir = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(upload_dir, exist_ok=True)

crop_model = None
weed_model = None
crop_model_path = os.path.join(model_dir, 'crop_recommendation_model.pkl')
weed_model_path = os.path.join(model_dir, 'weed_detection_model.pt')

def get_crop_model():
    global crop_model
    if crop_model is None and os.path.exists(crop_model_path):
        try:
            crop_model = joblib.load(crop_model_path)
            print("✅ Crop recommendation model loaded successfully!")
        except Exception as e:
            print(f"❌ Error loading crop model: {e}")
            crop_model = None
    return crop_model

def get_weed_model():
    global weed_model
    if weed_model is None and os.path.exists(weed_model_path):
        try:
            weed_model = YOLO(weed_model_path)
            print("✅ Weed detection model loaded successfully!")
        except Exception as e:
            print(f"❌ Error loading weed model: {e}")
            weed_model = None
    return weed_model

# Pydantic models for request validation
class CropRecommendationInput(BaseModel):
    """Input model for crop recommendation"""
    N: float = Field(..., description="Nitrogen content in soil (kg/ha)", ge=0, le=200)
    P: float = Field(..., description="Phosphorus content in soil (kg/ha)", ge=0, le=200)
    K: float = Field(..., description="Potassium content in soil (kg/ha)", ge=0, le=300)
    temperature: float = Field(..., description="Ambient temperature (°C)", ge=-10, le=50)
    humidity: float = Field(..., description="Relative humidity (%)", ge=0, le=100)
    ph: float = Field(..., description="Soil pH level", ge=0, le=14)
    rainfall: float = Field(..., description="Annual rainfall (mm)", ge=0, le=5000)

    class Config:
        json_schema_extra = {
            "example": {
                "N": 40.0,
                "P": 50.0,
                "K": 60.0,
                "temperature": 25.5,
                "humidity": 75.0,
                "ph": 6.5,
                "rainfall": 200.0
            }
        }

class CropRecommendationResponse(BaseModel):
    """Response model for crop recommendation"""
    recommended_crop: str
    confidence: float

class WeedDetectionResponse(BaseModel):
    """Response model for weed detection"""
    result_image: str = Field(..., description="Base64 encoded annotated image")
    detections: int = Field(..., description="Number of weeds detected")
    message: str

class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    crop_model_loaded: bool
    weed_model_loaded: bool
    models_loaded: bool

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str

class HistoryResponse(BaseModel):
    """Response model for user history"""
    crop_recommendations: list
    weed_detections: list

# Clerk JWT verification
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_PUBLISHABLE_KEY = os.getenv("CLERK_PUBLISHABLE_KEY")

async def verify_clerk_token(authorization: Optional[str] = Header(None)) -> dict:
    """
    Verify Clerk JWT token from Authorization header
    Returns user data if valid, raises HTTPException if invalid
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    # Extract token from "Bearer <token>"
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    # Development mode: decode without verification
    # In production, you should properly verify JWT signatures using Clerk's JWKS endpoint
    try:
        import jwt
        
        # Decode JWT without verification for development
        # This allows testing without network calls to Clerk's API
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        print(f"✅ Token decoded successfully for user: {decoded.get('sub', 'unknown')}")
        return {
            "user_id": decoded.get("sub"),
            "session_id": decoded.get("sid"),
            "email": decoded.get("email")
        }
        
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token format")
    except Exception as e:
        print(f"❌ Token verification error: {str(e)}")
        # In development, allow requests even if token verification fails
        print("⚠️ Development mode: Allowing request despite token error")
        return {"user_id": "dev_user", "email": "dev@example.com"}

# API Routes

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "name": "SmartAgriNode API",
        "version": "2.0.0",
        "description": "AI-powered agriculture dashboard",
        "docs": "/api/docs"
    }

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    Returns status of the API and ML models
    """
    return HealthResponse(
        status="healthy",
        crop_model_loaded=os.path.exists(crop_model_path),
        weed_model_loaded=os.path.exists(weed_model_path),
        models_loaded=os.path.exists(crop_model_path) and os.path.exists(weed_model_path)
    )

@app.get(
    "/api/history",
    response_model=HistoryResponse,
    responses={
        401: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def get_history(user: dict = Depends(verify_clerk_token)):
    """
    Get recent crop recommendations and weed detections for the authenticated user
    """
    try:
        history = await SupabaseDB.get_user_history(user_id=user.get("user_id"), limit=10)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

@app.post(
    "/api/crop-recommendation",
    response_model=CropRecommendationResponse,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def crop_recommendation(
    data: CropRecommendationInput,
    user: dict = Depends(verify_clerk_token)
):
    """
    Get crop recommendation based on soil and environmental parameters
    Requires authentication
    """
    model = get_crop_model()
    if not model:
        raise HTTPException(status_code=500, detail="Crop recommendation model not available")
    
    try:
        # Ensure user metadata exists (idempotent upsert)
        try:
            await SupabaseDB.store_user_metadata(
                user_id=user.get("user_id") or "dev_user",
                email=user.get("email") or "dev@example.com"
            )
        except Exception as e:
            print(f"Warning: Failed to upsert user metadata: {e}")

        # Extract features in the correct order
        features = [
            data.N,
            data.P,
            data.K,
            data.temperature,
            data.humidity,
            data.ph,
            data.rainfall
        ]
        
        # Make prediction
        prediction = model.predict([features])[0]
        
        # Store in history (optional, non-blocking)
        try:
            await SupabaseDB.store_crop_recommendation(
                user_id=user.get("user_id"),
                input_data=data.dict(),
                recommendation=str(prediction),
                confidence=0.95
            )
        except Exception as e:
            print(f"Warning: Failed to store crop recommendation history: {e}")
        
        return CropRecommendationResponse(
            recommended_crop=str(prediction),
            confidence=0.95  # Mock confidence score
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")

@app.post(
    "/api/weed-detection",
    response_model=WeedDetectionResponse,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def weed_detection(
    image: UploadFile = File(...),
    user: dict = Depends(verify_clerk_token)
):
    """
    Detect weeds in uploaded image
    Requires authentication
    Accepts JPG, PNG, JPEG formats (max 16MB)
    """
    model = get_weed_model()
    if not model:
        raise HTTPException(status_code=500, detail="Weed detection model not available")
    
    # Validate file type
    allowed_extensions = {'.jpg', '.jpeg', '.png'}
    file_ext = os.path.splitext(image.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file format. Only JPG, PNG, JPEG allowed")
    
    # Validate file size (16MB max)
    max_size = 16 * 1024 * 1024
    contents = await image.read()
    if len(contents) > max_size:
        raise HTTPException(status_code=400, detail="File size exceeds 16MB limit")
    
    try:
        # Ensure user metadata exists (idempotent upsert)
        try:
            await SupabaseDB.store_user_metadata(
                user_id=user.get("user_id") or "dev_user",
                email=user.get("email") or "dev@example.com"
            )
        except Exception as e:
            print(f"Warning: Failed to upsert user metadata: {e}")

        # Save uploaded image temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
            tmp_file.write(contents)
            tmp_path = tmp_file.name
        
        # Run weed detection
        results = model(tmp_path)
        result = results[0]
        
        # Save annotated image
        annotated_img = result.plot()
        
        # Save to temporary output file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as output_file:
            output_path = output_file.name
        
        cv2.imwrite(output_path, annotated_img)
        
        # Convert to base64
        with open(output_path, "rb") as img_file:
            img_data = base64.b64encode(img_file.read()).decode('utf-8')
        
        # Get detection count
        detection_count = len(result.boxes) if result.boxes else 0
        
        # Store in history (optional, non-blocking)
        try:
            await SupabaseDB.store_weed_detection(
                user_id=user.get("user_id"),
                filename=image.filename,
                detections=detection_count
            )
        except Exception as e:
            print(f"Warning: Failed to store weed detection history: {e}")
        
        # Clean up temporary files
        os.remove(tmp_path)
        os.remove(output_path)
        
        return WeedDetectionResponse(
            result_image=img_data,
            detections=detection_count,
            message="Weed detection completed successfully"
        )
    
    except Exception as e:
        # Clean up on error
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.remove(tmp_path)
        if 'output_path' in locals() and os.path.exists(output_path):
            os.remove(output_path)
        raise HTTPException(status_code=400, detail=f"Weed detection failed: {str(e)}")

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": f"Internal server error: {str(exc)}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
