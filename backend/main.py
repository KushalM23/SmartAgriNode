"""
SmartAgriNode FastAPI Backend
AI-powered agriculture dashboard with crop recommendation and weed detection
"""

import base64
import logging
import os
import tempfile
from contextlib import asynccontextmanager
from typing import Optional
import torch

import cv2
import joblib
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from ultralytics import YOLO

from database import SupabaseDB
from ml_utils import get_crop_model, get_weed_model
from routers import device
from auth import verify_supabase_token

logger = logging.getLogger("SmartAgriNode.backend")

if not logging.getLogger().handlers:
    logging.basicConfig(level=logging.INFO)

# Load environment variables
load_dotenv()

DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://smart-agri-node.vercel.app"
]

def build_allowed_origins() -> list[str]:
    """Return list of allowed origins from defaults + env overrides."""
    env_value = os.getenv("FRONTEND_URLS") or os.getenv("FRONTEND_URL")
    extra_origins = []
    if env_value:
        extra_origins = [origin.strip() for origin in env_value.split(',') if origin.strip()]

    vercel_url = os.getenv("VERCEL_URL")
    if vercel_url:
        # Vercel passes host only (e.g., my-app.vercel.app)
        vercel_origin = vercel_url if vercel_url.startswith("http") else f"https://{vercel_url}"
        extra_origins.append(vercel_origin)

    # Preserve order but remove duplicates
    seen = set()
    origins = []
    for origin in [*DEFAULT_ALLOWED_ORIGINS, *extra_origins]:
        if origin and origin not in seen:
            seen.add(origin)
            origins.append(origin)
    return origins

# Model paths and loaders
model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Models')
upload_dir = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(upload_dir, exist_ok=True)

crop_model_path = os.path.join(model_dir, 'crop_recommendation_model.pkl')
weed_model_path = os.path.join(model_dir, 'weed_detection_model.onnx')

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models on startup
    logger.info("Loading models...")
    
    # Optimize PyTorch for CPU execution (crucial for Render free tier)
    try:
        torch.set_num_threads(1)
        torch.set_num_interop_threads(1)
    except Exception as e:
        logger.warning(f"Could not set torch threads: {e}")
        
    get_crop_model()
    get_weed_model()
    yield
    # Clean up resources if needed
    logger.info("Shutting down...")

