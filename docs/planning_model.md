# Exploration Well Planning & Candidate Ranking Engine

## 1. Scope
**What the planning engine does:**
- Well planning and candidate ranking conditional on an identified target/prospect.
- Generates a spatial grid of candidate well locations within a provided exploration polygon.
- Eliminates candidates that violate hard spatial/engineering constraints (e.g., minimum well spacing).
- Calculates transparent, justifiable features based on historical Volve data.
- Assigns a Suitability Score (0-100) combining trajectory feasibility, spacing, and historical risk.
- Provides machine-readable explanations (Positives/Negatives) for the frontend map UI.

**What it does NOT do:**
- It does **not** identify hydrocarbons from seismic data. Prospect identification is outside the current prototype scope.
- It does **not** generate full directional drilling BHA programs. It provides a simplified prototype trajectory estimate.
- It does **not** output probabilistic success metrics (e.g., "87% chance of oil"). It strictly outputs a *Suitability Score*.

## 2. Data Provenance & Inputs
The engine consumes data produced by the data-engineering phase:
- **Wells Metadata:** Volve `wellbore_exploration_all.csv` provides `wlbNsDecDeg` (Lat) and `wlbEwDecDeg` (Lon) to build the spatial constraint model.
- **Inputs:** A GeoJSON Polygon outlining the target area, target depth, and minimum spacing constraints.

## 3. Candidate Generation
- A deterministic ray-casting point-in-polygon algorithm generates candidate surface locations.
- It uses a bounded grid (e.g., 500m spacing) within the polygon's bounding box.
- Output: A list of `candidate_id`, `latitude`, `longitude`.

## 4. Hard Constraints
Currently implemented constraints:
- **Minimum Well Spacing:** Calculates Haversine distance between each candidate and the 31 historic Volve wells. Rejects candidates within the threshold (e.g., 1000m).
- *Future Extensions:* Maximum inclination angles, exclusion zones.

## 5. Feature Engineering & Scoring
The engine calculates a weighted *Suitability Score* (0-100) using:
1. **Well Spacing Score (30%):** Higher scores for optimal offset distance (not too close, not too far).
2. **Target Depth Match (30%):** Validates if the target depth is feasible.
3. **Trajectory Feasibility (20%):** Simplified vertical drop vs deviation ratio.
4. **Historical Risk Score (20%):** (Placeholder) Will link to `events.csv` to penalize areas with high density of STUCK_PIPE or KICK events at the target formation.

## 6. Explainability
Every candidate is bundled with text-based reasons derived directly from the mathematical feature calculations.
Example: `"Excellent distance from existing wells (3187m)"` or `"Too close to existing well 15/9-19 A"`.

## 7. Output Format (API)
The backend (`api.py`) exposes REST endpoints (e.g. `/planning/candidates/generate`) using FastAPI.
Responses are formatted as **GeoJSON FeatureCollections** natively compatible with frontend mapping libraries (Mapbox, Leaflet).
Each feature includes `geometry`, `score`, `status` (feasible/rejected), `positives`, `negatives`, and a `trajectory` array.

