# Similarity Engine — Technical Reference

> **Status:** 🟡 PARTIAL — Algorithm correct; data coverage is a significant limitation.
> **Last audited:** 2026-09-06 against real Volve data.

---

## 1. What the Similarity Engine Is

`backend/similarity.py` is a **deterministic, heuristic weighted-index engine** that ranks historical wells against a target well on a 0–100 scale.

It is **NOT**:
- A machine-learning model
- A probability estimator
- A geological stratigraphic alignment tool

The output score should be described as:

> **"Weighted Similarity Index (0–100)"** — 100 = identical on all dimensions, 0 = maximum dissimilarity or all data missing.

---

## 2. Inputs

The engine is initialised with:
- `metadata_path` — path to `wellbore_exploration_all.csv` (NPD data). Only rows where `wlbField == "VOLVE"` are loaded.
- `events_path` — (optional) path to `data/processed/events.csv`.

A **query** supplies a Python dict with these fields:

| Field | Type | Source |
|-------|------|--------|
| `name` | str | Well identifier |
| `latitude` | float | `wlbNsDecDeg` |
| `longitude` | float | `wlbEwDecDeg` |
| `total_depth` | float | `wlbTotalDepth` |
| `tvd` | float | `wlbFinalVerticalDepth` |
| `max_inclination` | float | `wlbMaxInclation` |
| `formation_td` | str | `wlbFormationAtTd` |
| `formation_hc` | str | `wlbFormationWithHc1` |
| `field` | str | `wlbField` |
| `well_type` | str | `wlbWellType` |

---

## 3. Similarity Components & Formulas

### Weights (verified to sum to 1.00)

| Component | Weight |
|-----------|--------|
| Geographic | 0.25 |
| Depth | 0.25 |
| Formation | 0.30 |
| Trajectory | 0.15 |
| Context | 0.05 |
| **Total** | **1.00** |

### 3.1 Geographic (weight 0.25)

```
haversine(lat1, lon1, lat2, lon2)  -> distance in km
score = max(0, 100 * (1 - distance/10.0))
```

- Score = 100 at 0 km, 0 at ≥ 10 km. Monotonically decreasing. ✅
- Missing coordinate → score = 0.0 (safe fallback). ✅
- Haversine implementation: standard formula with `earth_radius = 6371.0 km`. ✅

### 3.2 Depth (weight 0.25)

```
tvd_score = max(0, 100 * (1 - |tvd_a - tvd_b| / max(tvd_a, tvd_b, 1)))
td_score  = max(0, 100 * (1 - |td_a  - td_b|  / max(td_a,  td_b,  1)))
score = 0.70 * tvd_score + 0.30 * td_score
```

- Uses TVD (True Vertical Depth) as primary, total depth as secondary. ✅
- Relative difference normalisation — a 300 m difference on a 300 m well is penalised more than on a 3000 m well. Sensible for this domain. ✅
- Missing depth → that sub-score = 0.0. ✅

### 3.3 Formation (weight 0.30)

```
current_set    = {formation_td, formation_hc} (non-empty strings, uppercased)
historical_set = {formation_td, formation_hc}
score = |intersection| / |union| * 100   (Jaccard)
```

- If either set is empty → score = 0.0. ✅
- Jaccard implementation is correct. ✅
- **DATA AVAILABILITY (VOLVE):**
  - `formation_td`: 5/5 wells populated. Values: `LISTA FM`, `SKAGERRAK FM`, `SMITH BANK FM`.
  - `formation_hc`: 3/5 wells populated. Value: `HUGIN FM` only.
  - These are **well-level fields** (formation at total depth / formation with HC), not depth-interval logs.

> ⚠️ **LIMITATION:** Formation similarity is binary at well scale. It cannot distinguish which formation a drill bit is currently passing through at a given depth. For depth-window queries (Risk V2), formation alignment is an approximation.

### 3.4 Trajectory (weight 0.15)

```
incl_score = max(0, 100 * (1 - |incl_a - incl_b| / max(|incl_a|, |incl_b|, 1)))
td_score   = max(0, 100 * (1 - |td_a - td_b| / max(td_a, td_b, 1)))
score = 0.70 * incl_score + 0.30 * td_score
```

- Uses `max_inclination` (real NPD field, well-level maximum). ✅
- Missing inclination → `incl_score = 0.0`, score driven purely by TD sub-component. ✅
- **DESIGN NOTE:** The `td_score` in this formula is identical to the TD sub-component used in `depth_similarity`. Total depth is therefore **double-counted** across the composite:
  - Effective TD contribution: `0.25×0.30 + 0.15×0.30 = 0.12` of the total score.
  - This is a minor design limitation, not a correctness bug. Documented here; do not change without re-validating.

### 3.5 Context (weight 0.05)

```
score = 0
if field_a == field_b: score += 50
if well_type_a == well_type_b: score += 50
```

- Since all wells are filtered to `wlbField == "VOLVE"`, field always matches → **every comparison gets +50 on context before well_type is even checked** (context floor = 2.5 / 100 of total score).
- Well_type values found in loaded wells: varies per well (e.g., `PRODUCTION`, `EXPLORATION`).

