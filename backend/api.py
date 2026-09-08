"""
eRTMAC-NWIS FastAPI Backend Application
Exposes REST endpoints for:
- Similarity / Analogue Ranking (/api/similarity/rank)
- Well Planning & Candidate Scoring (/api/planning/candidates)
- Historical Event DDR Archive (/api/events)
- Well Metadata Details (/api/wells/{well})
- Grounded Risk Analysis (/api/analysis)
- Agentic Chatbot Assistant (/api/chat)
"""

import os
import sys
import csv
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Query, Path as FPath
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure repository root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Import existing backend engines
from backend.similarity import SimilarityEngine
from backend.planning_engine import PlanningEngine
from backend.chatbot import eRTMAC_Chatbot
from ml_v2.demo_risk_scorer import DemoRiskScorer

# Data paths (Repository-relative)
METADATA_PATH = BASE_DIR / "data" / "processed" / "volve_well_metadata.csv"
EVENTS_PATH = BASE_DIR / "data" / "processed" / "events.csv"
EVENTS_DEMO_PATH = BASE_DIR / "data" / "processed" / "events_demo.csv"
MODEL_PATH = BASE_DIR / "data" / "processed" / "demo_risk_model.joblib"

# Initialize backend engines globally
sim_engine = SimilarityEngine(
    metadata_path=str(METADATA_PATH),
    events_path=str(EVENTS_DEMO_PATH)
)

planning_engine = PlanningEngine(metadata_path=str(METADATA_PATH))
# Ensure planning engine has well data from normalized metadata
if not planning_engine.existing_wells and sim_engine.wells:
    planning_engine.existing_wells = [
        {
            'name': w['name'],
            'lat': w['latitude'],
            'lon': w['longitude'],
            'td': w.get('total_depth') or 0.0
        }
        for w in sim_engine.wells
        if w.get('latitude') is not None and w.get('longitude') is not None
    ]

demo_risk_scorer = DemoRiskScorer(
    model_path=str(MODEL_PATH),
    metadata_path=str(METADATA_PATH),
    events_path=str(EVENTS_DEMO_PATH)
)

chatbot = eRTMAC_Chatbot(
    metadata_path=str(METADATA_PATH),
    events_path=str(EVENTS_DEMO_PATH)
)

# Helper function to normalize well names consistently
def normalize_well_name(name: Optional[str]) -> str:
    if not name:
        return ""
    return str(name).replace("NO ", "").strip()

