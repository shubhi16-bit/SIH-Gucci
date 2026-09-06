# eRTMAC-NWIS Risk Model V2 — Design & Corrected Validation

## 1. PREDICTION PROBLEM
**Target:** Given the current active well at depth D, does a drilling hazard (`MUD_LOSS`, `KICK`, or `STUCK_PIPE`) occur within the next 25 meters?

This is a depth-indexed binary classification task using real historical events only.

## 2. DATASET CONSTRUCTION
- **Wells:** 25 Volve wells with recorded hazard events.
- **Events:** 225 real hazards from `data/processed/events.csv` (from DDR reports).
- **Checkpoints:** Each well is stepped in 25 m increments from 50 m to total depth. Label = 1 if a hazard falls in [D, D+25), else 0.
- **Dataset Size:** ~3,362 rows across 5 folds (train+test), ~220 positives (~6.5% prevalence).
- **Depth Range Source:** Actual well total depth from `wellbore_exploration_all.csv` where available; fallback = last event depth + 100 m for wells not in NPD metadata.

> **DATA LIMITATION:** Wells not in NPD metadata use event-bounds as a depth proxy. This biases checkpoints toward known-event regions. Documented as an accepted limitation for this prototype.

## 3. FEATURE DESIGN & LEAKAGE PREVENTION

**8 features, all computable at prediction time from prior knowledge:**

| Feature | Source | Description |
|---------|--------|-------------|
| `feat_depth` | Current drilling state | Absolute depth D |
| `feat_similar_well_count` | Similarity Engine | Number of offset wells with non-zero similarity |
| `feat_max_similarity` | Similarity Engine | Max similarity score among offset wells |
| `feat_mean_similarity` | Similarity Engine | Mean similarity score among offset wells |
| `feat_weighted_any_evidence` | Events + Similarity | Sum of similarity-weighted hazard counts in [D, D+25] across offset wells |
| `feat_weighted_mud_loss_evidence` | Events + Similarity | Same, MUD_LOSS only |
| `feat_weighted_kick_evidence` | Events + Similarity | Same, KICK only |
| `feat_weighted_stuck_pipe_evidence` | Events + Similarity | Same, STUCK_PIPE only |

**Leakage Prevention (all 6 checks PASSED in automated assertions):**
- **A.** Train/test wells are strictly disjoint (GroupKFold).
- **B.** Test-well events never appear in training context features.
- **C.** Each test row's context uses only training-fold wells.
- **D.** Target well is excluded from its own context at all times.
- **E.** Target label is computed separately from the context feature loop.
- **F.** All models are fitted exclusively on training-fold data.

**Similarity Engine:** Uses the real `backend/similarity.py` (Haversine geographic distance + depth + formation + trajectory). The engine's internal well list is restricted to the current fold's training pool when computing context features.

**Model names:** `sklearn.linear_model.LogisticRegression` and `sklearn.ensemble.HistGradientBoostingClassifier`. **Neither is XGBoost.** XGBoost was unavailable in this environment.

## 4. CORRECTED VALIDATION — 5-Fold GroupKFold Cross-Validation

> **CRITICAL CORRECTION:** A previous run reported ROC-AUC = 0.737. This was caused by **fold-level context leakage** — features were pre-computed globally before splitting, allowing test-well events to inform training examples. That result is **INVALID and retracted**.

The pipeline was rewritten so features are generated *inside each fold*, using only the current fold's training wells as context. Results below are from the corrected run.

### Per-Fold Results

| Fold | Test Wells | LR AUC | HGB AUC | LR F1 | HGB F1 |
|------|------------|--------|---------|-------|--------|
| 1 | 15/9-19 ST2, F-10, F-12, F-15 D, F-9 A | 0.411 | 0.435 | 0.110 | 0.066 |
| 2 | 15/9-19 S, F-11 T2, F-15 C, F-1 C, F-9 | 0.552 | 0.574 | 0.087 | 0.108 |
| 3 | 15/9-19 BT2, F-11 B, F-15 A, F-1 B, F-7 | 0.581 | 0.571 | 0.166 | 0.124 |
| 4 | 15/9-19 B, F-11 A, F-15, F-1 A, F-5 | 0.426 | **0.691** | 0.030 | **0.250** |
| 5 | 15/9-19 A, F-11, F-14, F-1, F-4 | 0.445 | 0.442 | 0.101 | 0.043 |

