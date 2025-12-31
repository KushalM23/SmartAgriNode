import os
import joblib
import logging
from ultralytics import YOLO

logger = logging.getLogger("SmartAgriNode.ml")

# Model paths
model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Models')
crop_model_path = os.path.join(model_dir, 'crop_recommendation_model.pkl')
weed_model_path = os.path.join(model_dir, 'weed_detection_model.onnx')

crop_model = None
weed_model = None

def get_crop_model():
    global crop_model
    if crop_model is None and os.path.exists(crop_model_path):
        try:
            crop_model = joblib.load(crop_model_path)
            logger.info("Crop recommendation model loaded successfully")
        except Exception:
            logger.exception("Error loading crop recommendation model")
            crop_model = None
    return crop_model

def get_weed_model():
    global weed_model
    if weed_model is None and os.path.exists(weed_model_path):
        try:
            weed_model = YOLO(weed_model_path, task='detect')
            logger.info("Weed detection model loaded successfully")
        except Exception:
            logger.exception("Error loading weed detection model")
            weed_model = None
    return weed_model
