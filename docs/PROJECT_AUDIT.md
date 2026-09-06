# eRTMAC-NWIS — Complete Technical Audit

## 1. Executive Summary
**Overall Status:** 🟡 **Prototype Ready With Major Warnings**
The repository contains a robust backend data pipeline, a mathematical planning engine, a heuristic similarity engine, and a fully stylized React frontend. However, **the frontend and backend are completely disconnected**. The current UI is a 100% mocked shell that does not interact with the underlying data or APIs. Furthermore, the WITSML cohort currently contains depth-indexed logs rather than time-series telemetry, which heavily limits real-time drilling playback.

## 2. What the System Currently Does
1. **Data Pipeline:** Extracts, normalizes, and documents Volve exploration well data and historical drilling events.
2. **Planning Engine (Backend):** Uses Ray-Casting and Haversine spacing to generate mathematically constrained candidate locations within a polygon and score them based on proximity and targets.
3. **Similarity Engine (Backend):** Calculates a 0-100% similarity score between a current well and historical wells using deterministic weighted formulas (geography, depth, formation, trajectory, context) and correlates risk events.
4. **Frontend UI (Shell):** Displays an authenticated workspace, project hub, and candidate planning interface using **hardcoded mock data**.

## 3. Actual Architecture
```
RAW VOLVE/BSEE DATA (CSV/XML)
       ↓
PYTHON DATA PIPELINE (generate_*, parse_*)
       ↓
PROCESSED DATASETS (data/processed/)
       ↓
BACKEND ENGINES (Planning, Similarity)  <-- [ DISCONNECTED ] --> FRONTEND UI (React, Mock Data)
```

## 4. User Workflows

### Existing Project (Landing Page)
- **User Does:** Views project cards and clicks "Open Project Dashboard".
- **System Does:** UI state change only.
- **Status:** ⚠️ MOCKED. Data is entirely hardcoded.

### New Well Project
- **User Does:** Clicks "+ Create New Well Project", selects Field, Formation, Depth, and clicks "Start Planning Mode".
- **System Does:** Routes to `CandidatePlanning.jsx` and displays Candidates A, B, and C.
- **Status:** ⚠️ MOCKED. No API call is made. The backend Planning Engine (`api.py`) is never invoked. 

### Planning
- **Status:** ✅ IMPLEMENTED (Backend) / ⚠️ MOCKED (Frontend). The backend can generate GeoJSON candidates, but the frontend displays hardcoded JSON strings.

### Similarity
- **Status:** ✅ IMPLEMENTED (Backend) / ⚠️ MOCKED (Frontend). The backend calculates heuristic scores. The frontend hardcodes values like "89%".

### Active Well / Drilling Monitor
- **Status:** ❌ NOT IMPLEMENTED. The UI component does not exist yet. WITSML data exists but is flawed.

### Historical Intelligence / Chatbot
- **Status:** ❌ NOT IMPLEMENTED.

## 5. Landing Page Audit
| UI Element | Purpose | Functional? | Data Source | Hardcoded? | Backend/API | Problems |
| --- | --- | --- | --- | --- | --- | --- |
| Project Cards | Show active/planned wells | No | `mockData.js` | Yes (100%) | None | Claims "Current: 2,184m" but data is fake. |
| Login Modal | Authenticate engineer | No | React State | Yes | None | Accepts any input, bypasses auth. |
| "Open Project" | Route to dashboard | Partial | React State | Yes | None | Opens a static UI view. |

## 6. New Well Project Audit
**Current Workflow:**
User clicks "+ Create New Well Project" → Selects dropdowns → Clicks "Start Planning Mode" → React state changes to CandidatePlanning view showing hardcoded Candidates A, B, and C. No backend call is made.

**Ideal Workflow:**
User enters target → UI sends POST `/planning/candidates/generate` with GeoJSON → Backend calculates candidates → UI renders candidates dynamically on a map.

