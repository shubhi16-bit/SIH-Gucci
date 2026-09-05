# Extraction & Validation Report

## 1. Processed Status
- **Volve Daily Drilling Reports:** Validated. Processed the entire XML archive and categorized **1,604 historical risk events** using confidence-based rule matching (e.g. HIGH for "stuck pipe", "kick", MEDIUM for "repair"). Result stored in `events.csv`.
- **WITSML Realtime (Volve):** Validated. A sample stream for well `15/9-F-1` was generated at `data/processed/demo_active_well/demo_stream.csv` (1000 records). It contains ISO8601 timestamps and key drilling curves matching NWIS requirements.

## 2. Volve Dataset Cohesion & Linkage
The Volve datasets internally share a consistent identity model:
- **WITSML** `<nameWellbore>` (e.g., `15/9-F-1 - Main Wellbore`)
- **DDR XML** `<nameWellbore>` (e.g., `NO 15/9-19 A`)
- **NPD CSV** `wlbWellboreName` (e.g., `15/9-19 A`)
These identities can be joined via string matching (ignoring "NO " and " - Main Wellbore" suffixes). The Volve dataset natively supports the COMPLETE end-to-end demonstration.

## FINAL 6-DAY PROTOTYPE DATASET
**ACTIVE WELL DATA:**
- **Source:** Volve WITSML `Well_Realtime`
- **Well:** `15/9-F-1`
- **Files:** `data/processed/demo_active_well/demo_stream.csv`
- **Role:** Simulates the live telemetry stream (ROP, WOB, Depth, RPM). Labeled strictly as "HISTORICAL WITSML REPLAY".

**OFFSET WELL DATA:**
- **Source:** Volve NPD Metadata
- **Wells:** `15/9-19 A`, `15/9-19 B`, `15/9-19 S`, `15/9-F-4`, `15/9-F-5`, `15/9-F-7`, `15/9-F-9`, `15/9-F-10`, `15/9-F-11`, `15/9-F-12`, `15/9-F-14`, `15/9-F-15`
- **Role:** The cohort of nearby historical wells located in the same field. Used by the risk engine to find depth/trajectory similarities.

**HISTORICAL EVENT DATA:**
- **Source:** Volve DDR XML
- **Files:** `events.csv`
- **Role:** 1,604 validated historical problems mapped to depth and wellbore, used as ground-truth evidence for risk warnings.

**TRAJECTORY DATA:**
- **Source:** BSEE Directional Surveys & Volve `wellbore_exploration_all.csv` (where available).
- **Role:** 3D coordinates for spatial similarity. BSEE data is strictly supplementary for spatial demonstration.

**SUPPLEMENTARY DATA:**
- **Source:** BSEE WAR & BSEE Boreholes.
- **Role:** A separate, large-scale historical petroleum dataset to demonstrate the system's ability to ingest massive US Gulf of Mexico datasets. It will **not** be mixed with Volve Norway wells for offset comparison.

**DEFERRED DATA:**
- **Source:** 3W Dataset, Volve `Well_logs` (8.6GB).
- **Role:** Deferred to Phase 2 to prevent overengineering.
