# Final Data Quality & Repository Readiness Audit

## 1. Overall Status
**PROTOTYPE READY WITH WARNINGS**
The processed datasets and architecture are clean and separated logically. However, there are significant warnings regarding the WITSML replay data that downstream consumers (Similarity/Prediction ML teams) MUST account for. 

## 2. Raw Datasets Available
- **Volve Norwegian Petroleum Directorate:** Core dataset for the end-to-end offset/planning demonstration.
- **BSEE Gulf of Mexico:** Supplementary dataset to demonstrate spatial scaling. **(Explicitly isolated from Volve; no cross-dataset offset logic).**
*(Raw datasets are completely excluded from Git via `.gitignore`).*

## 3. Processed Datasets (Committed)
- `data/processed/sample_wells.csv` (Metadata structure)
- `data/processed/sample_wellbores.csv` (Metadata structure)
- `data/processed/events.csv` (1,604 Volve risk events mapped to depth/well)
- `data/processed/volve_realtime_demo/*.csv` (WITSML cohort)
- `data/processed/demo_active_well/demo_stream.csv` (WITSML demo)

## 4. Schema Summary
- **Wells:** `well_id`, `lat`, `lon`, `td`.
- **Events:** `event_id`, `well_id`, `wellbore_id`, `timestamp_start`, `depth_start`, `event_type`, `description`, `source`, `confidence`.
- **WITSML/Telemetry:** `TIME`, `DEPTH`, `ROP`, `WOB`, `RPM`, `TORQUE`, `PRESSURE`, `HOOKLOAD`, `FLOW`.

## 5. WITSML Replay Cohort Validation
An independent Python audit of the generated `volve_realtime_demo` CSVs revealed critical insights regarding the WITSML extraction logic:

| Wellbore | Source Log File Type | Progression | Missing TIME? | Assessment |
|----------|----------------------|-------------|---------------|------------|
| `15/9-F-1` | Time Log | 0.0m | No | **STATIC REPLAY.** Depth does not progress. Suitable for testing static sensor telemetry (e.g. circulation or tripping), but NOT for active rock-drilling simulation. |
| `15/9-F-4` | MD Log / Preload Test | 138.1m | Yes (100%) | **UNSUITABLE FOR TIME REPLAY.** Depth-indexed only. Lacks timestamps and most active curves. Useful ONLY for depth-based historical feature extraction. |
| `15/9-F-5` | MD Log / 8.5in Section | 71.3m | Yes (100%) | **UNSUITABLE FOR TIME REPLAY.** Depth-indexed only. Massive missing values across active parameters. |
| `15/9-F-7` | MD Log / 17.5in Section| 139.8m | Yes (100%) | **UNSUITABLE FOR TIME REPLAY.** Depth-indexed only. Highly sparse. |

**WARNING:** Do NOT treat `F-4`, `F-5`, or `F-7` as "live time-series telemetry". They are depth-indexed (`MD`) logs. The prediction engine must treat them as spatial features, not temporal streams.

## 6. Curve Normalization Mapping
The script correctly unified mnemonics into canonical fields:
- `DEPTH` ← `DMEA`, `DEPT`, `md`
- `ROP` ← `ROP5`, `rop`
- `WOB` ← `SWOB`, `wob`
- `RPM` ← `TRPM_RT`, `rpm`
- `TORQUE` ← `TQA`, `STOR`, `torque`
- `PRESSURE` ← `SPPA`, `pressure`
- `HOOKLOAD` ← `HKLD`, `hookload`
- `FLOW` ← `TFLO`, `flow`

*Missing-value behavior:* Replaced with empty strings (CSV blanks). Handled natively as `NaN` in pandas/numpy downstream.

## 7. Identifier/Join Validation
**Status: VALIDATED.**
- **WITSML:** Parsed `<nameWellbore>`.
- **DDR/Events:** Parsed `<nameWellbore>`.
- **NPD Metadata:** `wlbWellboreName`.
String normalization handles prefixes (e.g., stripping `NO `). Joins within the Volve ecosystem are structurally sound.

## 8. Event Validation
**Status: VALIDATED.**
`events.csv` contains rule-based event detections from DDR XML `<activity>` nodes.
- Labeled correctly as "candidate events" / "extracted events".
- Each record retains its original `source_file` for RAG/Chatbot provenance.
- Confidence levels (HIGH/MEDIUM/LOW) are applied transparently.

## 9. Downstream Readiness
- **Similarity Engine:** READY. Can consume spatial coordinates from metadata and historical events from `events.csv`.
- **Prediction Engine:** PARTIALLY READY. Can consume depth-indexed logs for historical context, but lacks a pristine time-series drilling progression for continuous forecasting. Will need to impute or handle static `F-1` data.
- **Planning Engine:** READY. Built and tested (see `backend/planning_engine.py`).
- **Chatbot / RAG:** READY. `events.csv` serves as a clean, structured context database mapping events to exact source XMLs.

## 10. Data Lineage
- `DDR XML` → `generate_volve_events.py` → `events.csv`
- `WITSML XML` → `generate_multi_witsml.py` → `volve_realtime_demo/*.csv`
- `NPD CSV` → `planning_engine.py` → Candidate Scoring

## 11. Files Intentionally Excluded from Git
- The multi-GB Volve `Well_logs` and `Well_Realtime` archives.
- BSEE raw massive CSVs.
- Local IDE/environment caches (`__pycache__`, `.env`).

## 12. Recommendations
- **Prediction ML Team:** Implement a robust `NaN` imputer for the depth-indexed logs. 
- **Frontend Team:** Render `15/9-F-1` as a "Static Telemetry Replay" rather than actively plunging depth.