# Load raw events list for the events endpoint
def _load_historical_events() -> List[Dict[str, Any]]:
    events = []
    if not os.path.exists(EVENTS_PATH):
        return events
    with open(EVENTS_PATH, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            events.append(row)
    return events

all_historical_events = _load_historical_events()

# FastAPI App setup
app = FastAPI(
    title="eRTMAC-NWIS Drilling Intelligence API",
    description="Grounded AI & Engineering Analytics Backend for Well Planning and Replayed Telemetry Hazard Monitoring",
    version="1.0.0"
)

# Configure CORS for local Vite dev server and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/api")

# =========================================================
# PYDANTIC REQUEST & RESPONSE SCHEMAS
# =========================================================

class SimilarityRankRequest(BaseModel):
    lat: float = Field(..., description="Target prospect latitude in decimal degrees")
    lng: float = Field(..., description="Target prospect longitude in decimal degrees")
    depth: float = Field(..., description="Target depth in meters MD")
    field: str = Field(default="VOLVE", description="Field name context")
    formation: str = Field(default="", description="Target geological formation")
    top_k: int = Field(default=6, ge=1, le=50, description="Number of top comparable wells to return")
    target_well_name: Optional[str] = Field(default=None, description="Optional target well name to exclude from comparison")

class PlanningCandidatesRequest(BaseModel):
    reference: Optional[Dict[str, Any]] = Field(default=None, description="Reference anchor point {lat, lng, name}")
    area: Optional[Dict[str, Any]] = Field(default=None, description="GeoJSON polygon area")
    target_depth: float = Field(default=3200.0, description="Target drilling depth in meters MD")
    formation: str = Field(default="HUGIN FM", description="Target formation")
    constraints: Optional[Dict[str, Any]] = Field(default=None, description="Planning constraints e.g. minimum_well_spacing")

class AnalysisRequest(BaseModel):
    well: str = Field(..., description="Target wellbore identifier (e.g. '15/9-F-5')")
    depth: float = Field(..., description="Current drilling depth in meters MD")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of comparable offset wells")

class ChatRequest(BaseModel):
    question: str = Field(..., description="User engineering or geological query")
    current_well: Optional[str] = Field(default=None, description="Active well session context")
    current_depth: Optional[float] = Field(default=None, description="Active depth session context")
    area: Optional[List[Any]] = Field(default=None, description="Optional planning polygon coordinates")

# =========================================================
# ENDPOINTS
# =========================================================

@router.get("/health")
def health_check():
    """Health check endpoint for Vite proxy and deployment probes."""
    return {
        "status": "ok",
        "version": "1.0.0",
        "service": "eRTMAC-NWIS Drilling Intelligence API",
        "metadata_wells_loaded": len(sim_engine.wells),
        "historical_events_loaded": len(all_historical_events)
    }

@router.post("/similarity/rank")
def rank_similar_wells(request: SimilarityRankRequest):
    """
    Ranks historical offset wells against the query well using the deterministic
    Weighted Similarity Index (0-100).
    """
    current_dict = {
        "name": normalize_well_name(request.target_well_name),
        "latitude": request.lat,
        "longitude": request.lng,
        "total_depth": request.depth,
        "tvd": request.depth,
        "field": request.field or "VOLVE",
        "formation_td": request.formation or "",
        "formation_hc": request.formation or ""
    }

    target_name = normalize_well_name(request.target_well_name) if request.target_well_name else None

    try:
        raw_report = sim_engine.similarity_report(
            current_dict,
            top_k=request.top_k,
            exclude_name=target_name
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Similarity Engine error: {str(e)}")

    comparable_wells = []
    for item in raw_report:
        well_clean = normalize_well_name(item.get("well", ""))
        comparable_wells.append({
            "well": well_clean,
            "similarity_score": round(float(item.get("similarity_score", 0.0)), 1),
            "formation_td": item.get("formation_td") or "",
            "formation_hc": item.get("formation_hc") or "",
            "formation_similarity": round(float(item.get("formation_similarity", 0.0)), 1),
            "depth_similarity": round(float(item.get("depth_similarity", 0.0)), 1),
            "trajectory_similarity": round(float(item.get("trajectory_similarity", 0.0)), 1),
            "geographic_similarity": round(float(item.get("geographic_similarity", 0.0)), 1),
            "context_similarity": round(float(item.get("context_similarity", 0.0)), 1),
            "well_type": item.get("well_type") or "",
            "total_historical_events": int(item.get("total_historical_events", 0)),
            "historical_events": item.get("historical_events", {}) or {}
        })

    return {"comparable_wells": comparable_wells}

@router.post("/planning/candidates")
def generate_planning_candidates(request: PlanningCandidatesRequest):
    """
    Generates and scores exploration well candidate locations inside the specified area
    or around a reference anchor point.
    """
    area_dict = request.area
    if not area_dict and request.reference:
        # Technical adapter: construct bounding reference polygon (±0.03 deg) around reference point
        # Note: This is an area adapter for candidate sampling, not a geological boundary.
        ref_lat = float(request.reference.get("lat", 58.437))
        ref_lng = float(request.reference.get("lng", 1.873))
        delta = 0.03
        poly = [
            [ref_lng - delta, ref_lat - delta],
            [ref_lng + delta, ref_lat - delta],
            [ref_lng + delta, ref_lat + delta],
            [ref_lng - delta, ref_lat + delta],
            [ref_lng - delta, ref_lat - delta]
        ]
        area_dict = {"coordinates": [poly]}

    if not area_dict or not area_dict.get("coordinates"):
        raise HTTPException(
            status_code=400,
            detail="Either an 'area' GeoJSON polygon or a 'reference' point {lat, lng} must be provided."
        )

    req_dict = {
        "area": area_dict,
        "target_depth": request.target_depth,
        "formation": request.formation,
        "constraints": request.constraints or {"minimum_well_spacing": 500}
    }

    try:
        candidates = planning_engine.generate_candidates(req_dict)
        feasible, rejected = planning_engine.apply_constraints(candidates, req_dict["constraints"])
        ranked = planning_engine.score_candidates(feasible, req_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Planning Engine error: {str(e)}")

    output_candidates = []
    for c in ranked:
        closest_w = normalize_well_name(c.get("closest_well", ""))
        c_lat = float(c["lat"])
        c_lon = float(c["lon"])
        c_depth = float(c.get("target_depth", request.target_depth))

        # Attach traceable historical hazard risk evidence associated with the closest historical well
        risk_data = demo_risk_scorer.score_well_depth(closest_w, c_depth) if closest_w else {}
        risk_level = risk_data.get("risk_level", "LOW")
        dom_hazard = risk_data.get("dominant_hazard", "NONE")

        # Explicitly frame as offset evidence, not candidate prediction
        if closest_w and dom_hazard != "NONE":
            risk_label = f"Historical offset hazard evidence ({dom_hazard.replace('_', ' ')}) near {int(c_depth)}m in reference well {closest_w}"
        elif closest_w:
            risk_label = f"No major historical hazard incidents near {int(c_depth)}m in reference well {closest_w}"
        else:
            risk_label = "No nearby historical offset reference well identified"

        insights = [
            f"Historical reference well: {closest_w} ({int(c.get('closest_dist', 0))}m offset)" if closest_w else "Sparse offset control",
            *(risk_data.get("contributing_factors", ["Adequate spatial clearance from existing wellbores"]))
        ]

        spatial_score = float(c["scores"].get("spatial_suitability", 0.0))

        output_candidates.append({
            "candidate_id": c["candidate_id"],
            "lat": round(c_lat, 5),
            "lon": round(c_lon, 5),
            "target_depth": c_depth,
            "closest_well": closest_w,
            "closest_dist": round(float(c.get("closest_dist", 0.0)), 1),
            "scores": {
                "overall": round(spatial_score, 1),
                "spatial_suitability": round(spatial_score, 1),
                "spacing": c["scores"].get("spacing")
            },
            "positive_factors": c.get("positive_factors", []),
            "negative_factors": c.get("negative_factors", []),
            "trajectory_estimate": c.get("trajectory_estimate", []),
            "risk_profile": {
                "level": risk_level,
                "label": risk_label,
                "insights": insights,
                "evidence_count": len(risk_data.get("nearby_events", [])),
                "offset_reference_well": closest_w,
                "disclaimer": "Historical offset risk evidence only. Not a statistical prediction or probability for the candidate location."
            }
        })

    return {
        "candidates": output_candidates,
        "metadata": {
            "total_generated": len(candidates),
            "total_feasible": len(feasible),
            "total_rejected": len(rejected)
        }
    }

@router.get("/events")
def get_historical_events(
    well: Optional[str] = Query(default=None, description="Filter events by wellbore name"),
    limit: int = Query(default=30, ge=1, le=500, description="Max event records to return")
):
    """
    Returns authentic historical drilling events from Daily Drilling Reports (DDR).
    """
    clean_target = normalize_well_name(well).lower() if well else None

    matched = []
    for r in all_historical_events:
        row_well = normalize_well_name(r.get("wellbore_id", ""))
        if clean_target and row_well.lower() != clean_target:
            continue

        def _to_float(v):
            try:
                val = float(v)
                return val if val > 0 else None
            except (ValueError, TypeError):
                return None

        matched.append({
            "event_id": r.get("event_id", ""),
            "event_type": r.get("event_type", ""),
            "well_name": row_well,
            "depth_start": _to_float(r.get("depth_start")),
            "depth_end": _to_float(r.get("depth_end")),
            "description": r.get("description", ""),
            "source": r.get("source", "OCR Ground Truth"),
            "source_file": r.get("source_file", ""),
            "confidence": _to_float(r.get("confidence"))
        })

        if len(matched) >= limit:
            break

    return {
        "well": normalize_well_name(well) if well else "ALL",
        "total": len(matched),
        "events": matched
    }

@router.get("/wells")
def list_all_wells():
    """Returns metadata for all available Volve wellbores."""
    return {
        "total": len(sim_engine.wells),
        "wells": [
            {
                "wellbore_name": normalize_well_name(w.get("name")),
                "latitude": w.get("latitude"),
                "longitude": w.get("longitude"),
                "total_depth": w.get("total_depth"),
                "tvd": w.get("tvd"),
                "max_inclination": w.get("max_inclination"),
                "formation_td": w.get("formation_td") or "",
                "formation_hc": w.get("formation_hc") or "",
                "field": w.get("field") or "VOLVE",
                "well_type": w.get("well_type") or ""
            }
            for w in sim_engine.wells
        ]
    }

@router.get("/wells/{well:path}")
def get_well_details(well: str = FPath(..., description="Wellbore identifier (e.g. '15/9-F-5')")):
    """
    Returns authentic geological and technical metadata for a specific Volve wellbore.
    """
    clean_target = normalize_well_name(well).lower()
    match = next(
        (w for w in sim_engine.wells if normalize_well_name(w.get("name")).lower() == clean_target),
        None
    )

    if not match:
        raise HTTPException(
            status_code=404,
            detail=f"Well '{well}' not found in Volve metadata repository."
        )

    return {
        "wellbore_name": normalize_well_name(match.get("name")),
        "latitude": match.get("latitude"),
        "longitude": match.get("longitude"),
        "total_depth": match.get("total_depth"),
        "tvd": match.get("tvd"),
        "max_inclination": match.get("max_inclination"),
        "formation_td": match.get("formation_td") or "",
        "formation_hc": match.get("formation_hc") or "",
        "field": match.get("field") or "VOLVE",
        "well_type": match.get("well_type") or ""
    }

@router.post("/analysis")
def get_well_risk_analysis(request: AnalysisRequest):
    """
    Evaluates depth-indexed hazard risks and evidence factors for a specific wellbore.
    Outputs a grounded 0-100 Risk Index (NOT a statistical probability).
    """
    clean_well = normalize_well_name(request.well)
    well_obj = next(
        (w for w in sim_engine.wells if normalize_well_name(w.get("name")).lower() == clean_well.lower()),
        None
    )

    if not well_obj:
        raise HTTPException(
            status_code=404,
            detail=f"Well '{request.well}' not found in Volve metadata repository."
        )

    risk_result = demo_risk_scorer.score_well_depth(clean_well, request.depth)
    if "error" in risk_result:
        raise HTTPException(status_code=404, detail=risk_result["error"])

    comp_report = sim_engine.similarity_report(well_obj, top_k=request.top_k)

    return {
        "well": clean_well,
        "depth_m": request.depth,
        "risk_score": risk_result["risk_score"],
        "risk_level": risk_result["risk_level"],
        "dominant_hazard": risk_result["dominant_hazard"],
        "closest_event_distance_m": risk_result.get("closest_event_distance_m"),
        "contributing_factors": risk_result.get("contributing_factors", []),
        "nearby_events": risk_result.get("nearby_events", []),
        "comparable_wells": comp_report,
        "disclaimer": risk_result["disclaimer"]
    }

def synthesize_deterministic_answer(chat_res: dict) -> str:
    """
    Synthesizes a transparent, evidence-grounded engineering answer from retrieved tool data.
    Strictly follows FACT / INFERENCE / UNKNOWN grounding principles without faking an LLM.
    """
    evidence_list = chat_res.get("evidence", [])
    session = chat_res.get("session_context", {})
    well = session.get("well")

    # Check for missing context
    missing = [e for e in evidence_list if e.get("tool") == "MISSING_CONTEXT" or "context" in e.get("error", "").lower()]
    if missing:
        reason = missing[0].get("error", "Target well or depth context is required.")
        return f"UNKNOWN (Missing Context):\n• {reason}\nPlease provide the required well identifier, target depth, or planning area coordinates."

    if not evidence_list or all(e.get("status") == "error" for e in evidence_list):
        return "UNKNOWN (Unsupported Query):\nThe eRTMAC-NWIS assistant does not find indexed records corresponding to this question in the Volve drilling repository."

    fact_lines = []
    inference_lines = []
    unknown_lines = []
    has_depth_query = False

    for item in evidence_list:
        if item.get("status") != "success":
            continue
        tool = item.get("tool")
        ev = item.get("evidence", [])

        if tool == "find_similar_wells" and ev:
            well_target = item.get("data", {}).get("current_well", well or "target prospect")
            fact_lines.append(f"• Analogue Wells for {well_target}:")
            for idx, w in enumerate(ev[:3], 1):
                score = round(float(w.get("score") or w.get("similarity_score") or 0.0), 1)
                form = w.get("formation_td") or w.get("formation_hc") or "Not Specified"
                td = f"{int(w.get('total_depth', 0))}m" if w.get('total_depth') else "N/A"
                fact_lines.append(f"   {idx}. Well {w.get('well')} — Weighted Similarity Index: {score}/100 (TD: {td}, Formation at TD: {form})")
            top_score = round(float(ev[0].get("score") or ev[0].get("similarity_score") or 0.0), 1)
            inference_lines.append(f"• Analogue well {ev[0].get('well')} provides the closest multi-factor correlation ({top_score}/100) to {well_target}.")

        elif tool == "explain_well_similarity" and ev:
            for exp in ev:
                w1 = exp.get("target_well", well)
                w2 = exp.get("comparison_well", "")
                score = round(float(exp.get("score") or exp.get("similarity_score") or 0.0), 1)
                fact_lines.append(f"• Similarity Breakdown between {w1} and {w2} (Index: {score}/100):")
                factors = exp.get("factors", {}) or exp.get("explanation", {})
                for k, v in factors.items():
                    name = k.replace("_similarity", "").replace("_", " ").title()
                    fact_lines.append(f"   - {name}: {round(float(v), 1)}/100")
                if exp.get("reasons"):
                    inference_lines.extend([f"• {r}" for r in exp["reasons"][:2]])

        elif tool in ("get_events_near_depth", "filter_events_near_depth", "get_events_for_well") and ev:
            has_depth_query = True
            evt_count = len(ev)
            fact_lines.append(f"• Historical Incidents ({evt_count} record{'s' if evt_count > 1 else ''} found):")
            for e in ev[:3]:
                etype = (e.get("event_type") or "INCIDENT").replace("_", " ")
                edepth = e.get("depth_end") or e.get("depth_start") or e.get("depth")
                ewname = e.get("well_name") or e.get("well") or well
                depth_str = f"at {edepth}m MD" if edepth else "in interval"
                desc = e.get("description") or "(Reported in Daily Drilling Report)"
                if len(desc) > 130:
                    desc = desc[:127] + "..."
                fact_lines.append(f"   - [{etype}] in Well {ewname} {depth_str}: \"{desc}\"")
            
            inference_lines.append("• [INFERENCE] Historical offset evidence is present near the queried depth.")

        elif tool == "get_historical_risk_evidence" and ev:
            has_depth_query = True
            r = ev[0]
            stuck_c = r.get("nearby_stuck_pipe_count", 0)
            loss_c = r.get("nearby_mud_loss_count", 0)
            nearby_c = r.get("nearby_event_count", 0)
            fact_lines.append(f"• Depth Hazard Summary: {nearby_c} historical event(s) in offset records within depth window ({stuck_c} stuck pipe, {loss_c} mud loss).")
            inference_lines.append("• [INFERENCE] Historical offset evidence is present near the queried depth.")

        elif tool == "get_candidate_locations" and ev:
            fact_lines.append(f"• Feasible Candidate Locations ({len(ev)} evaluated):")
            for idx, c in enumerate(ev[:3], 1):
                cid = c.get("candidate_id", f"LOC-{idx}")
                score = round(float(c.get("scores", {}).get("overall", c.get("overall_score", 0.0))), 1)
                lat = round(float(c.get("lat", 0.0)), 4)
                lon = round(float(c.get("lon", 0.0)), 4)
                closest = c.get("closest_well", "N/A")
                dist_m = round(float(c.get("closest_dist", 0.0)))
                dist_str = f"{dist_m/1000.0:.1f}km" if dist_m >= 1000 else f"{dist_m}m"
                fact_lines.append(f"   {idx}. {cid} — Composite Suitability Score: {score}/100 (Lat: {lat}°, Lon: {lon}°, Nearest Offset: {closest} @ {dist_str})")
            inference_lines.append(f"• Location {ev[0].get('candidate_id')} provides the optimal composite suitability while satisfying minimum well spacing constraints.")

    if has_depth_query:
        unknown_lines.append("• [UNKNOWN] A depth-specific formation interpretation is not established by the current dataset.")

    response_text = "FACT (Retrieved Drilling Ground Truth):\n"
    response_text += "\n".join(fact_lines) if fact_lines else "• No specific direct events found in the indexed records for this query."
    
    if inference_lines:
        # deduplicate while preserving order
        seen = set()
        dedup_inf = []
        for line in inference_lines:
            if line not in seen:
                seen.add(line)
                dedup_inf.append(line)
        response_text += "\n\nINFERENCE (Engineering Evaluation):\n"
        response_text += "\n".join(dedup_inf)

    if unknown_lines:
        response_text += "\n\nUNKNOWN (Geological Boundaries):\n"
        response_text += "\n".join(unknown_lines)
        
    return response_text

@router.post("/chat")
def ask_ai_assistant(request: ChatRequest):
    """
    Evidence-grounded drilling AI assistant executing multi-tool RAG planning.
    Strictly forbids hallucinations, uncalibrated probabilities, or fabricated data.
    """
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Query 'question' cannot be empty.")

    clean_well = normalize_well_name(request.current_well) if request.current_well else None

    try:
        response = chatbot.ask(
            question=request.question,
            current_well=clean_well,
            current_depth=request.current_depth,
            area=request.area
        )
        # If chatbot returned dummy LLM placeholder, format clean deterministic engineering answer
        if not response.get("answer") or "[DUMMY LLM RESPONSE]" in response.get("answer", ""):
            response["answer"] = synthesize_deterministic_answer(response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot Engine error: {str(e)}")

    return response

# Mount router to FastAPI app
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api:app", host="127.0.0.1", port=8000, reload=True)
