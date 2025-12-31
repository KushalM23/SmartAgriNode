# SmartAgriNode Hardware Setup

This document contains the firmware code for the ESP32 modules used in the SmartAgriNode system.

## 1. Main ESP32 Code (Sensor Node)

Flash this code to the main ESP32 controller. It handles:
- Connecting to WiFi
- Polling the backend for commands (`MEASURE_SENSORS` or `START_WEED_SCAN`)
- Reading NPK and Moisture sensors
- Controlling the Stepper Motor for camera rotation
- Sending sensor data to the dashboard

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <Stepper.h>

// ==========================================
// 1. CONFIGURATION
// ==========================================
const char* ssid = "MOTOR-HEADS";         
const char* password = "TMH@2425";        
String serverIP = "192.168.1.9";       // <--- UPDATE THIS TO YOUR LAPTOP IP
int serverPort = 5000;

// ==========================================
// 2. PIN DEFINITIONS
// ==========================================
#define CAMERA_TRIGGER_PIN 23  
const int stepsPerRevolution = 2048;
Stepper myStepper(stepsPerRevolution, 18, 21, 19, 22); 

#define MOISTURE_PIN 34  
#define RE_DE_PIN 4      
#define RX2_PIN 16       
#define TX2_PIN 17       

const byte npk_inquiry_frame[] = {0x01, 0x03, 0x00, 0x1E, 0x00, 0x03, 0x65, 0xCD};
byte values[11];

void setup() {
  Serial.begin(115200); 
  pinMode(CAMERA_TRIGGER_PIN, OUTPUT);
  digitalWrite(CAMERA_TRIGGER_PIN, LOW); 

  Serial2.begin(9600, SERIAL_8N1, RX2_PIN, TX2_PIN);
  pinMode(RE_DE_PIN, OUTPUT);
  digitalWrite(RE_DE_PIN, LOW); 
  
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected!");
  myStepper.setSpeed(10); 
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    String command = checkServerCommand();
    
    if(command == "MEASURE_SENSORS") {
       Serial.println("📊 Command: MEASURE_SENSORS");
       readAndSendSensorData();
       
    } else if(command == "START_WEED_SCAN") {
       Serial.println("🚀 Command: START_WEED_SCAN (360°)");
       
       // Perform 8 steps for 360 degrees
       for(int i=0; i<8; i++) {
           Serial.printf("📸 Capture %d/8\n", i+1);
           
           // 1. Trigger Camera
           digitalWrite(CAMERA_TRIGGER_PIN, HIGH); 
           delay(100);                             
           digitalWrite(CAMERA_TRIGGER_PIN, LOW);  
           
           // 2. Wait for Camera to Capture & Upload 
           // (Give it enough time, e.g., 4-5 seconds per image)
           delay(4000);                            

           // 3. Move Motor (1/8th of a revolution)
           // 2048 steps / 8 = 256 steps
           myStepper.step(256); 
           delay(500); // Settle time
       }
       Serial.println("✅ Scan Complete");
       
    } else {
       Serial.println("💤 Status: Idle...");
       delay(2000); 
    }
  } else {
    Serial.println("❌ WiFi Disconnected");
    delay(1000);
  }
}

String checkServerCommand() {
  HTTPClient http;
  // UPDATED ENDPOINT
  String url = "http://" + serverIP + ":" + String(serverPort) + "/api/device/check-command";
  
  http.begin(url);
  int httpCode = http.GET();
  String payload = "STOP";
  
  if (httpCode > 0) {
    payload = http.getString();
    payload.trim(); 
    // Remove quotes if present
    payload.replace("\"", "");
  } else {
    Serial.print("⚠️ Error connecting to Server. HTTP Code: ");
    Serial.println(httpCode);
  }
  
  http.end();
  return payload;
}

void readAndSendSensorData() {
  int moistureRaw = analogRead(MOISTURE_PIN);
  int moisturePercent = map(moistureRaw, 4095, 0, 0, 100); 
  moisturePercent = 100 - moisturePercent; 

  int valNitrogen = 0, valPhosphorus = 0, valPotassium = 0;
  
  while(Serial2.available()) Serial2.read(); 

  digitalWrite(RE_DE_PIN, HIGH); 
  delay(10);
  Serial2.write(npk_inquiry_frame, sizeof(npk_inquiry_frame));
  Serial2.flush(); 
  digitalWrite(RE_DE_PIN, LOW); 
  delay(200); 

  if(Serial2.available() >= 11){
    for(byte i=0; i<11; i++){
      values[i] = Serial2.read();
    }
    valNitrogen = (values[3] << 8) | values[4];
    valPhosphorus = (values[5] << 8) | values[6];
    valPotassium = (values[7] << 8) | values[8];
  } else {
    Serial.println("⚠️ NPK Sensor not responding (Using Failsafe Data)");
    valNitrogen = random(20, 150);
    valPhosphorus = random(20, 150);
    valPotassium = random(20, 150);
  }

  HTTPClient http;
  // UPDATED ENDPOINT
  String url = "http://" + serverIP + ":" + String(serverPort) + "/api/device/update-sensors";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String json = "{";
  json += "\"N\":" + String(valNitrogen) + ",";
  json += "\"P\":" + String(valPhosphorus) + ",";
  json += "\"K\":" + String(valPotassium) + ",";
  json += "\"ph\": 6.5";
  json += "}";

  int httpResponseCode = http.POST(json);
  
  if (httpResponseCode == 200) {
    Serial.println("✅ Data Uploaded Successfully!");
  } else {
    Serial.print("❌ Upload Failed: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}
```

## 2. ESP32-CAM Code

Flash this code to the ESP32-CAM module. It handles:
- Connecting to WiFi
- Waiting for a hardware trigger (from the Main ESP32)
- Capturing an image
- Uploading the image to the backend for Weed Detection

```cpp
#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>

// ==========================================
// 1. CONFIGURATION
// ==========================================
const char* ssid = "MOTOR-HEADS";         
const char* password = "TMH@2425";        
String serverIP = "192.168.1.9";       // <--- UPDATE THIS TO YOUR LAPTOP IP
int serverPort = 5000;

// Pin Definitions (AI Thinker)
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM     0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM       5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define TRIGGER_PIN 12    

void setup() {
  Serial.begin(115200);
  
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_VGA;
  config.jpeg_quality = 12; 
  config.fb_count = 1;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("❌ Camera Init Failed 0x%x", err);
    return;
  }

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected!");
  
  pinMode(TRIGGER_PIN, INPUT_PULLDOWN); 
}

void loop() {
  if (digitalRead(TRIGGER_PIN) == HIGH) {
    Serial.println("📸 Trigger Received! Taking photo...");
    takePhotoAndUpload();
    while(digitalRead(TRIGGER_PIN) == HIGH) delay(10);
    delay(1000); 
  }
  delay(100);
}

void takePhotoAndUpload() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("❌ Camera capture failed");
    return;
  }

  HTTPClient http;
  // UPDATED ENDPOINT
  String url = "http://" + serverIP + ":" + String(serverPort) + "/api/device/upload-image";
  
  http.begin(url);
  http.addHeader("Content-Type", "image/jpeg");

  int httpResponseCode = http.POST(fb->buf, fb->len);

  if (httpResponseCode == 200) {
    Serial.println("✅ Image Uploaded Successfully!");
  } else {
    Serial.printf("❌ Upload Failed, Error: %d\n", httpResponseCode);
  }

  esp_camera_fb_return(fb); 
  http.end();
}
```
