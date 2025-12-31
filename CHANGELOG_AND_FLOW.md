# Changelog and System Flow

## 1. Changes Made

### Backend
- **Updated Router (`backend/routers/device.py`)**: 
    - Added `POST /api/device/command/sensors`: Queues a `MEASURE_SENSORS` command.
    - Added `POST /api/device/command/weed-scan`: Queues a `START_WEED_SCAN` command.
    - Added `GET /api/device/sensors/latest`: Endpoint for frontend to poll for sensor data.
    - Added `GET /api/device/weed-scan/results`: Endpoint for frontend to poll for the 8 captured images.
    - Updated `GET /api/device/check-command`: Now handles multiple command types.
    - Updated `POST /api/device/upload-image`: Stores images in an in-memory list for the weed scan results.

### Frontend
- **Dashboard (`Dashboard.jsx`)**: 
    - Automatically triggers a sensor measurement on page load.
    - Polls for real-time sensor data (N, P, K, pH, etc.) and updates the charts.
- **Crop Recommendation (`CropRecommendation.jsx`)**: 
    - Added a toggle for "Manual Input" vs "Use Sensor Data".
    - "Use Sensor Data" mode triggers a hardware measurement and auto-fills the form.
- **Weed Detection (`WeedDetection.jsx`)**: 
    - Added a toggle for "Upload Image" vs "Node Camera Scan".
    - "Node Camera Scan" triggers the 360° rotation logic on the hardware.
    - Displays a grid of the 8 captured images in real-time as they arrive.
- **Removed**: `LiveMonitor.jsx` and its route/navigation link. The hardware integration is now embedded directly into the relevant feature pages.

### Hardware
- **Updated Logic**: The ESP32 code (in `HARDWARE_UPDATES.md`) needs to handle:
    - `MEASURE_SENSORS`: Read sensors and send to `/api/device/update-sensors`.
    - `START_WEED_SCAN`: Rotate stepper motor 8 times (45 degrees each), take a photo at each step, and upload to `/api/device/upload-image`.

---

## 2. System Flow (User Journey)

### Dashboard
1.  **User enters Dashboard**: The frontend sends `MEASURE_SENSORS` command.
2.  **Hardware**: Receives command, reads NPK/DHT/pH sensors, sends data to backend.
3.  **Frontend**: Receives data via polling and updates the gauges and charts immediately.

### Crop Recommendation
1.  **User selects "Use Sensor Data"**: Frontend sends `MEASURE_SENSORS` command.
2.  **Hardware**: Reads sensors and sends data.
3.  **Frontend**: Auto-fills the input fields (Nitrogen, Phosphorus, Potassium, pH, etc.).
4.  **User clicks "Get Recommendations"**: The system uses the auto-filled data to predict the best crop.

### Weed Detection
1.  **User selects "Node Camera Scan"**: Frontend sends `START_WEED_SCAN` command.
2.  **Hardware**: 
    - Rotates 45°.
    - Captures image.
    - Uploads to backend.
    - Repeats 8 times.
3.  **Frontend**: Polls for images and displays them in a grid as they are processed.
4.  **Result**: User sees 8 analyzed images with weed counts for the entire field view.

## 3. Next Steps for Deployment
1.  **Flash ESP32**: Ensure your ESP32 code implements the `MEASURE_SENSORS` and `START_WEED_SCAN` command handling.
2.  **Run Backend**: `python start_servers.py`.
3.  **Test**: Navigate to Dashboard to see live data, or Weed Detection to run a camera scan.
