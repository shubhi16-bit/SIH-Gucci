"""
Demo Event Dataset Generator for eRTMAC-NWIS (SIH 2026 Prototype)
Generates data/processed/events_demo.csv from data/processed/events.csv.
Preserves original events.csv completely untouched.
"""

import os
import re
import hashlib
import numpy as np
import pandas as pd

def compute_file_hash(filepath: str) -> str:
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    return hasher.hexdigest()

def classify_hazard_record(event_type: str, description: str) -> str:
    """
    Deterministic classification of hazard records for the demo dataset:
    - ACTUAL_HAZARD
    - OPERATIONAL_DRILL
    - NEGATED
    - AMBIGUOUS
    """
    desc = str(description).lower() if pd.notna(description) else ""
    et = str(event_type).upper().strip()

    if et == 'KICK':
        pos_patterns = [
            r'observed gain', r'gain in trip tank', r'trip tank gain', r'unexpected flow',
            r'well flowing', r'flowing with pumps off', r'influx', r'shut in well',
            r'shut-in well', r'pressure increase associated with gain', r'pit gain',
            r'gas kick', r'well took a kick', r'flow check positive', r'active pit gain',
            r'well control event', r'kick taken', r'well flowed', r'kick detected',
            r'gas peak', r'kill well', r'bullhead'
        ]
        drill_patterns = [
            r'kick drill', r'kick-off', r'kick off', r'kicked off', r'kicked-off',
            r'kick joint', r'well control drill', r'well control exercise', r'table top',
            r'tabletop', r'muster drill', r'toolbox talk', r'\btbt\b', r'focus on well control',
            r'well control equipment', r'well control assy', r'bop drill', r'choke drill',
            r'pit drill', r'trip drill', r'well control', r'trip sheet', r'kicking off',
            r'kick assembly'
        ]
        neg_patterns = [
            r'no flow', r'well static', r'no gain', r'no influx', r'observed no gain',
            r'observed no flow'
        ]

        has_pos = any(re.search(p, desc) for p in pos_patterns)
        has_drill = any(re.search(p, desc) for p in drill_patterns)
        has_neg = any(re.search(p, desc) for p in neg_patterns)

        if has_pos:
            return 'ACTUAL_HAZARD'
        if has_drill:
            return 'OPERATIONAL_DRILL'
        if has_neg:
            return 'NEGATED'
        return 'AMBIGUOUS'

    elif et == 'MUD_LOSS':
        pos_patterns = [
            r'losing mud', r'lost mud', r'mud loss', r'mud losses', r'lost \d+',
            r'loss of \d+', r'losses of', r'loss to formation', r'losses to formation',
            r'net loss', r'loss rate', r'total loss', r'seepage loss', r'partial loss',
            r'severe loss', r'complete loss', r'lcm pill', r'\blcm\b', r'lost circulation',
            r'lost circ', r'curing loss', r'dynamic loss', r'static loss', r'loss \d+',
            r'losses \d+', r'observed loss', r'experienced loss', r'loss trend',
            r'losses while', r'losses increased', r'gained/lost', r'loss of returns',
            r'returns.*lost', r'lost returns'
        ]
        neg_patterns = [
            r'no loss', r'no losses', r'without loss', r'without losses', r'zero loss',
            r'losses:\s*0', r'losses\s*=\s*0', r'no fluid loss', r'no mud loss',
            r'no losses observed', r'casing.*no losses'
        ]

        has_pos = any(re.search(p, desc) for p in pos_patterns)
        has_neg = any(re.search(p, desc) for p in neg_patterns)

        # Positive evidence wins if both are present
        if has_pos:
            return 'ACTUAL_HAZARD'
        if has_neg:
            return 'NEGATED'
        if any(p in desc for p in ['drill', 'exercise', 'meeting', 'tbt', 'toolbox', 'pre-job']):
            return 'OPERATIONAL_DRILL'
        return 'AMBIGUOUS'

    elif et == 'STUCK_PIPE':
        pos_patterns = [
            r'string stuck', r'pipe stuck', r'stuck pipe', r'stuck in hole', r'stuck at',
            r'jarred on stuck', r'worked stuck', r'stuck string', r'overpull',
            r'took overpull', r'pack off', r'packed off', r'packed-off', r'pack-off',
            r'torqued up', r'torquing up', r'torqued-up', r'tds stalled', r'top drive stalled',
            r'tight hole', r'tight spot', r'unable to pull', r'unable to rotate',
            r'freed string', r'freed stuck', r'fish in hole', r'parted string', r'stuck BHA'
        ]
        neg_drift_patterns = [
            r'drift stuck', r'centralizer stuck', r'plug launcher', r'secondary bowl',
            r'tong'
        ]

        has_pos = any(re.search(p, desc) for p in pos_patterns)
        has_drift = any(re.search(p, desc) for p in neg_drift_patterns)

        if has_pos and not has_drift:
            return 'ACTUAL_HAZARD'
        if has_drift and not has_pos:
            return 'NEGATED'
        if any(p in desc for p in ['drill', 'exercise', 'meeting', 'tbt']):
            return 'OPERATIONAL_DRILL'
        return 'AMBIGUOUS'

    else:
        # Other operational events (EQUIPMENT_FAILURE, NPT, ABNORMAL_OPERATION)
        if any(p in desc for p in ['drill', 'exercise', 'meeting', 'tbt', 'test']):
            return 'OPERATIONAL_DRILL'
        return 'ACTUAL_HAZARD'


