# Data Dictionary

This document describes the normalized schema for the NWIS prototype datasets.

## WELLS
Stores authoritative well metadata.
- `well_id` (String): UUID or primary key.
- `source_well_id` (String): Original identifier (e.g., API Well Number or wlbWell).
- `api_number` (String): BSEE API number if applicable.
- `well_name` (String): Name of the well.
- `operator` (String): Company that operated the well.
- `field` (String): Associated field.
- `latitude` (Float): Surface latitude (WGS84).
- `longitude` (Float): Surface longitude (WGS84).
- `bottom_latitude` (Float): Bottom hole latitude.
- `bottom_longitude` (Float): Bottom hole longitude.
- `total_depth` (Float): Total measured depth.
- `tvd` (Float): True vertical depth.
- `well_type` (String): e.g., EXPLORATION.
- `spud_date` (Date): Date drilling commenced.
- `source` (String): Origin dataset (e.g., `BSEE`, `VOLVE`).

## WELLBORES
Stores individual wellbores (sidetracks, etc.) for a well.
- `wellbore_id` (String): UUID or primary key.
- `well_id` (String): Foreign key to WELLS.
- `source_wellbore_id` (String): Original wellbore identifier.
- `wellbore_name` (String): Name (e.g., suffix or full wellbore string).
- `status` (String): Current status of the wellbore.
- `source` (String): Origin dataset.

## TRAJECTORIES
Stores directional survey points defining the well path.
- `wellbore_id` (String): Foreign key to WELLBORES.
- `measured_depth` (Float): Depth along the well path.
- `true_vertical_depth` (Float): Vertical depth from surface.
- `inclination` (Float): Angle from vertical.
- `azimuth` (Float): Direction angle.
- `latitude` (Float): Computed/provided latitude at this depth.
- `longitude` (Float): Computed/provided longitude at this depth.
- `source` (String): Origin dataset.

## FORMATIONS
Stores geological formation boundaries.
- `wellbore_id` (String): Foreign key to WELLBORES.
- `formation` (String): Name of the formation/lithology.
- `top_depth` (Float): Depth at top.
- `bottom_depth` (Float): Depth at bottom.
- `source` (String): Origin dataset.
- `confidence` (Float): Confidence score if extracted via ML.

## DRILLING_PARAMETERS
Stores time-series and depth-series sensor data.
- `wellbore_id` (String): Foreign key to WELLBORES.
- `timestamp` (Datetime): Time of measurement.
- `measured_depth` (Float): Depth of the bit/sensor.
- `true_vertical_depth` (Float): TVD of measurement.
- `parameter_name` (String): Normalized parameter (e.g., ROP, WOB).
- `value` (Float): Measured value.
- `unit` (String): Unit of measurement.
- `raw_mnemonic` (String): Original sensor mnemonic.
- `source` (String): Origin dataset (e.g., WITSML).
- `source_file` (String): Exact file path.

## EVENTS
Stores historical drilling events, anomalies, and problems.
- `event_id` (String): UUID.
- `well_id` (String): Foreign key to WELLS.
- `wellbore_id` (String): Foreign key to WELLBORES.
- `timestamp_start` (Datetime): Time event started.
- `timestamp_end` (Datetime): Time event ended.
- `depth_start` (Float): Depth at event start (e.g. from `<md>` node).
- `depth_end` (Float): Depth at event end.
- `formation` (String): Correlated geological formation.
- `event_type` (String): Category from taxonomy (e.g., KICK, MUD_LOSS, STUCK_PIPE, EQUIPMENT_FAILURE).
- `severity` (String): Estimated severity (e.g., INFO, SEVERE).
- `description` (String): Raw text description of the event.
- `source` (String): Origin dataset (e.g., BSEE_WAR, VOLVE_DDR).
- `source_file` (String): Exact file or database record (e.g., mv_war_main_prop_remark.txt).
- `extraction_method` (String): How it was parsed (e.g., RULE_MATCH_<keyword>, XML_NODE).
- `confidence` (Float): Confidence score of extraction (e.g., 0.8 for rules, 1.0 for structured).

## REPORTS
Stores unstructured textual data and daily reports.
- `report_id` (String): UUID.
- `well_id` (String): Foreign key to WELLS.
- `wellbore_id` (String): Foreign key to WELLBORES.
- `report_type` (String): e.g., DDR, WAR.
- `report_date` (Date): Date of report.
- `source_file` (String): Original document reference.
- `text` (String): Extracted plain text content.

## SOURCE_DOCUMENTS
Tracks provenance at the file/document level.
- `source_id` (String): UUID.
- `source_name` (String): Logical name.
- `source_type` (String): e.g., CSV, PDF, XML.
- `original_path` (String): Location on disk.
- `processing_status` (String): Status of ingestion.
- `notes` (String): Additional metadata.