## 7. Planning Engine Audit
- **Purpose:** Find valid, spaced well locations within a prospect polygon.
- **Input:** GeoJSON polygon, target formation, depth, constraints.
- **Logic:** Mathematical Ray-Casting (point-in-polygon), Haversine minimum spacing against historical NPD wells, heuristic scoring.
- **Output:** GeoJSON `FeatureCollection` with candidate coordinates.
- **Model Type:** Deterministic rule/weighted scoring. It is NOT Machine Learning, which is highly appropriate for spatial safety constraints.

## 8. Similarity Engine Audit
- **Purpose:** Find the closest matching historical wells and correlate their problems.
- **Input:** Proposed well metadata, target depth.
- **Logic:** Deterministic heuristic scoring (0-100%).
  - Geographic: Haversine distance (10km max).
  - Depth: Absolute difference ratio.
  - Formation: Set Intersection over Union (Jaccard).
  - Trajectory: Inclination difference.
- **Model Type:** **NOT ML.** It is a weighted heuristic ranking system.
- **Meaning of Score:** "89% similar" is a mathematical composite score, **NOT a calibrated probability.**

## 9. Data Pipeline Audit
- `sample_wells.csv` / `events.csv`: ✅ Clean, normalized, and usable for similarity and context.
- `volve_realtime_demo/*.csv`: ⚠️ Limited. See WITSML Audit below.

## 10. WITSML Audit
**WARNING:** The processed WITSML cohort is **HISTORICAL WITSML REPLAY / SIMULATED ACTIVE-WELL DATA**. It must never be called "Live Telemetry".
- `15/9-F-1`: Time-indexed, but represents a static depth interval (0m progression). Suitable for testing sensor noise, but not active drilling.
- `15/9-F-4, 5, 7`: **Depth-indexed (MD logs).** Missing `TIME` completely. Extremely sparse. Suitable for spatial feature mapping but **UNSUITABLE for chronological time-series playback or real-time RNN/LSTM prediction.**

## 11. Dashboard Data Readiness

| Dashboard Element | Required Data | Available? | Source | Real/Mock | Action Needed |
| --- | --- | --- | --- | --- | --- |
| Map & Offsets | Coordinates | YES | `sample_wells.csv` | Real | Connect Map UI |
| Current Sensors | ROP, RPM, Torque, etc. | PARTIAL | `WITSML (F-1)` | Real | F-1 is static depth. Others lack Time. |
| Parameter Graphs | Time/Depth series | PARTIAL | WITSML | Real | Must plot against Depth, not Time. |
| Risk Classifier | ML Output, Events | PARTIAL | `events.csv` | Mock | Prediction ML not built. |
| Similar Wells | Rank, Score, Distance | YES | `similarity.py` | Real | Hook up Similarity API |
| Historical Events | Event, Depth, Source | YES | `events.csv` | Real | Hook up to UI |

## 12. Hardcoded/Mock Data Audit
- `CANDIDATES_DATA` (mockData.js): 100% Fake. Dangerous because it displays fake risks.
- `OFFSET_WELLS` (mockData.js): Uses real well names (15/9-19 A) but fake scores (91%) and fake events ("Pack-off at 2,120m"). 
- `TELEMETRY_INITIAL` (mockData.js): 100% Fake.

## 13. Cross-Module Compatibility
- **Mismatch:** The Planning Engine requires GeoJSON input, but the Frontend Planning form uses simple text dropdowns (Area/Field) instead of a map drawn polygon. 
- **Fix Needed:** Frontend must implement a Mapbox/Leaflet widget to pass polygons to the backend.

## 14. Bugs
- `scripts/test_similarity.py` contains a hardcoded local machine path: `C:\Users\User\Downloads\wellbore_exploration_all.csv`.
- `backend/api.py` does not run out-of-the-box (uvicorn not installed locally).

## 15. Data Quality Problems
- Depth-indexed WITSML logs break the illusion of a chronological telemetry stream.