def generate_demo_dataset(
    events_path: str = "data/processed/events.csv",
    metadata_path: str = "data/processed/volve_well_metadata.csv",
    output_path: str = "data/processed/events_demo.csv",
    random_seed: int = 42
):
    print("==================================================")
    print("GENERATING DEMO EVENT DATASET (events_demo.csv)")
    print("==================================================")

    orig_hash = compute_file_hash(events_path)
    print(f"Original events.csv SHA-256: {orig_hash[:16]}... (Will remain unchanged)")

    df_events = pd.read_csv(events_path)
    df_meta = pd.read_csv(metadata_path)

    # Clean well names for matching
    df_events['clean_well'] = df_events['wellbore_id'].str.replace('NO ', '').str.strip()
    meta_dict = {}
    for _, row in df_meta.iterrows():
        name = str(row['wellbore_name']).replace('NO ', '').strip()
        td = float(row['total_depth']) if pd.notna(row['total_depth']) and float(row['total_depth']) > 0 else 3000.0
        tvd = float(row['tvd']) if pd.notna(row['tvd']) and float(row['tvd']) > 0 else td
        meta_dict[name] = {'total_depth': td, 'tvd': tvd}

    np.random.seed(random_seed)

    # 1. Preserve original depth values
    df_events['depth_start_original'] = df_events['depth_start']
    df_events['depth_source'] = 'historical'
    df_events['synthetic_depth'] = False

    # 2. Build empirical depth distributions for sampling
    valid_mask = (df_events['depth_start'] > 0) & df_events['depth_start'].notna()
    valid_df = df_events[valid_mask]

    well_type_dists = {}
    for (w, et), group in valid_df.groupby(['clean_well', 'event_type']):
        well_type_dists[(w, et)] = group['depth_start'].values

    well_dists = {}
    for w, group in valid_df.groupby('clean_well'):
        well_dists[w] = group['depth_start'].values

    field_type_dists = {}
    for et, group in valid_df.groupby('event_type'):
        field_type_dists[et] = group['depth_start'].values

    # 3. Process each record
    synthetic_count = 0
    historical_count = 0

    new_depth_starts = []
    new_depth_ends = []
    depth_sources = []
    synthetic_depth_flags = []

    for idx, row in df_events.iterrows():
        d_orig = row['depth_start']
        w = row['clean_well']
        et = row['event_type']
        well_info = meta_dict.get(w, {'total_depth': 3000.0, 'tvd': 3000.0})
        td = well_info['total_depth']

        if pd.notna(d_orig) and d_orig > 0:
            # Valid historical depth
            new_depth_starts.append(float(d_orig))
            d_end = row['depth_end']
            if pd.notna(d_end) and d_end >= d_orig:
                new_depth_ends.append(float(d_end))
            else:
                new_depth_ends.append(float(d_orig) + 1.0)
            depth_sources.append('historical')
            synthetic_depth_flags.append(False)
            historical_count += 1
        else:
            # Generate synthetic depth based on hierarchical empirical sampling
            synth_d = None
            if (w, et) in well_type_dists and len(well_type_dists[(w, et)]) >= 3:
                vals = well_type_dists[(w, et)]
                sampled = np.random.choice(vals) + np.random.normal(0, 15.0)
                synth_d = float(np.clip(sampled, 50.0, td - 10.0))
            elif w in well_dists and len(well_dists[w]) >= 3:
                vals = well_dists[w]
                sampled = np.random.choice(vals) + np.random.normal(0, 25.0)
                synth_d = float(np.clip(sampled, 50.0, td - 10.0))
            elif et in field_type_dists and len(field_type_dists[et]) >= 5:
                vals = field_type_dists[et]
                # Scale relative to well TD
                ref_ratio = np.random.choice(vals) / 3500.0
                synth_d = float(np.clip(ref_ratio * td, 0.2 * td, 0.85 * td))
            else:
                # Default reasonable interval (20% to 90% of TD)
                synth_d = float(np.random.uniform(0.25 * td, 0.85 * td))

            # Round to 1 decimal place
            synth_d = round(synth_d, 1)
            new_depth_starts.append(synth_d)
            new_depth_ends.append(round(synth_d + 1.0, 1))
            depth_sources.append('synthetic_demo')
            synthetic_depth_flags.append(True)
            synthetic_count += 1

    df_events['depth_start'] = new_depth_starts
    df_events['depth_end'] = new_depth_ends
    df_events['depth_source'] = depth_sources
    df_events['synthetic_depth'] = synthetic_depth_flags

    # 4. Classify hazard status
    df_events['hazard_status'] = [
        classify_hazard_record(row['event_type'], row['description'])
        for _, row in df_events.iterrows()
    ]
    df_events['demo_label_status'] = df_events['hazard_status']

    # Remove temporary helper columns
    df_events = df_events.drop(columns=['clean_well'])

    # Ensure output dir exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df_events.to_csv(output_path, index=False)

    print(f"Output saved to: {output_path}")
    print(f"Total records: {len(df_events)}")
    print(f"  - Historical depth records: {historical_count}")
    print(f"  - Synthetic depth records:  {synthetic_count}")

    # Verify original file hash
    new_orig_hash = compute_file_hash(events_path)
    assert orig_hash == new_orig_hash, "CRITICAL ERROR: Original events.csv was modified!"
    print("Verification passed: Original events.csv was NOT modified.")

    # Print summary statistics
    hazard_sub = df_events[df_events['event_type'].isin(['MUD_LOSS', 'KICK', 'STUCK_PIPE'])]
    print("\n--- DEMO HAZARD CLASSIFICATION SUMMARY (Hazard Types) ---")
    print(pd.crosstab(hazard_sub['event_type'], hazard_sub['hazard_status'], margins=True))

    return df_events

if __name__ == "__main__":
    generate_demo_dataset()

