import json
from planning_engine import PlanningEngine

def test_run():
    print("Initializing Planning Engine...")
    engine = PlanningEngine(r"D:\Downloads\dataset\wellbore_exploration_all.csv")
    print(f"Loaded {len(engine.existing_wells)} Volve wells.")
    
    # Define a realistic exploration polygon near the Volve field
    # 15/9-F-1 is around Lat 58.44, Lon 1.89
    request = {
        "prospect": "Volve North Ext",
        "target_formation": "Hugin",
        "target_depth": 3200,
        "well_type": "exploration",
        "area": {
            "type": "Polygon",
            "coordinates": [[
                [1.87, 58.43],
                [1.91, 58.43],
                [1.91, 58.46],
                [1.87, 58.46]
            ]]
        },
        "constraints": {
            "minimum_well_spacing": 1500 # 1.5km spacing required
        }
    }
    
    print("\n--- Step 1: Candidate Generation ---")
    candidates = engine.generate_candidates(request)
    print(f"Generated {len(candidates)} candidate locations inside the polygon.")
    
    print("\n--- Step 2: Hard Constraint Filtering ---")
    feasible, rejected = engine.apply_constraints(candidates, request['constraints'])
    print(f"{len(feasible)} candidates feasible. {len(rejected)} candidates rejected.")
    if rejected:
        print(f"Example rejection: {rejected[0]['reasons'][0]}")
        
    print("\n--- Step 3: Candidate Scoring & Ranking ---")
    ranked = engine.score_candidates(feasible, request)
    
    print("\n--- Top 3 Candidates ---")
    for i, c in enumerate(ranked[:3]):
        print(f"{i+1}. {c['candidate_id']} | Score: {c['scores']['overall']}/100")
        print(f"   Positives: {', '.join(c['positive_factors'])}")
        print(f"   Negatives: {', '.join(c['negative_factors'])}")
        
    # Mocking GeoJSON output
    geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [c['lon'], c['lat']]},
                "properties": {
                    "id": c['candidate_id'],
                    "score": c['scores']['overall'],
                    "status": "feasible"
                }
            } for c in ranked[:3]
        ]
    }
    
    print("\n--- Map-Ready GeoJSON Output (Top 3) ---")
    print(json.dumps(geojson, indent=2))

if __name__ == "__main__":
    test_run()
