import asyncio
import base64
import logging
import os
import tempfile
import cv2
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, Request
from pydantic import BaseModel
from database import SupabaseDB
from ml_utils import get_crop_model, get_weed_model
from auth import verify_supabase_token

router = APIRouter(prefix="/api/device", tags=["device"])
logger = logging.getLogger("SmartAgriNode.device")

# In-memory queue for commands
# Map: device_id -> command
COMMAND_QUEUE = {}

# In-memory storage for latest sensor readings (for polling)
LATEST_SENSOR_DATA = {}

# In-memory storage for weed scan results (list of 8 images)
WEED_SCAN_RESULTS = {}

class TelemetryInput(BaseModel):
    N: float
    P: float
    K: float
    ph: float

@router.post("/command/sensors")
async def trigger_sensor_measurement(background_tasks: BackgroundTasks, user: dict = Depends(verify_supabase_token)):
    """
    Frontend calls this to request sensor data from hardware.
    """
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    COMMAND_QUEUE['default'] = "MEASURE_SENSORS"
    # Clear previous data
    LATEST_SENSOR_DATA['default'] = None
    
    # Simulate hardware response if offline (Fallback)
    background_tasks.add_task(simulate_sensor_data)
    
    return {"message": "Sensor measurement requested"}

@router.post("/command/weed-scan")
async def trigger_weed_scan(background_tasks: BackgroundTasks, user: dict = Depends(verify_supabase_token)):
    """
    Frontend calls this to request a full weed scan (8 images).
    """
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    COMMAND_QUEUE['default'] = "START_WEED_SCAN"
    # Clear previous results
    WEED_SCAN_RESULTS['default'] = []
    
    # Simulate hardware response if offline (Fallback)
    background_tasks.add_task(simulate_weed_scan)
    
    return {"message": "Weed scan requested"}

async def simulate_sensor_data():
    """Fallback: Simulate sensor data after a short delay"""
    await asyncio.sleep(3) # Simulate network/hardware delay
    # Only update if real hardware hasn't responded yet
    if LATEST_SENSOR_DATA.get('default') is None:
        import random
        LATEST_SENSOR_DATA['default'] = {
            "N": random.uniform(30, 100),
            "P": random.uniform(20, 80),
            "K": random.uniform(20, 80),
            "ph": random.uniform(5.5, 7.5)
        }

async def simulate_weed_scan():
    """Fallback: Simulate 8 images arriving one by one"""
    import random
    # We need a placeholder image. We can use a blank one or try to read one from disk if available.
    # For now, let's create a simple colored image using cv2
    import numpy as np
    
    for i in range(8):
        await asyncio.sleep(1.5) # Simulate rotation and capture time
        
        # Create a dummy image (random noise or solid color)
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        # Add some random colored rectangles to simulate "weeds"
        for _ in range(random.randint(0, 5)):
            cv2.rectangle(img, 
                         (random.randint(0, 600), random.randint(0, 440)), 
                         (random.randint(0, 600), random.randint(0, 440)), 
                         (0, 255, 0), 2)
            
        # Encode
        _, buffer = cv2.imencode('.jpg', img)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        if 'default' not in WEED_SCAN_RESULTS:
            WEED_SCAN_RESULTS['default'] = []
            
        WEED_SCAN_RESULTS['default'].append({
            "image": img_base64,
            "weed_count": random.randint(0, 5)
        })

@router.get("/check-command")
async def check_command():
    """
    ESP32 polls this endpoint to see if it needs to do anything.
    """
    cmd = COMMAND_QUEUE.get('default', "STOP")
    # Clear command after reading if it's a trigger
    if cmd in ["MEASURE_SENSORS", "START_WEED_SCAN"]:
        COMMAND_QUEUE['default'] = "STOP"
    return cmd

@router.post("/update-sensors")
async def update_sensors(data: TelemetryInput):
    """
    ESP32 sends sensor data here.
    """
    # Store in memory for frontend polling
    LATEST_SENSOR_DATA['default'] = data.dict()
    return {"status": "received"}

@router.get("/sensors/latest")
async def get_latest_sensors(user: dict = Depends(verify_supabase_token)):
    """
    Frontend polls this to get the sensor data after triggering measurement.
    """
    data = LATEST_SENSOR_DATA.get('default')
    if not data:
        return {"status": "pending"}
    return {"status": "complete", "data": data}

@router.post("/upload-image")
async def upload_image(request: Request):
    """
    ESP32-CAM uploads raw JPEG data.
    """
    body = await request.body()
    if not body:
        raise HTTPException(status_code=400, detail="Empty body")
    
    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
        tmp_file.write(body)
        tmp_path = tmp_file.name
        
    try:
        model = get_weed_model()
        if not model:
            raise HTTPException(status_code=500, detail="Model not loaded")
            
        # Run inference
        results = await asyncio.to_thread(model, tmp_path)
        result = results[0]
        
        # Save annotated image
        annotated_img = result.plot()
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as output_file:
            output_path = output_file.name
        await asyncio.to_thread(cv2.imwrite, output_path, annotated_img)
        
        # Convert to base64 for immediate display
        def read_and_encode(path):
            with open(path, "rb") as img_file:
                return base64.b64encode(img_file.read()).decode('utf-8')

        img_data = await asyncio.to_thread(read_and_encode, output_path)
        weed_count = len(result.boxes) if result.boxes else 0
        
        # Store result in memory list
        if 'default' not in WEED_SCAN_RESULTS:
            WEED_SCAN_RESULTS['default'] = []
            
        WEED_SCAN_RESULTS['default'].append({
            "image": img_data,
            "weed_count": weed_count
        })
        
        return {"status": "processed", "weed_count": weed_count}
        
    except Exception as e:
        logger.error(f"Error processing device image: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        if 'output_path' in locals() and os.path.exists(output_path):
            os.remove(output_path)

@router.get("/weed-scan/results")
async def get_weed_scan_results(user: dict = Depends(verify_supabase_token)):
    """
    Frontend polls this to get the list of images.
    """
    results = WEED_SCAN_RESULTS.get('default', [])
    return {"count": len(results), "results": results}
