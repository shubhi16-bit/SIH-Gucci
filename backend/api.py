import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from planning_engine import PlanningEngine

app = FastAPI(title="NWIS Well Planning API")

# Initialize engine globally
engine = PlanningEngine(r"D:\Downloads\dataset\wellbore_exploration_all.csv")

class PlanningRequest(BaseModel):
    prospect: str
    target_formation: str
    target_depth: float
    well_type: str = "exploration"
    area: Dict[str, Any] # GeoJSON Polygon
    constraints: Dict[str, Any]

@app.get("/planning/wells")
def get_existing_wells():
    """Returns existing wells for the map view."""
    return {"wells": engine.existing_wells}

@app.post("/planning/candidates/generate")
def generate_and_rank_candidates(request: PlanningRequest):
    """
    Core planning endpoint.
    1. Generates candidates in the polygon
    2. Applies spacing constraints
    3. Scores and ranks feasible candidates
    4. Returns GeoJSON output
    """
    req_dict = request.dict()
    
    # Generate
    candidates = engine.generate_candidates(req_dict)
    if not candidates:
        raise HTTPException(status_code=400, detail="No candidates could be generated in the provided polygon.")
        
    # Filter
    feasible, rejected = engine.apply_constraints(candidates, req_dict['constraints'])
    
    # Score
    ranked = engine.score_candidates(feasible, req_dict)
    
    # Prepare GeoJSON
    features = []
    
    # Add feasible candidates
    for c in ranked:
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [c['lon'], c['lat']]},
            "properties": {
                "id": c['candidate_id'],
                "score": c['scores']['overall'],
                "status": "feasible",
                "positives": c['positive_factors'],
                "negatives": c['negative_factors'],
                "trajectory": c['trajectory_estimate']
            }
        })
        
    # Add rejected candidates for visualization
    for r in rejected:
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [r['lon'], r['lat']]},
            "properties": {
                "id": r['candidate_id'],
                "status": "rejected",
                "reason": r['reasons'][0]
            }
        })
        
    return {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "total_generated": len(candidates),
            "total_feasible": len(feasible),
            "total_rejected": len(rejected)
        }
    }

if __name__ == "__main__":
    # uvicorn.run(app, host="0.0.0.0", port=8000)
    print("FastAPI endpoints defined. Install fastapi and uvicorn to run.")