# Initialize FastAPI app
app = FastAPI(
    lifespan=lifespan,
    title="SmartAgriNode API",
    description="AI-powered agriculture dashboard with crop recommendation and weed detection",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Include routers
app.include_router(device.router)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=build_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    input_image_url: Optional[str] = None
    output_image_url: Optional[str] = None

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

class AvatarResponse(BaseModel):
    """Response model for avatar upload"""
    avatar_url: str
    message: str

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
async def get_history(user: dict = Depends(verify_supabase_token)):
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
    user: dict = Depends(verify_supabase_token)
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
        if user.get("user_id"):
            try:
                await SupabaseDB.store_user_metadata(
                    user_id=user.get("user_id"),
                    email=user.get("email")
                )
            except Exception as e:
                logger.warning(f"Failed to upsert user metadata: {e}")

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
        if user.get("user_id"):
            try:
                await SupabaseDB.store_crop_recommendation(
                    user_id=user.get("user_id"),
                    input_data=data.dict(),
                    recommendation=str(prediction),
                    confidence=0.95
                )
            except Exception as e:
                logger.warning(f"Failed to store crop recommendation history: {e}")
        
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
    user: dict = Depends(verify_supabase_token)
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
        if user.get("user_id"):
            try:
                await SupabaseDB.store_user_metadata(
                    user_id=user.get("user_id"),
                    email=user.get("email")
                )
            except Exception as e:
                logger.warning(f"Failed to upsert user metadata: {e}")

        # Upload input image to Supabase Storage
        input_image_url = None
        if user.get("user_id"):
            try:
                input_image_url = await SupabaseDB.upload_weed_image(
                    user_id=user.get("user_id"),
                    file_content=contents,
                    file_ext=file_ext.lstrip('.'),
                    bucket_name="input-images"
                )
            except Exception as e:
                logger.warning(f"Failed to upload input image: {e}")

        # Save uploaded image temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
            tmp_file.write(contents)
            tmp_path = tmp_file.name
        
        # Run weed detection
        # Run inference in a thread to avoid blocking the event loop
        import asyncio
        
        # Run model inference
        results = await asyncio.to_thread(model, tmp_path)
        result = results[0]
        
        # Save annotated image
        annotated_img = result.plot()
        
        # Save to temporary output file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as output_file:
            output_path = output_file.name
        
        # Perform blocking I/O in a thread
        await asyncio.to_thread(cv2.imwrite, output_path, annotated_img)
        
        # Convert to base64
        def read_and_encode(path):
            with open(path, "rb") as img_file:
                return base64.b64encode(img_file.read()).decode('utf-8')

        img_data = await asyncio.to_thread(read_and_encode, output_path)
        
        # Upload output image to Supabase Storage
        output_image_url = None
        if user.get("user_id"):
            try:
                # Need to read the file content again for upload since we read it inside the thread function
                with open(output_path, "rb") as f:
                    output_content = f.read()
                    
                output_image_url = await SupabaseDB.upload_weed_image(
                    user_id=user.get("user_id"),
                    file_content=output_content,
                    file_ext="jpg",
                    bucket_name="output-images"
                )
            except Exception as e:
                logger.warning(f"Failed to upload output image: {e}")

        # Get detection count
        detection_count = len(result.boxes) if result.boxes else 0
        
        # Store in history (optional, non-blocking)
        if user.get("user_id"):
            try:
                await SupabaseDB.store_weed_detection(
                    user_id=user.get("user_id"),
                    filename=image.filename,
                    detections=detection_count,
                    input_image_url=input_image_url,
                    output_image_url=output_image_url
                )
            except Exception as e:
                logger.warning(f"Failed to store weed detection history: {e}")
        
        # Clean up temporary files
        os.remove(tmp_path)
        os.remove(output_path)
        
        return WeedDetectionResponse(
            result_image=img_data,
            detections=detection_count,
            message="Weed detection completed successfully",
            input_image_url=input_image_url,
            output_image_url=output_image_url
        )
    
    except Exception as e:
        # Clean up on error
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.remove(tmp_path)
        if 'output_path' in locals() and os.path.exists(output_path):
            os.remove(output_path)
        raise HTTPException(status_code=400, detail=f"Weed detection failed: {str(e)}")

@app.post(
    "/api/upload-avatar",
    response_model=AvatarResponse,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def upload_avatar(
    file: UploadFile = File(...),
    user: dict = Depends(verify_supabase_token)
):
    """
    Upload user avatar
    Requires authentication
    Accepts JPG, PNG, JPEG formats (max 5MB)
    """
    # Validate file type
    allowed_extensions = {'jpg', 'jpeg', 'png'}
    file_ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file format. Allowed: JPG, PNG, GIF, WEBP")
    
    # Validate file size (5MB max)
    max_size = 5 * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_size:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
    
    try:
        avatar_url = await SupabaseDB.upload_avatar(
            user_id=user.get("user_id"),
            file_content=contents,
            file_ext=file_ext
        )
        
        return AvatarResponse(
            avatar_url=avatar_url,
            message="Avatar uploaded successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Avatar upload failed: {str(e)}")

@app.delete(
    "/api/delete-avatar",
    response_model=AvatarResponse,
    responses={
        401: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def delete_avatar(
    background_tasks: BackgroundTasks,
    user: dict = Depends(verify_supabase_token)
):
    """
    Delete user avatar
    Requires authentication
    Clears DB reference immediately, deletes file in background
    """
    try:
        user_id = user.get("user_id")
        
        # 1. Clear DB reference immediately
        await SupabaseDB.clear_avatar_reference(user_id)
        
        # 2. Schedule file deletion in background
        background_tasks.add_task(SupabaseDB.delete_avatar_file, user_id)
        
        return AvatarResponse(
            avatar_url="",
            message="Avatar deleted successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Avatar deletion failed: {str(e)}")

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