### Cross-Validation Summary

| Model | Precision | Recall | F1 | ROC-AUC | PR-AUC | Brier |
|-------|-----------|--------|-----|---------|--------|-------|
| Baseline B (Prevalence ~6.5%) | 0.000 | 0.000 | 0.000 | 0.500 ± 0.000 | 0.065 ± 0.014 | **0.061 ± 0.012** |
| Logistic Regression | 0.059 ± 0.024 | 0.342 ± 0.167 | 0.099 ± 0.044 | 0.483 ± 0.070 | 0.079 ± 0.022 | 0.246 ± 0.017 |
| **HistGradientBoosting (HGB)** | 0.093 ± 0.065 | 0.167 ± 0.083 | 0.118 ± 0.072 | **0.543 ± 0.096** | **0.100 ± 0.046** | 0.123 ± 0.021 |

### Calibration
- **Baseline B Brier = 0.061** — the best calibration (trivially, by predicting the constant training prevalence).
- **HGB Brier = 0.123** — roughly 2× the baseline Brier. The model is **poorly calibrated**. Its outputs must not be interpreted as probabilities.
- **LR Brier = 0.246** — severely miscalibrated.

### Conclusion
After fixing the leakage, HGB's mean ROC-AUC is **0.543**, and LR's mean ROC-AUC is **0.483 (below baseline)**. The models do not provide meaningful predictive signal on completely unseen wells using only absolute-depth + geographic similarity as features. The previous 0.737 AUC was an artifact of context leakage, not genuine predictive power.

## 5. THRESHOLDS & PROBABILITY CLAIMS
- **Thresholds:** `HIGH > 0.6`, `MEDIUM > 0.4` are **arbitrary prototype heuristics**. Not scientifically validated.
- **Output label:** Must remain **"Risk Score"**, never "probability." Calibration is unacceptably poor.

## 6. INFERENCE SCHEMA
```json
{
  "well_id": "15/9-19 A",
  "depth": 2000,
  "formation": "Hugin Fm"
}
```
**Pipeline:**
1. Query Similarity Engine for offset wells (excluding target well).
2. Compute weighted evidence features from offset-well historical events.
3. Feed to HistGradientBoosting model.
4. Return Risk Score + evidence strings.

**Note:** The engine references `backend/similarity.py`, not XGBoost.

## 7. EXPLAINABILITY
All explanations are grounded in real data:
- *"Risk Score elevated: offset wells showed MUD_LOSS in the corresponding 25 m window (evidence score: 0.5)."*
- No fabricated explanations.

## 8. LIMITATIONS
- **Primary:** Simple geographic + absolute-depth alignment is insufficient to distinguish hazard zones in completely unseen wells. The model requires geological formation boundaries to be effective.
- **WITSML:** Live telemetry (ROP, WOB, Torque) cannot be used — Volve WITSML logs lack synchronized depth continuity.
- **Dataset size:** 25 wells, ~220 positives across ~3,400 depth checkpoints. Too small for robust ML generalisation.
- **Depth alignment:** Absolute depth is used as a proxy for stratigraphic position. TVD or formation-boundary alignment would be more correct.
- **Brier score:** ML models are worse-calibrated than the trivial prevalence baseline.

## 9. FINAL VERDICT: **B — Usable but requires caveats**
The model infrastructure (feature pipeline, leakage controls, explainability, inference schema) is correctly implemented. The underlying predictive signal from geographic similarity + absolute-depth alignment is **too weak to claim predictive power on unseen wells** with the current Volve dataset.

**For the SIH prototype demo, the system is defensible as:**
> *"An evidence-aggregation engine that summarises historical hazard patterns from geographically similar offset wells at corresponding depths, presented as a Risk Score."*

It is **NOT defensible as** a validated predictive model claiming to forecast hazard probability.
