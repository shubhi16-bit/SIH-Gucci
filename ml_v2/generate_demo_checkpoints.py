"""
Demo Risk Checkpoint Dataset Generator for eRTMAC-NWIS (SIH 2026 Prototype)
Generates data/processed/demo_risk_checkpoints.csv
"""

import os
import sys
import csv
import pandas as pd
import numpy as np

sys.path.append('.')
from backend.similarity import SimilarityEngine

def generate_demo_checkpoints(
    events_demo_path: str = "data/processed/events_demo.csv",
    metadata_path: str = "data/processed/volve_well_metadata.csv",
    output_path: str = "data/processed/demo_risk_checkpoints.csv",
    checkpoint_step: float = 50.0,
    horizon_m: float = 25.0
):
    print("==================================================")
    print("GENERATING DEMO RISK CHECKPOINTS")
    print("==================================================")

    sim_engine = SimilarityEngine(metadata_path, events_demo_path)
    df_events = pd.read_csv(events_demo_path)
    df_meta = pd.read_csv(metadata_path)

    # Clean well names
    df_events['clean_well'] = df_events['wellbore_id'].str.replace('NO ', '').str.strip()

    # Filter only ACTUAL_HAZARD events for target labels & evidence calculations
    target_hazard_types = {'MUD_LOSS', 'KICK', 'STUCK_PIPE'}
    actual_hazards = df_events[
        (df_events['event_type'].isin(target_hazard_types)) &
        (df_events['hazard_status'] == 'ACTUAL_HAZARD')
    ].copy()

    # Group events by well
    events_by_well = {}
    for w, group in actual_hazards.groupby('clean_well'):
        events_by_well[w] = group.to_dict('records')

    # Wells metadata dict
    meta_dict = {}
    for _, row in df_meta.iterrows():
        name = str(row['wellbore_name']).replace('NO ', '').strip()
        td = float(row['total_depth']) if pd.notna(row['total_depth']) and float(row['total_depth']) > 0 else 3000.0
        meta_dict[name] = {
            'name': name,
            'total_depth': td,
            'tvd': float(row['tvd']) if pd.notna(row['tvd']) and float(row['tvd']) > 0 else td,
            'latitude': float(row['latitude']) if pd.notna(row['latitude']) else 58.44,
            'longitude': float(row['longitude']) if pd.notna(row['longitude']) else 1.90,
            'max_inclination': float(row['max_inclination']) if pd.notna(row['max_inclination']) else 0.0,
        }

    rows = []

    for target_name, target_well in meta_dict.items():
        td = target_well['total_depth']
        target_events = events_by_well.get(target_name, [])

        # Compute similarity ranking once per target well (excluding target well to prevent self-leakage)
        target_well_obj = next((w for w in sim_engine.wells if w['name'] == target_name), None)
        if target_well_obj:
            rankings = sim_engine.rank_wells(target_well_obj, top_k=50, exclude_name=target_name)
            sim_scores = {r['well'].replace('NO ', '').strip(): r['score'] for r in rankings}
            top_sims = [r['score'] for r in rankings[:5]]
            best_sim = top_sims[0] if top_sims else 0.0
            mean_sim = float(np.mean(top_sims)) if top_sims else 0.0
        else:
            sim_scores = {}
            best_sim = 0.0
            mean_sim = 0.0

        # Generate depth checkpoints from 50m through TD
        depth = 50.0
        while depth <= td:
            # 1. Target label in [depth, depth + horizon_m]
            target_hits = [
                e for e in target_events
                if depth <= float(e['depth_start']) < (depth + horizon_m)
            ]

            target_25m = 1 if len(target_hits) > 0 else 0
            if target_hits:
                types = list(set(e['event_type'] for e in target_hits))
                event_type = types[0] if len(types) == 1 else "MULTIPLE"
                synthetic_used = any(bool(e.get('synthetic_depth', False)) for e in target_hits)
            else:
                event_type = "NONE"
                synthetic_used = False

            # 2. Extract evidence features from offset wells
            # Looking at offset actual hazards in depth window [depth - 25, depth + 25]
            weighted_any = 0.0
            weighted_mud_loss = 0.0
            weighted_kick = 0.0
            weighted_stuck_pipe = 0.0
            high_conf_count = 0
            min_dist = 9999.0
            similar_well_count = 0

            for offset_name, score in sim_scores.items():
                if score >= 50.0:
                    similar_well_count += 1
                sim_weight = score / 100.0
                offset_evs = events_by_well.get(offset_name, [])

                for oe in offset_evs:
                    oe_depth = float(oe['depth_start'])
                    dist = abs(oe_depth - depth)
                    if dist < min_dist:
                        min_dist = dist

                    if dist <= horizon_m:
                        weighted_any += sim_weight
                        etype = oe['event_type']
                        if etype == 'MUD_LOSS':
                            weighted_mud_loss += sim_weight
                        elif etype == 'KICK':
                            weighted_kick += sim_weight
                        elif etype == 'STUCK_PIPE':
                            weighted_stuck_pipe += sim_weight

                        if str(oe.get('confidence', '')).upper() == 'HIGH':
                            high_conf_count += 1

            feat_closest_dist = min_dist if min_dist < 9000.0 else 1000.0

            rows.append({
                'wellbore_id': target_name,
                'checkpoint_depth': depth,
                'target_25m': target_25m,
                'event_type': event_type,
                'synthetic_data_used': synthetic_used,
                'feat_depth': depth,
                'feat_norm_depth': round(depth / td, 4),
                'feat_similar_well_count': similar_well_count,
                'feat_best_similarity': round(best_sim, 2),
                'feat_mean_similarity': round(mean_sim, 2),
                'feat_weighted_any_evidence': round(weighted_any, 4),
                'feat_weighted_mud_loss_evidence': round(weighted_mud_loss, 4),
                'feat_weighted_kick_evidence': round(weighted_kick, 4),
                'feat_weighted_stuck_pipe_evidence': round(weighted_stuck_pipe, 4),
                'feat_high_confidence_event_count': high_conf_count,
                'feat_closest_event_distance': round(feat_closest_dist, 1)
            })

            depth += checkpoint_step

    df_checkpoints = pd.DataFrame(rows)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df_checkpoints.to_csv(output_path, index=False)

    print(f"Checkpoints generated: {len(df_checkpoints)}")
    print(f"  - Positive checkpoints (target_25m=1): {sum(df_checkpoints['target_25m'] == 1)}")
    print(f"  - Negative checkpoints (target_25m=0): {sum(df_checkpoints['target_25m'] == 0)}")
    print(f"  - Positive rate (prevalence): {df_checkpoints['target_25m'].mean():.3%}")
    print(f"  - Synthetic data used in positive targets: {sum(df_checkpoints['synthetic_data_used'] == True)}")
    print(f"Saved to: {output_path}")

    return df_checkpoints

if __name__ == "__main__":
    generate_demo_checkpoints()
