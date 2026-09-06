# eRTMAC-NWIS Risk Model Redesign Investigation

## A. EXECUTIVE SUMMARY
**Verdict: The current time-series ML architecture is NOT SUPPORTED BY CURRENT DATA.**
The current XGBoost model attempts to perform time-series rolling predictions using data that is fundamentally incompatible with chronometric sequence modeling. Furthermore, it suffers from massive data leakage and explicitly fabricates mock labels to bypass errors. 

However, a **Depth-Indexed Hybrid Risk Model** is **BUILDABLE NOW** using our robust historical events dataset and the existing Similarity Engine.

---

## B. CURRENT MODEL PROBLEMS
1. **Time-Series Assumption Failure:** The model attempts to calculate time-series rolling windows (e.g., `rolling(10)` rows). Our WITSML data is depth-indexed, not time-indexed. A row index does not represent a consistent time delta.
2. **Zero-Progression Features:** The model is trained on `15/9-F-1` (demo stream), which has a depth progression of exactly `0.0m` over its 1000 samples. Therefore, Rate of Penetration (ROP) and Rate of Change features evaluate to 0.
3. **Data Leakage:** The `train_test_split` randomly shuffles rows. Because adjacent rolling windows contain 90% identical data, placing overlapping windows in both train and test sets creates artificial accuracy scores near 100%.
4. **Fabricated Labels:** `labels.py` explicitly injects a fake `STUCK_PIPE` event if the dataset contains 0 real events, ensuring the model trains on synthetic garbage.
5. **Inference Mismatch:** At inference, a single telemetry row is passed to the extractor. Rolling features for a single row evaluate to `NaN` (filled to `0`), meaning the model predicts on entirely different data distributions than it trained on.

---

## C. AVAILABLE REAL DATA & EVENT LABEL QUALITY
We have analyzed the datasets precisely.
- **`events.csv`**: Contains **1,604 real events**. 
  - Usable geological targets: `MUD_LOSS` (279), `KICK` (87), `STUCK_PIPE` (73).
  - Usable wells: Over 30 different Volve wellbores.
  - Depth quality: 100% of these events have a valid `depth_start`.
- **WITSML Telemetry**: 
  - `F-1`: Time-indexed but static depth (0m progression).
  - `F-4, F-5, F-7`: Depth-indexed (progressing) but lack timestamps. ROP exists but cannot be calculated dynamically over time.

---

## D. RECOMMENDED PREDICTION TARGET
**"Given the current active depth $D$, and the geological similarity context, what is the probability of a geological hazard (Stuck Pipe, Mud Loss, Kick) occurring within the next 25 meters ($D$ to $D+25$)?"**

This target is mathematically defensible because:
1. It shifts the sequence axis from TIME to DEPTH, matching our available data.
2. It allows us to use the 439 high-quality physical events in `events.csv`.
3. 25 meters provides a realistic "early warning" horizon for drillers.

---

## E. SIMILARITY → RISK INTEGRATION
The most defensible ML architecture for this prototype uses the **Similarity Engine** as the primary feature extractor for the Risk Model.

**Data Flow:**
1. User provides Current Well Plan & Current Depth ($D$).
2. **Similarity Engine** identifies the Top 5 most geologically/spatially similar historical wells.
3. **Context Vector Generation:** We query `events.csv` for those Top 5 wells within the upcoming depth window ($D$ to $D+25$).
4. **Output Features:** `nearby_mud_loss_count`, `nearby_stuck_pipe_count`, `highest_similarity_score_of_event_well`.
5. **Risk Model (XGBoost/Logistic Regression)** ingests these historical context features (plus raw depth/formation) to classify the upcoming 25m risk.

---

## F. RECOMMENDED FEATURES
1. **`current_depth`** (Numeric)
2. **`target_formation_risk_baseline`** (Categorical encoded / Historical frequency)
3. **`sim_stuck_pipe_upcoming_25m`** (Count of Stuck Pipe events in Top 5 similar wells ahead)
4. **`sim_mud_loss_upcoming_25m`** (Count of Mud Loss events in Top 5 similar wells ahead)
5. **`max_similarity_score`** (Weighting feature: How confident are we in the offset data?)

*Note: Telemetry features (ROP, Torque, Pressure) should be excluded from the training of the primary model because we lack a multi-well dataset of high-quality telemetry aligned with events.*

---

## G. CORRECT TRAIN/TEST STRATEGY
To prevent leakage, data MUST be split using a **GroupKFold or Well-Level Split**.
- **Train Set:** Wells A, B, C, D...
- **Test Set:** Wells X, Y, Z.
No depth intervals from the test wells can exist in the training set.

---

## H. WHAT CANNOT HONESTLY BE CLAIMED
- We **cannot** claim this is a "live telemetry sequence predictor" (like an LSTM analyzing pressure waves over time) because we do not have the time-series data to support it. 
- We **cannot** claim the model predicts equipment failures (NPT), as those are rig-dependent, not geology-dependent.

---

## I. EXACT IMPLEMENTATION STEPS (DO NOT EXECUTE YET)
1. **Delete current `ml/` pipeline entirely.**
2. **Generate Depth-Indexed Dataset:**
   - Create a script that steps down each of the 30 Volve wells in `events.csv` at 10m increments.
   - At each increment $D$, query `events.csv` for any event in $[D, D+25]$. Assign the label (`0` or `1`).
3. **Generate Context Features:**
   - At each increment, run the Similarity Engine against the *other* 29 wells.
   - Count the events in the Top 5 similar wells in $[D, D+25]$.
4. **Train Model:** Train XGBoost on these purely tabular, depth-indexed context features using a Well-Level Split.
5. **API Integration:** Expose `/predict` which takes a depth and a Similarity context vector, returning the probability (Risk Score).

