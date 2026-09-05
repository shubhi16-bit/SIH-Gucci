# Data Lineage

This document traces the data flow from raw datasets to the normalized Parquet files used by the NWIS prototype.

## Wells & Wellbores
- **BSEE Borehole.csv** → `normalize_bsee.py` → `wells.parquet`, `wellbores.parquet`
- **wellbore_exploration_all.csv** → `normalize_volve.py` → `wells.parquet`, `wellbores.parquet`

## Trajectories
- **dsptsdelimit.txt** & **directdelimit.txt** → `normalize_directional.py` → `trajectories.parquet` (Partitioned by well_id)
- **WITSML / Volve trajectory logs** → `parse_witsml.py` → `trajectories.parquet`

## Drilling Parameters
- **Well_Realtime (WITSML files)** → `parse_witsml.py` → `drilling_parameters.parquet`
- *Note: Sensors mapped from raw mnemonics (e.g., WOB, ROP, RPM) to normalized `parameter_name`.*

## Events & Reports
- **mv_war_main_prop_remark.txt (BSEE)** → `parse_war.py` → `reports.parquet` → (NLP/Regex Extraction) → `events.parquet`
- **Daily Drilling Report - XML Version (Volve)** → `parse_ddr.py` → `reports.parquet` → (XML Node Extraction) → `events.parquet`

## Formations
- **Volve wellbore_exploration_all.csv (Formation cols)** → `normalize_volve.py` → `formations.parquet`
- *(Additional formations could be extracted from LWD logs if required).*

## Provenance Tracking
Every row in the `events.parquet` and `drilling_parameters.parquet` files contains a `source` and `source_file` column that directly maps back to the specific line/node in the original dataset. This satisfies the requirement to answer "Why does the system believe this historical event happened?"

