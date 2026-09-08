"""
FastAPI Backend Integration Test Suite for eRTMAC-NWIS
Tests all API contracts expected by frontend/src/data/apiClient.js
"""

import sys
import math
from pathlib import Path
from starlette.testclient import TestClient

# Ensure repository root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.api import app

client = TestClient(app)

def assert_no_nan_or_inf(obj):
    """Recursively verify no NaN or Infinity exists in JSON output."""
    if isinstance(obj, float):
        assert not math.isnan(obj), f"Found NaN in response float: {obj}"
        assert not math.isinf(obj), f"Found Infinity in response float: {obj}"
    elif isinstance(obj, dict):
        for k, v in obj.items():
            assert_no_nan_or_inf(v)
    elif isinstance(obj, list):
        for item in obj:
            assert_no_nan_or_inf(item)

def test_1_health_endpoint():
    print("\n--- TEST 1: GET /api/health ---")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert data["metadata_wells_loaded"] >= 26
    assert data["historical_events_loaded"] >= 400
    assert_no_nan_or_inf(data)
    print(f"PASS: Health OK, {data['metadata_wells_loaded']} wells and {data['historical_events_loaded']} events loaded.")

def test_2_similarity_rank_endpoint():
    print("\n--- TEST 2: POST /api/similarity/rank ---")
    payload = {
        "lat": 58.437,
        "lng": 1.873,
        "depth": 3200,
        "field": "VOLVE",
        "formation": "HUGIN FM",
        "top_k": 6
    }
    res = client.post("/api/similarity/rank", json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert "comparable_wells" in data
    assert isinstance(data["comparable_wells"], list)
    assert len(data["comparable_wells"]) == 6

    top = data["comparable_wells"][0]
    required_keys = [
        "well", "similarity_score", "formation_td", "formation_hc",
        "formation_similarity", "depth_similarity", "trajectory_similarity",
        "geographic_similarity", "context_similarity", "well_type",
        "total_historical_events", "historical_events"
    ]
    for k in required_keys:
        assert k in top, f"Missing required key '{k}' in comparable_wells item"
    
    assert 0.0 <= top["similarity_score"] <= 100.0
    assert isinstance(top["historical_events"], dict)
    assert_no_nan_or_inf(data)
    print(f"PASS: Ranked {len(data['comparable_wells'])} comparable wells. Top match: {top['well']} (Score: {top['similarity_score']}/100)")

def test_3_planning_candidates_endpoint():
    print("\n--- TEST 3: POST /api/planning/candidates ---")
    payload = {
        "reference": {
            "lat": 58.437,
            "lng": 1.873,
            "name": "Proposed Well (15/9 block)"
        },
        "target_depth": 3200,
        "formation": "HUGIN FM",
        "constraints": {
            "minimum_well_spacing": 500
        }
    }
    res = client.post("/api/planning/candidates", json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert "candidates" in data
    assert len(data["candidates"]) > 0

    cand = data["candidates"][0]
    required_keys = [
        "candidate_id", "lat", "lon", "target_depth", "closest_well", "closest_dist",
        "scores", "positive_factors", "negative_factors", "trajectory_estimate", "risk_profile"
    ]
    for k in required_keys:
        assert k in cand, f"Missing required key '{k}' in candidate"

    assert "overall" in cand["scores"], "Missing 'overall' in scores dict"
    assert "spatial_suitability" in cand["scores"], "Missing 'spatial_suitability' in scores dict"
    assert "spacing" in cand["scores"], "Missing 'spacing' in scores dict"
    assert "level" in cand["risk_profile"]
    assert_no_nan_or_inf(data)
    print(f"PASS: Generated {len(data['candidates'])} feasible candidates. Top candidate: {cand['candidate_id']} (Score: {cand['scores']['overall']})")

def test_4_events_endpoint():
    print("\n--- TEST 4: GET /api/events ---")
    res = client.get("/api/events?well=15/9-19%20A&limit=30")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["well"] == "15/9-19 A"
    assert "total" in data
    assert "events" in data
    assert len(data["events"]) > 0

    evt = data["events"][0]
    required_keys = [
        "event_id", "event_type", "well_name", "depth_start",
        "depth_end", "description", "source", "source_file", "confidence"
    ]
    for k in required_keys:
        assert k in evt, f"Missing key '{k}' in event item"
    
    assert evt["well_name"] == "15/9-19 A"
    assert_no_nan_or_inf(data)
    print(f"PASS: Retrieved {len(data['events'])} events for well 15/9-19 A. Sample event: {evt['event_type']} at depth {evt['depth_start']}m")

def test_5_well_detail_endpoint():
    print("\n--- TEST 5: GET /api/wells/{well} ---")
    res = client.get("/api/wells/15/9-F-5")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["wellbore_name"] == "15/9-F-5"
    assert data["latitude"] is not None
    assert data["longitude"] is not None
    assert data["total_depth"] is not None
    assert data["tvd"] is not None
    assert_no_nan_or_inf(data)
    print(f"PASS: Well 15/9-F-5 detail: Lat {data['latitude']:.4f}, Lon {data['longitude']:.4f}, TD {data['total_depth']}m")

def test_6_unknown_well_returns_404():
    print("\n--- TEST 6: GET /api/wells/{unknown} (404 Test) ---")
    res = client.get("/api/wells/NON_EXISTENT_WELL_999")
    assert res.status_code == 404, f"Expected 404 for unknown well, got {res.status_code}"
    assert "not found" in res.json()["detail"].lower()
    print("PASS: Non-existent well cleanly returned 404.")

def test_7_analysis_endpoint():
    print("\n--- TEST 7: POST /api/analysis ---")
    payload = {
        "well": "15/9-F-5",
        "depth": 2500,
        "top_k": 5
    }
    res = client.post("/api/analysis", json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    required_keys = [
        "well", "depth_m", "risk_score", "risk_level", "dominant_hazard",
        "contributing_factors", "nearby_events", "comparable_wells", "disclaimer"
    ]
    for k in required_keys:
        assert k in data, f"Missing key '{k}' in analysis response"

    assert data["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert 0.0 <= data["risk_score"] <= 100.0
    assert len(data["comparable_wells"]) > 0
    assert_no_nan_or_inf(data)
    print(f"PASS: Analysis for 15/9-F-5 @ 2500m: Risk={data['risk_score']} ({data['risk_level']}), Dominant={data['dominant_hazard']}")

def test_8_chat_endpoint():
    print("\n--- TEST 8: POST /api/chat ---")
    payload = {
        "question": "What happened near 2200 m?",
        "current_well": "15/9-19 A",
        "current_depth": 2200.0,
        "area": None
    }
    res = client.post("/api/chat", json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    required_keys = ["question", "answer", "tools_selected", "tool_calls", "evidence"]
    for k in required_keys:
        assert k in data, f"Missing key '{k}' in chat response"

    assert len(data["tools_selected"]) > 0
    assert len(data["tool_calls"]) > 0
    assert len(data["answer"]) > 0
    assert_no_nan_or_inf(data)
    print(f"PASS: Chat query answered. Tools used: {data['tools_selected']}")

def run_all_tests():
    print("=" * 70)
    print("eRTMAC-NWIS FASTAPI INTEGRATION TEST SUITE")
    print("=" * 70)
    test_1_health_endpoint()
    test_2_similarity_rank_endpoint()
    test_3_planning_candidates_endpoint()
    test_4_events_endpoint()
    test_5_well_detail_endpoint()
    test_6_unknown_well_returns_404()
    test_7_analysis_endpoint()
    test_8_chat_endpoint()
    print("\n" + "=" * 70)
    print("ALL 8 API INTEGRATION TESTS PASSED PERFECTLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_all_tests()

