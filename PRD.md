# Product Requirements Document (PRD)
## SmartAgriNode - AI-Powered Agriculture Dashboard

**Document Version:** 1.0  
**Last Updated:** November 5, 2025  
**Project Repository:** [KushalM23/SmartAgriNode](https://github.com/KushalM23/SmartAgriNode)

---

## 1. Executive Summary

### 1.1 Product Overview
SmartAgriNode is an AI-powered web application designed to assist farmers and agricultural professionals in making data-driven decisions. The platform leverages machine learning models to provide intelligent crop recommendations based on soil conditions and advanced weed detection capabilities through computer vision.

### 1.2 Product Vision
To empower farmers with accessible, accurate, and actionable AI-driven insights that optimize crop selection and improve farm management efficiency.

### 1.3 Business Objectives
- Reduce crop failure rates through data-driven crop recommendations
- Minimize manual labor and time spent on weed identification
- Provide an intuitive, user-friendly interface for agricultural decision-making
- Enable scalable deployment for individual farmers and agricultural organizations

---

## 2. Target Users

### 2.1 Primary Users
- **Small to Medium-Scale Farmers**: Individual farmers managing 5-100 acres
- **Agricultural Consultants**: Professionals advising multiple farms
- **Agriculture Students/Researchers**: Academic users conducting field studies

### 2.2 User Personas

**Persona 1: Independent Farmer (Raj, 45)**
- Limited technical expertise
- Manages 20-acre farm
- Needs quick, reliable crop recommendations
- Struggles with weed identification
- Has smartphone and basic internet access

**Persona 2: Agricultural Consultant (Priya, 32)**
- Moderate to high technical literacy
- Advises 15-20 farms
- Needs scalable tool for multiple clients
- Values accuracy and detailed reporting

**Persona 3: Agriculture Student (Amit, 22)**
- High technical literacy
- Conducting research projects
- Needs historical data and analysis capabilities
- Values API access and data export features

---

## 3. Product Requirements

### 3.1 Functional Requirements

#### 3.1.1 User Authentication & Authorization
**Priority:** P0 (Critical)

| Requirement ID | Description | Acceptance Criteria |
|----------------|-------------|---------------------|
| AUTH-001 | User registration via Clerk | - Email/password signup<br>- Social OAuth (Google, GitHub, etc.)<br>- Magic link authentication<br>- Automatic user profile creation |
| AUTH-002 | User login via Clerk | - Multiple authentication methods<br>- JWT token generation<br>- Session management<br>- Redirect to dashboard on success |
| AUTH-003 | User logout functionality | - Clear Clerk session<br>- Clear client-side state<br>- Redirect to home page |
| AUTH-004 | Protected route access | - JWT token verification on backend<br>- Restrict ML endpoints to authenticated users<br>- Automatic redirect to auth page for unauthenticated users |
| AUTH-005 | Session persistence | - Maintain user session across page refreshes<br>- Token refresh mechanism<br>- Secure token storage |

#### 3.1.2 Crop Recommendation System
**Priority:** P0 (Critical)

| Requirement ID | Description | Acceptance Criteria |
|----------------|-------------|---------------------|
| CROP-001 | Input form for soil parameters | - Accept 7 parameters: N, P, K, pH, temperature, humidity, rainfall<br>- Input validation (numeric, range checks)<br>- Clear error messages for invalid inputs |
| CROP-002 | ML-based crop prediction | - Process inputs through Random Forest model<br>- Return recommended crop name<br>- Response time < 2 seconds |
| CROP-003 | Display recommendation results | - Show recommended crop clearly<br>- Display confidence score<br>- Provide option to submit new query |
| CROP-004 | Input parameter guidelines | - Display acceptable range for each parameter<br>- Provide tooltips/help text<br>- Example values for reference |

#### 3.1.3 Weed Detection System
**Priority:** P0 (Critical)

| Requirement ID | Description | Acceptance Criteria |
|----------------|-------------|---------------------|
| WEED-001 | Image upload functionality | - Accept JPG, PNG, JPEG formats<br>- Max file size: 16MB<br>- Drag-and-drop and file picker support |
| WEED-002 | Weed detection processing | - Process image through YOLOv8 model<br>- Detect and localize weeds<br>- Processing time < 5 seconds per image |
| WEED-003 | Display detection results | - Show annotated image with bounding boxes<br>- Display number of weeds detected<br>- Provide download option for results |
| WEED-004 | Error handling for detection | - Handle unsupported formats gracefully<br>- Provide clear error messages<br>- Allow retry without losing context |

#### 3.1.4 Dashboard
**Priority:** P1 (High)

| Requirement ID | Description | Acceptance Criteria |
|----------------|-------------|---------------------|
| DASH-001 | Soil condition overview | - Display current soil parameters<br>- Visual indicators for parameter status<br>- Quick-access navigation to features |
| DASH-002 | Climate insights | - Show relevant climate data<br>- Historical trends (if available)<br>- Recommendations based on conditions |
| DASH-003 | User activity summary | - Recent crop recommendations<br>- Recent weed detection results<br>- User statistics |

#### 3.1.5 Navigation & User Interface
**Priority:** P0 (Critical)

| Requirement ID | Description | Acceptance Criteria |
|----------------|-------------|---------------------|
| NAV-001 | Responsive navigation bar | - Accessible on all pages<br>- Show/hide options based on auth state<br>- Highlight active page |
| NAV-002 | Home page | - Clear value proposition<br>- Call-to-action buttons<br>- Feature highlights |
| NAV-003 | Mobile responsiveness | - Functional on screens ≥ 320px width<br>- Touch-friendly interface<br>- Optimized layouts for mobile |

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance
| Requirement ID | Description | Target Metric |
|----------------|-------------|---------------|
| PERF-001 | Page load time | < 3 seconds on 4G connection |
| PERF-002 | API response time | < 2 seconds for crop recommendation |
| PERF-003 | Image processing time | < 5 seconds for weed detection |
| PERF-004 | Concurrent users | Support 100 concurrent users |

#### 3.2.2 Security
| Requirement ID | Description | Implementation |
|----------------|-------------|----------------|
| SEC-001 | Authentication security | Clerk JWT-based authentication with industry-standard encryption |
| SEC-002 | API endpoint protection | JWT token verification on all protected endpoints |
| SEC-003 | CORS policy | Restrict to allowed origins (localhost in dev, production domains) |
| SEC-004 | File upload security | Validate file types, size limits, secure temporary storage |
| SEC-005 | Data encryption | HTTPS in production, encrypted database connections (Supabase) |
| SEC-006 | SQL injection prevention | Parameterized queries via Supabase client |

#### 3.2.3 Reliability & Availability
| Requirement ID | Description | Target |
|----------------|-------------|--------|
| REL-001 | System uptime | 99% availability |
| REL-002 | Error recovery | Graceful degradation on model failures |
| REL-003 | Data persistence | SQLite database with backup capability |

#### 3.2.4 Usability
| Requirement ID | Description | Standard |
|----------------|-------------|----------|
| USA-001 | Intuitive interface | 90% of users can complete tasks without help |
| USA-002 | Error messages | Clear, actionable error messages |
| USA-003 | Loading indicators | Visual feedback during processing |
| USA-004 | Accessibility | WCAG 2.1 Level AA compliance (target) |

#### 3.2.5 Scalability
| Requirement ID | Description | Approach |
|----------------|-------------|----------|
| SCAL-001 | Database scaling | Supabase PostgreSQL with automatic scaling |
| SCAL-002 | Model serving | Support for model versioning and hot-swapping |
| SCAL-003 | Storage scaling | Cloud storage integration for uploaded images (Supabase Storage) |
| SCAL-004 | API scaling | FastAPI async support for concurrent requests |

---

## 4. Technical Architecture

### 4.1 System Architecture
```
┌─────────────────────────────────────────────────────┐
│                   Client Layer                       │
│  React.js Frontend (Vite) - Port 5173              │
│  - React Router for navigation                      │
│  - Clerk React SDK for authentication               │
│  - Fetch API for HTTP requests                      │
└─────────────────────────────────────────────────────┘
                         ↓ HTTPS/REST API + JWT
┌─────────────────────────────────────────────────────┐
│              Application Layer                       │
│  FastAPI Backend - Port 5000                        │
│  - Clerk JWT verification middleware                │
│  - CORS middleware                                  │
│  - RESTful API with OpenAPI docs                    │
│  - Pydantic data validation                         │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              Authentication Layer                    │
│  Clerk Authentication Service                        │
│  - JWT token generation/verification                │
│  - OAuth providers (Google, GitHub, etc.)           │
│  - User management                                  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                  ML Model Layer                      │
│  - Random Forest (Crop Recommendation)              │
│  - YOLOv8 (Weed Detection)                          │
│  - scikit-learn, ultralytics, PyTorch               │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                   Data Layer                         │
│  - Supabase PostgreSQL (User data, history)         │
│  - Local file system (Uploads, ML models)           │
│  - CSV datasets (Training data)                     │
└─────────────────────────────────────────────────────┘
```

### 4.2 Technology Stack

#### Frontend
- **Framework:** React.js 18+
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Authentication:** Clerk React SDK
- **Styling:** CSS3 (custom styles)

#### Backend
- **Framework:** FastAPI 0.100+
- **ASGI Server:** Uvicorn
- **Authentication:** Clerk JWT verification
- **Database:** Supabase (PostgreSQL)
- **File Handling:** Python multipart

#### Machine Learning
- **Crop Model:** Random Forest (scikit-learn)
- **Weed Detection:** YOLOv8 (ultralytics)
- **Deep Learning:** PyTorch
- **Image Processing:** OpenCV, Pillow

#### Database & Authentication
- **Database:** Supabase (PostgreSQL with REST API)
- **Authentication:** Clerk (JWT-based, OAuth support)
- **Real-time:** Supabase Realtime (optional)

#### Deployment
- **Python:** 3.8+
- **Node.js:** 16+
- **OS:** Cross-platform (Windows, macOS, Linux)

### 4.3 Data Models

#### User Model (Supabase)
```sql
users {
  id: UUID (Primary Key),
  clerk_user_id: TEXT (Unique, Not Null),
  email: TEXT (Not Null),
  username: TEXT,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

#### Crop Recommendation History (Supabase)
```sql
crop_recommendations {
  id: UUID (Primary Key),
  clerk_user_id: TEXT (Foreign Key),
  input_data: JSONB (N, P, K, temp, humidity, ph, rainfall),
  recommended_crop: TEXT,
  confidence: FLOAT,
  created_at: TIMESTAMP
}
```

#### Weed Detection History (Supabase)
```sql
weed_detections {
  id: UUID (Primary Key),
  clerk_user_id: TEXT (Foreign Key),
  image_filename: TEXT,
  weed_count: INTEGER,
  created_at: TIMESTAMP
}
```

#### Crop Recommendation Input (API)
```json
{
  "N": Float (Nitrogen content, 0-200),
  "P": Float (Phosphorus content, 0-200),
  "K": Float (Potassium content, 0-300),
  "temperature": Float (°C, -10 to 50),
  "humidity": Float (%, 0-100),
  "ph": Float (pH value, 0-14),
  "rainfall": Float (mm, 0-5000)
}
```

#### Weed Detection Input (API)
```
Multipart form-data with image file (JPG/PNG/JPEG, max 16MB)
Authorization: Bearer <clerk_jwt_token>
```

---

## 5. API Specifications

### 5.1 Authentication

Authentication is handled entirely by Clerk. The backend verifies JWT tokens provided in the `Authorization` header.

**Authorization Header Format:**
```
Authorization: Bearer <clerk_jwt_token>
```

All protected endpoints require a valid Clerk JWT token. Tokens are automatically obtained by the Clerk React SDK on the frontend.

---

### 5.2 System Endpoints

#### GET /api/health
**Description:** Check backend server and ML model status

**Authentication:** Not required

**Response (200 OK):**
```json
{
  "status": "healthy",
  "crop_model_loaded": true,
  "weed_model_loaded": true,
  "models_loaded": true
}
```

---

### 5.3 Machine Learning Endpoints

#### POST /api/crop-recommendation
**Description:** Get crop recommendation based on soil parameters  
**Authentication:** Required (Clerk JWT token)

**Headers:**
```
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "N": 40.0,
  "P": 50.0,
  "K": 60.0,
  "temperature": 25.5,
  "humidity": 75.0,
  "ph": 6.5,
  "rainfall": 200.0
}
```

**Response (200 OK):**
```json
{
  "recommended_crop": "Rice",
  "confidence": 0.95
}
```

**Error Responses:**
- 400: Invalid input parameters (validation error)
- 401: Missing or invalid authentication token
- 500: Model not available

---

#### POST /api/weed-detection
**Description:** Detect weeds in uploaded image  
**Authentication:** Required (Clerk JWT token)

**Headers:**
```
Authorization: Bearer <clerk_jwt_token>
```

**Request:** Multipart form-data with 'image' field

**Response (200 OK):**
```json
{
  "result_image": "base64_encoded_string",
  "detections": 3,
  "message": "Weed detection completed successfully"
}
```

**Error Responses:**
- 400: No image provided / Invalid image format / File too large
- 401: Missing or invalid authentication token
- 500: Model not available

---

### 5.4 API Documentation

Interactive API documentation is automatically generated by FastAPI:

- **Swagger UI:** http://localhost:5000/api/docs
- **ReDoc:** http://localhost:5000/api/redoc
- **OpenAPI JSON:** http://localhost:5000/api/openapi.json

---

## 6. Machine Learning Models

### 6.1 Crop Recommendation Model

**Model Type:** Random Forest Classifier  
**Model File:** `Models/crop_recommendation_model.pkl`

**Training Dataset:**
- Source: `data/Crop_ds.csv`
- Features: 7 (N, P, K, temperature, humidity, pH, rainfall)
- Target: Crop type (classification)

**Feature Descriptions:**
- **N (Nitrogen):** Nitrogen content in soil (kg/ha)
- **P (Phosphorus):** Phosphorus content in soil (kg/ha)
- **K (Potassium):** Potassium content in soil (kg/ha)
- **Temperature:** Ambient temperature (°C)
- **Humidity:** Relative humidity (%)
- **pH:** Soil pH level (0-14 scale)
- **Rainfall:** Annual rainfall (mm)

**Performance Metrics (Target):**
- Accuracy: > 95%
- Precision: > 90%
- Recall: > 90%

**Training Notebook:** `Notebooks/CropModel_train.ipynb`

---

### 6.2 Weed Detection Model

**Model Type:** YOLOv8 Object Detection  
**Model File:** `Models/weed_detection_model.pt`

**Training Dataset:**
- Source: `data/weeddataset/`
- Format: YOLO format (images + labels)
- Split: Train / Validation / Test
- Annotations: Bounding boxes for weed instances

**Architecture:**
- Base Model: YOLOv8n (nano variant)
- Input: RGB images (variable size)
- Output: Bounding boxes with confidence scores

**Performance Metrics (Target):**
- mAP@0.5: > 80%
- Inference Time: < 5 seconds per image
- Precision: > 85%
- Recall: > 80%

**Training Notebook:** `Notebooks/WeedModel_train.ipynb`

---

## 7. User Workflows

### 7.1 New User Registration Flow
1. User navigates to home page
2. Clicks "Sign Up" button
3. Fills registration form (username, email, password)
4. Submits form
5. System validates inputs and creates account
6. User is redirected to login
7. User logs in and accesses dashboard

### 7.2 Crop Recommendation Workflow
1. Authenticated user navigates to "Crop Recommendation"
2. User enters soil parameters:
   - N, P, K values
   - Temperature, humidity
   - pH level
   - Rainfall data
3. User clicks "Get Recommendation"
4. System processes inputs through ML model
5. System displays recommended crop and confidence score
6. User can save/share results or submit new query

### 7.3 Weed Detection Workflow
1. Authenticated user navigates to "Weed Detection"
2. User uploads image via drag-and-drop or file picker
3. System validates image (format, size)
4. User clicks "Detect Weeds"
5. System processes image through YOLOv8 model
6. System displays annotated image with bounding boxes
7. System shows count of detected weeds
8. User can download results or upload new image

---

## 8. UI/UX Requirements

### 8.1 Design Principles
- **Simplicity:** Minimize cognitive load with clean, intuitive layouts
- **Accessibility:** High contrast, readable fonts, keyboard navigation
- **Responsiveness:** Seamless experience across devices
- **Feedback:** Clear visual indicators for actions and states

### 8.2 Color Scheme
- Primary: Green shades (agriculture theme)
- Secondary: Earth tones (brown, yellow)
- Accent: Blue (trust, technology)
- Alert: Red (errors), Yellow (warnings), Green (success)

### 8.3 Typography
- Headers: Sans-serif, bold, 24-32px
- Body: Sans-serif, regular, 14-16px
- Labels: Sans-serif, medium, 12-14px

### 8.4 Key UI Components
- **Navigation Bar:** Fixed top, responsive hamburger menu for mobile
- **Cards:** Elevated surfaces for feature sections
- **Forms:** Clear labels, inline validation, helpful error messages
- **Buttons:** Prominent CTAs with hover states
- **Loading Indicators:** Spinners for async operations
- **Toast Notifications:** Success/error messages

---

## 9. Testing Requirements

### 9.1 Unit Testing
- Backend API endpoints (Flask routes)
- Frontend components (React components)
- ML model inference functions
- Utility functions

### 9.2 Integration Testing
- Frontend-backend API integration
- Authentication flow
- File upload and processing
- ML model prediction pipeline

### 9.3 End-to-End Testing
- Complete user registration and login flow
- Crop recommendation from input to result
- Weed detection from upload to result display
- Navigation and protected route access

### 9.4 Performance Testing
- Load testing with 100 concurrent users
- Stress testing for image processing
- Response time benchmarks for API endpoints

### 9.5 Security Testing
- SQL injection attempts
- XSS vulnerability checks
- File upload security validation
- Authentication bypass attempts

---

## 10. Deployment Requirements

### 10.1 Development Environment
- Local development on Windows/macOS/Linux
- Python virtual environment
- Node.js and npm installed
- Git for version control

### 10.2 Production Environment (Recommended)
- **Web Server:** Gunicorn (Flask) + Nginx
- **Frontend Hosting:** Vercel / Netlify / Static hosting
- **Backend Hosting:** AWS EC2 / DigitalOcean / Heroku
- **Database:** PostgreSQL / MySQL
- **Storage:** AWS S3 / Cloud storage for uploads
- **SSL:** HTTPS with Let's Encrypt

### 10.3 CI/CD Pipeline
- Automated testing on pull requests
- Staging environment for pre-production testing
- Production deployment with rollback capability

---

## 11. Future Enhancements

### 11.1 Phase 2 Features (Short-term)
| Feature | Priority | Description |
|---------|----------|-------------|
| User history | P1 | Save and view past recommendations and detections |
| Export reports | P1 | Download PDF/CSV reports of results |
| Multi-language | P2 | Support regional languages for wider accessibility |
| Mobile app | P2 | Native iOS/Android applications |

### 11.2 Phase 3 Features (Medium-term)
| Feature | Priority | Description |
|---------|----------|-------------|
| Real-time weather | P1 | Integrate weather API for automatic data input |
| Soil testing integration | P1 | IoT sensor integration for automated soil readings |
| Community forum | P2 | User community for knowledge sharing |
| Pest detection | P1 | Expand to detect pests and diseases |

### 11.3 Phase 4 Features (Long-term)
| Feature | Priority | Description |
|---------|----------|-------------|
| Drone integration | P2 | Process aerial imagery from drones |
| Predictive analytics | P1 | Forecast crop yields and optimal planting times |
| Market integration | P2 | Connect to agricultural marketplaces |
| Blockchain tracking | P3 | Supply chain transparency features |

---

## 12. Success Metrics

### 12.1 User Adoption
- Target: 1,000 registered users in first 6 months
- Target: 60% monthly active user rate
- Target: Average 10 recommendations per user per month

### 12.2 Technical Performance
- System uptime: > 99%
- Average response time: < 2 seconds
- Model accuracy: > 90% for both models

### 12.3 User Satisfaction
- Net Promoter Score (NPS): > 50
- User satisfaction rating: > 4/5
- Feature usage rate: > 70% for core features

### 12.4 Business Impact
- Reduce crop selection errors by 40%
- Reduce weed identification time by 60%
- Increase farmer productivity by 25%

---

## 13. Risks & Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Model accuracy issues | High | Medium | Regular retraining with feedback data; manual review option |
| Scalability bottlenecks | Medium | Medium | Implement caching, CDN, load balancing early |
| Data privacy concerns | High | Low | Implement GDPR compliance; clear privacy policy |
| Internet connectivity | High | High | Offline mode support; progressive web app |
| User adoption barriers | High | Medium | User education materials; onboarding tutorials |

---

## 14. Dependencies & Assumptions

### 14.1 Dependencies
- **External Libraries:** Stable versions of scikit-learn, ultralytics, React
- **Infrastructure:** Reliable hosting provider with GPU support
- **Data:** Availability of labeled training data for model improvements

### 14.2 Assumptions
- Users have basic smartphone or computer with internet access
- Users can provide accurate soil parameter measurements
- Training datasets are representative of target regions
- Users have basic literacy in the application language

---

## 15. Compliance & Legal

### 15.1 Data Privacy
- Comply with GDPR (EU users) and local data protection laws
- User data encryption at rest and in transit
- Clear data retention and deletion policies

### 15.2 Terms of Service
- Define acceptable use policy
- Liability disclaimers for crop recommendations
- User-generated content guidelines

### 15.3 Intellectual Property
- Open-source license (MIT) for codebase
- Model licensing considerations for commercial use
- Third-party library compliance

---

## 16. Support & Maintenance

### 16.1 User Support
- Documentation: Comprehensive user guide and FAQs
- Support Channels: GitHub issues, email support
- Response Time: < 48 hours for non-critical issues

### 16.2 System Maintenance
- Regular security updates
- Database backups (daily)
- Model retraining schedule (quarterly)
- Performance monitoring and optimization

---

## 17. Documentation Requirements

### 17.1 Technical Documentation
- API documentation (Swagger/OpenAPI)
- Code documentation (docstrings, comments)
- Architecture diagrams
- Deployment guides

### 17.2 User Documentation
- User manual
- Tutorial videos
- FAQ section
- Troubleshooting guide

---

## 18. Glossary

| Term | Definition |
|------|------------|
| **N-P-K** | Nitrogen, Phosphorus, Potassium - primary soil nutrients |
| **YOLOv8** | You Only Look Once v8 - object detection algorithm |
| **Random Forest** | Ensemble machine learning algorithm for classification |
| **mAP** | Mean Average Precision - object detection accuracy metric |
| **ORM** | Object-Relational Mapping - database abstraction layer |
| **CORS** | Cross-Origin Resource Sharing - browser security feature |
| **JWT** | JSON Web Token - authentication mechanism |

---

## 19. Approval & Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Technical Lead | | | |
| UX Designer | | | |
| QA Lead | | | |

---

## 20. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-05 | Initial | Initial PRD creation |

---

**Document End**

For questions or clarifications, please contact the project maintainers via the GitHub repository.
