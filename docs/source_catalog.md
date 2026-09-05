# Source Catalog (Final Prototype Selection)
This document provides an inventory of the available datasets for the SIH 2026 eRTMAC-NWIS prototype. The source data is located in `D:\Downloads\dataset\`.

## 1. Volve / Norwegian Petroleum Directorate (CORE DEMO DATASET)
**Location:** Root directory & subdirectories
**Usefulness:** CRITICAL. This dataset alone supports the entire cohesive end-to-end eRTMAC-NWIS demo.
- **WITSML Active Replay (`Well_Realtime`):** Well `15/9-F-1` is used strictly as the `HISTORICAL WITSML REPLAY / SIMULATED ACTIVE WELL`. Contains precise ISO timestamps and parameters (DMEA, ROP, SWOB, RPM, TQA).
- **Daily Drilling Report XML:** 14 additional wells in the `15/9` block used to provide `events.csv` (1,604 validated risk events like kick, stuck pipe).
- **wellbore_exploration_all.csv (NPD):** Used to establish spatial/depth metadata for the `15/9-*` offset cohort.

## 2. BSEE Well Data (SEPARATE SUPPLEMENTARY DATASET)
**Location:** Root directory
**Usefulness:** SUPPLEMENTARY. Demonstrates system scalability on US Gulf of Mexico data, but MUST NOT be used as geological offsets for Volve.
- **BSEE Borehole.csv:** High-volume metadata for GoM.
- **BSEE WAR Remarks:** 512+ rule-extracted events.
- **BSEE Directional (`dsptsdelimit.txt`):** Massive 1.17GB trajectory dataset.

## 3. DEFERRED DATA
- **3W Dataset:** Deferred to Phase 2 (Focus is historical evidence retrieval, not raw time-series ML classification).
- **Volve Well_logs (8.6 GB):** Static LWD/Mud logs skipped to keep the 6-day prototype agile.
