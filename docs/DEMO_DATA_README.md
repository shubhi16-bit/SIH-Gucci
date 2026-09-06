# eRTMAC-NWIS Demo Data & Risk Model Pipeline (SIH 2026)

## Purpose & Scope
This dataset and pipeline are built **strictly for the SIH 2026 first-round 5-minute prototype demonstration**. 
It provides a coherent, depth-indexed hazard completion layer to demonstrate the end-to-end interactive workflow (Similarity Engine → Depth Evidence Retrieval → Traceable Risk Index → Grounded Explanation).

> [!IMPORTANT]
> - The original raw dataset (`data/processed/events.csv`) is completely untouched and preserved.
> - This synthetic completion layer is **for prototype demonstration only**, not a scientific claim about real drilling statistics.
> - The Risk Model output is labeled as a **Deterministic Risk Index (0–100 / LOW / MEDIUM / HIGH)**, NOT a calibrated statistical probability.

---

## 1. Dataset Architecture & Field Sources

The demo dataset is located at `data/processed/events_demo.csv`.

| Field Name | Source | Description |
|---|---|---|
| `event_id` | Historical | Unique UUID from original raw logging event |
| `well_id`, `wellbore_id` | Historical | NPD official wellbore designation |
| `timestamp_start`, `timestamp_end` | Historical | Daily drilling log timestamps |
| `depth_start_original` | Historical | Original depth start value from `events.csv` |
| `depth_start` | Mixed | Contains real depth (if $>0$) or synthetic empirical depth (if $0$) |
| `depth_end` | Mixed | Real or synthetic interval end depth |
| `depth_source` | Metadata | `"historical"` (real NPD depth) or `"synthetic_demo"` (synthetically completed) |
| `synthetic_depth` | Metadata | `False` if historical, `True` if synthetic |
| `event_type` | Historical | Original hazard type (`MUD_LOSS`, `KICK`, `STUCK_PIPE`, `NPT`, etc.) |
| `description` | Historical | Verbatim text from daily drilling report |
| `hazard_status` / `demo_label_status` | Processed | Cleaned deterministic status (`ACTUAL_HAZARD`, `OPERATIONAL_DRILL`, `NEGATED`, `AMBIGUOUS`) |

---

## 2. Synthetic Depth Generation Methodology

Out of 439 hazard records in `events.csv`, 368 contained positive depth entries and 71 had zero/missing depth.
For records missing depth, depths were generated using a **hierarchical empirical sampling strategy**:

1. **Well & Event-Type Empirical Distribution**: If $\ge 3$ historical events of the same hazard type exist for that specific well, sample from the observed empirical depth distribution with $\pm 15\text{ m}$ normal variance (clipped to $[50\text{ m}, TD - 10\text{ m}]$).
2. **Well-Level Empirical Distribution**: If $\ge 3$ events of any type exist for that well, sample from the well's known depth bounds with $\pm 25\text{ m}$ normal variance.
3. **Field-Level Event Distribution**: If insufficient well data exists, sample from the field-wide depth distribution of that hazard type scaled relative to the target well's Total Depth ($TD$).
4. **Fallback Interval**: Sample within the realistic drilling interval ($25\%$ to $85\%$ of the well's $TD$).

Every completed row is transparently flagged with `synthetic_depth = True` and `depth_source = "synthetic_demo"`.

---

## 3. Deterministic Hazard Label Classification

To clean semantic logging noise (such as routine operational drills or negated mentions):

- **KICK**:
  - `ACTUAL_HAZARD`: Strong actual influx/gain evidence (`observed gain`, `gain in trip tank`, `unexpected flow`, `well flowing with pumps off`, `influx`, `shut in well`, `pit gain`, `kill well`).
  - `OPERATIONAL_DRILL`: Routine drilling / testing (`kick drill`, `kick-off`, `kick joint`, `well control drill`, `tabletop`, `muster drill`, `bop drill`, `choke drill`).
  - `NEGATED`: Confirmed no influx (`no flow`, `well static`, `no gain`).
  - `AMBIGUOUS`: Unclear or maintenance text.
- **MUD_LOSS**:
  - `ACTUAL_HAZARD`: Positive loss evidence (`losing mud`, `lost mud`, `lost X m3`, `losses of X m3/hr`, `loss to formation`, `net loss`, `loss rate`, `lcm pill`, `lost circulation`). Positive evidence wins if both negative and positive mentions occur.
  - `NEGATED`: Pure negative observations (`no losses`, `no loss observed`, `without loss`).
  - `OPERATIONAL_DRILL`: Tool meetings or tests without loss.
- **STUCK_PIPE**:
  - `ACTUAL_HAZARD`: Explicit stuck/restriction evidence (`string stuck`, `pipe stuck`, `jarred on stuck`, `overpull`, `pack off`, `torqued up`, `top drive stalled`, `tight spot`, `unable to pull`).
  - `NEGATED`: Non-pipe equipment stuck (e.g. `drift stuck inside pipe`, `centralizer stuck`).

---

## 4. Checkpoint Dataset & Demo Risk Model

- **Checkpoints File**: `data/processed/demo_risk_checkpoints.csv` (3,930 depth checkpoints across 28 Volve wells, sampled every 25 m).
- **Target Definition (`target_25m`)**: $1$ if an `ACTUAL_HAZARD` occurred within $[D, D + 25\text{ m}]$, else $0$.
- **Model File**: `data/processed/demo_risk_model.joblib`
- **Output Metrics**: 
  - Risk Score (0–100)
  - Risk Level (`LOW` / `MEDIUM` / `HIGH`)
  - Primary Dominant Hazard
  - Closest Offset Hazard Distance
  - Traceable contributing natural language bullet points

---

## 5. Verification & Commands

### 1. Run Complete Verification
```bash
python ml_v2/verify_demo_pipeline.py
```

### 2. Run Interactive Presentation Demo
```bash
python ml_v2/run_demo_scenario.py --well "15/9-F-5" --depth 2500
```
This demonstrates the real-time retrieval of top comparable wells, nearby historical/synthetic hazard events, and the resulting deterministic risk summary.