> ⚠️ **LIMITATION:** Context provides a near-constant +2.5 score floor for all Volve wells. It does not differentiate meaningfully within the Volve pool.

---

## 4. Target-Well Exclusion — CONFIRMED BUG

**Status: 🔴 BUG FOUND**

`rank_wells(current, top_k)` iterates over `self.wells` without filtering out the target well. If the target well exists in `self.wells` (i.e., it is a known historical Volve well), **it will appear in its own similarity ranking** — always at score 100.

```python
# Bug location: backend/similarity.py line 955
for historical in self.wells:          # <-- no exclusion of target
    score = self.overall_similarity(current, historical)
```

**Confirmed via audit:** Querying `15/9-19 A` against itself returns `score=100` at rank 1.

**Implication for Risk V2:** The `cv_pipeline.py` caller correctly handles this by restricting `self.sim_engine.wells` to the context pool (which excludes the target well). So the downstream CV pipeline is safe. However, **`rank_wells` itself is not safe to call with a real historical well as the target without external filtering**.

**Fix required before API integration:** Add an optional `exclude_name` parameter to `rank_wells`.

---

## 5. Event Correlation

### Data Join Coverage

| Metric | Value |
|--------|-------|
| Wells in `events.csv` | 26 |
| Wells in Similarity Engine (VOLVE metadata) | 5 |
| Wells appearing in **both** | **3** |
| Matched wells | `15/9-19 A`, `15/9-19 B`, `15/9-19 S` |

> ⚠️ **CRITICAL DATA LIMITATION:** Only **3 of 26** event wells can be retrieved through `SimilarityEngine.get_historical_events()`. The other 23 wells (`15/9-F-1`, `15/9-F-4`, `15/9-F-5`, etc.) exist in `events.csv` but not in `wellbore_exploration_all.csv` filtered to VOLVE. Their event data is **invisible** to the Similarity Engine.

This is the primary reason why the Risk V2 model's corrected CV performance collapsed to ~0.54 AUC. The weighted evidence features receive nearly zero signal because the engine can only see events from 3 wells.

### Depth Window Queries

`get_events_near_depth(well_name, depth, tolerance)`:
- Uses event midpoint `(depth_start + depth_end) / 2` when both are present.
- Falls back to `depth_start` or `depth_end` individually if only one is available.
- Events with neither depth field are silently skipped.
- Returns events sorted by `|event_depth - current_depth|`.
- **Verified working** for `15/9-19 A` at depth 2200 m (7 events found within ±25 m). ✅

---

## 6. Outputs

### `rank_wells(current, top_k=5)`
Returns list of top-k dicts: `{well, score, explanation, event_summary, total_events}`

### `similarity_report(current, top_k=5)`
Same, formatted with per-component breakdowns.

### `get_events_near_depth(well_name, depth, tolerance=15.0)`
Returns events within `±tolerance` metres sorted closest-first.

### `historical_risk_features(current, depth, top_k=3, tolerance=15.0)`
Returns `{comparable_well_count, best_similarity, nearby_event_count, nearby_stuck_pipe_count, nearby_mud_loss_count, ...}`.

---

## 7. Verified Behaviours (from audit)

| Test | Result |
|------|--------|
| Well vs itself | 100.0 ✅ |
| Close wells (0 km apart) | Geographic = 100 ✅ |
| Distant well (>10 km) | Geographic = 0.0 ✅ |
| Depth monotonicity (close > far) | PASS ✅ |
| Formation missing → 0 | PASS ✅ |
| Formation Jaccard (different) → 0 | PASS ✅ |
| Missing coordinates → geo = 0 | PASS ✅ |
| Missing inclination → traj driven by TD | PASS ✅ |
| Proposed new well runs without error | PASS ✅ |
| Target-well self-exclusion | **FAIL** 🔴 |
| Event join (3/5 VOLVE wells matched) | PARTIAL ⚠️ |
| Weights sum to 1.0 | PASS ✅ |
| Score interpreted as probability | NOT FOUND ✅ |

---

## 8. Limitations for SIH Presentation

1. **Only 5 VOLVE wells in NPD metadata.** Only 3 of those join to events. Similarity-weighted evidence is sparse.
2. **Formation is well-scale, not depth-scale.** Cannot distinguish formations at different drilling depths within one well.
3. **Total depth double-counted** in Depth and Trajectory components (minor over-weighting).
4. **Context component provides a near-constant floor** (+2.5 to all Volve comparisons) due to field always matching.
5. **`rank_wells` does not exclude the target well** when it is a historical well. Must be handled by caller.
6. **Score is a heuristic index, not a probability.** Do not label it "%" or "confidence" in the UI.
7. **Absolute-depth alignment only.** No stratigraphic or TVD-interval alignment for depth window queries.

---

## 9. Recommended Description for SIH Demo

> *"The Similarity Engine computes a deterministic Weighted Similarity Index (0–100) comparing a target well against all historical Volve wells across four dimensions: geographic proximity (Haversine), well depth profile (TVD and total depth), formation at total depth (Jaccard), and borehole trajectory (maximum inclination). This index is used to select the most relevant historical reference wells for hazard-evidence lookup."*