## 16. Unsupported/Falsely Stated Claims
- Frontend UI says: "Real-time ROP, WOB... WITSML Telemetry Replay". Change to: **"Historical WITSML Depth/Sensor Replay"**.

## 17. Missing Features
- FastAPI integration for the Similarity Engine.
- Drilling Monitor Dashboard UI.
- Prediction / Risk ML Model.
- Chatbot RAG architecture.

## 18. P0 — Must Fix Before Demo
1. Connect the React frontend to `backend/api.py` using `fetch` or `axios`.
2. Wrap `backend/similarity.py` into FastAPI endpoints.
3. Replace `mockData.js` values with API responses.

## 19. P1 — Should Fix
1. Fix the hardcoded paths in the Python test scripts.
2. Build the Drilling Monitor UI shell and populate with `events.csv` and `F-1` static telemetry.

## 20. P2 — Nice to Have
1. True time-series prediction model.

## 21. Recommended Development Order
1. **Backend Integration:** Map `similarity.py` into `api.py`. Start uvicorn.
2. **Frontend Wiring:** Connect `ProjectHub.jsx` to `/planning/candidates/generate`.
3. **Drilling UI:** Build the Dashboard shell.
4. **Data Wiring:** Feed real WITSML data to the Dashboard.

## 22. Final Verdict
The team has built highly impressive underlying mathematical engines and a beautiful frontend shell, but they are working in silos. The project is currently a **facade**. The absolute highest priority is halting new feature development and connecting the existing React UI to the existing FastAPI backend.

***

# WHAT YOU NEED TO KNOW AS PROJECT LEAD

**1. What have we actually built?**
We have a beautiful frontend UI (React) and two very smart backend calculators (Planning and Similarity). We also have clean, normalized data. However, **they are not connected**. The UI is currently a hollow shell filled with fake numbers.

**2. What does the landing page actually do?**
Nothing right now. It just displays fake, hardcoded text to show what it *will* look like.

**3. What does "Create New Well Project" actually do?**
It switches the screen to show 3 hardcoded fake candidates. It does NOT currently talk to the backend. 

**4. What does Planning actually do?**
The backend code for it is excellent. It uses real math and geography to find safe spots to drill and avoid other wells. But we need to wire the UI to use it.

**5. What does Similarity actually do?**
It compares a new well against historical wells using deterministic rules (e.g., comparing formations and depths). It is **not** a Neural Network or ML model, which is actually a good thing because it is 100% explainable. It gives a score out of 100%.

**6. What data do we actually have?**
We have fantastic metadata and historical event data (stuck pipes, kicks). We have drilling telemetry, but most of it is logged by *depth*, not *time*. We cannot easily hit "Play" and watch a time-lapse of the drilling.

**7. What can the future dashboard show using REAL data?**
It CAN show the map, similar historical wells, and historical risk events perfectly. It CANNOT easily show a live chronological graph of pressure changes over time (it must be graphed over depth instead).

**8. What is currently fake/hardcoded?**
Every single number, score, depth, and graph currently visible on the React frontend.

**9. What is still missing?**
The Prediction/Risk ML Model, the Chatbot, the actual Drilling Dashboard UI, and the API connections between frontend and backend.

**10. What should each teammate work on next?**
- **Frontend Dev:** Delete `mockData.js` and connect the UI to the Python API using `fetch`. Build the Drilling Dashboard UI.
- **Backend Dev:** Add the Similarity Engine into the FastAPI server so the frontend can call it.
- **Data/ML:** Build a very simple Risk Predictor using the depth-indexed logs. 

**11. What should NOT be worked on yet?**
Do not try to build a complex RAG Chatbot. Get the core API connected first. Do not try to extract more WITSML data; use what we have.

**12. What can we honestly demonstrate to SIH judges?**
Once connected, we can honestly demonstrate: "We ingest a prospect, run a deterministic spatial planning engine, use a heuristic similarity engine to find historical offset risks, and plot them geographically to warn engineers." We cannot claim we have a live real-time telemetry ML predictor yet.

