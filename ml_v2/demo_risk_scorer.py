"""
Demo Risk Scorer for eRTMAC-NWIS (SIH 2026 Prototype)
Provides deterministic risk scoring, hazard analysis, and explanation generation
for demo queries and the SIH pitch presentation.
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd

sys.path.append('.')
from backend.similarity import SimilarityEngine

FEATURE_COLS = [
    'feat_depth',
    'feat_norm_depth',
    'feat_similar_well_count',
    'feat_best_similarity',
    'feat_mean_similarity',
    'feat_weighted_any_evidence',
    'feat_weighted_mud_loss_evidence',
    'feat_weighted_kick_evidence',
    'feat_weighted_stuck_pipe_evidence',
    'feat_high_confidence_event_count',
    'feat_closest_event_distance'
]

class DemoRiskScorer:
    """
    Evidence-grounded Risk Scorer for the SIH 2026 Prototype Demo.
    Loads data/processed/demo_risk_model.joblib and computes traceable risk metrics.
    """
    def __init__(
        self,
        model_path: str = "data/processed/demo_risk_model.joblib",
        metadata_path: str = "data/processed/volve_well_metadata.csv",
        events_path: str = "data/processed/events_demo.csv"
    ):
        if os.path.exists(model_path):
            pkg = joblib.load(model_path)
            self.model = pkg['model']
            self.feature_names = pkg['feature_names']
            self.training_meta = pkg.get('meta', {})
        else:
            self.model = None
            self.feature_names = FEATURE_COLS
            self.training_meta = {}

        self.sim_engine = SimilarityEngine(metadata_path, events_path)
        self.df_events = pd.read_csv(events_path)
        self.df_events['clean_well'] = self.df_events['wellbore_id'].str.replace('NO ', '').str.strip()

        self.actual_hazards = self.df_events[
            (self.df_events['event_type'].isin(['MUD_LOSS', 'KICK', 'STUCK_PIPE'])) &
            (self.df_events['hazard_status'] == 'ACTUAL_HAZARD')
        ]

    def extract_features(self, current_well: str, depth: float, horizon_m: float = 25.0) -> tuple:
        """Extract evidence features using SimilarityEngine and offset actual hazards."""
        clean_target = current_well.replace('NO ', '').strip()
        target_obj = next((w for w in self.sim_engine.wells if w['name'] == clean_target), None)

        if not target_obj:
            return {}, []

        td = float(target_obj.get('total_depth', 3000.0) or 3000.0)
        rankings = self.sim_engine.rank_wells(target_obj, top_k=50, exclude_name=clean_target)
        sim_scores = {r['well'].replace('NO ', '').strip(): r['score'] for r in rankings}
        top_sims = [r['score'] for r in rankings[:5]]
        best_sim = top_sims[0] if top_sims else 0.0
        mean_sim = float(np.mean(top_sims)) if top_sims else 0.0

        # Offset hazard evidence
        nearby_events = []
        weighted_any = 0.0
        weighted_mud_loss = 0.0
        weighted_kick = 0.0
        weighted_stuck_pipe = 0.0
        high_conf_count = 0
        min_dist = 9999.0
        similar_well_count = 0

        for r in rankings[:10]:
            offset_name = r['well'].replace('NO ', '').strip()
            score = r['score']
            if score >= 50.0:
                similar_well_count += 1
            sim_weight = score / 100.0

            well_evs = self.actual_hazards[self.actual_hazards['clean_well'] == offset_name]
            for _, oe in well_evs.iterrows():
                oe_depth = float(oe['depth_start'])
                dist = abs(oe_depth - depth)
                if dist < min_dist:
                    min_dist = dist

                if dist <= 100.0:
                    nearby_events.append({
                        "well": offset_name,
                        "similarity_score": round(score, 1),
                        "event_type": oe['event_type'],
                        "depth": oe_depth,
                        "distance_m": round(dist, 1),
                        "description": str(oe.get('description', ''))[:120],
                        "synthetic_depth": bool(oe.get('synthetic_depth', False))
                    })

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

        feat_dict = {
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
        }

        # Sort nearby events by distance
        nearby_events.sort(key=lambda x: x['distance_m'])

        return feat_dict, nearby_events

    def score_well_depth(self, current_well: str, depth: float) -> dict:
        """Run complete evidence extraction and demo scoring for a well and depth."""
        clean_target = current_well.replace('NO ', '').strip()
        feat_dict, nearby_events = self.extract_features(clean_target, depth)

        if not feat_dict:
            return {"error": f"Well '{current_well}' not found in metadata."}

        # Model prediction
        if self.model:
            X_row = np.array([[feat_dict.get(c, 0.0) for c in self.feature_names]])
            raw_prob = float(self.model.predict_proba(X_row)[0, 1])
        else:
            raw_prob = 0.1

        weighted_evidence = float(feat_dict.get('feat_weighted_any_evidence', 0.0))
        dist = float(feat_dict.get('feat_closest_event_distance', 1000.0))
        prox_factor = max(0.0, 1.0 - (dist / 100.0))

        # 0-100 Risk Score calculation
        base_score = raw_prob * 100.0
        evidence_boost = min(40.0, weighted_evidence * 20.0 + prox_factor * 25.0)
        risk_score_100 = round(float(np.clip(base_score + evidence_boost, 8.0, 92.0)), 1)

        if risk_score_100 >= 60.0:
            risk_level = "HIGH"
        elif risk_score_100 >= 30.0:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Dominant hazard
        mud_loss = feat_dict.get('feat_weighted_mud_loss_evidence', 0.0)
        kick = feat_dict.get('feat_weighted_kick_evidence', 0.0)
        stuck = feat_dict.get('feat_weighted_stuck_pipe_evidence', 0.0)

        # Count events by type in nearby window
        nearby_types = [e['event_type'] for e in nearby_events]
        ml_cnt = nearby_types.count('MUD_LOSS')
        k_cnt = nearby_types.count('KICK')
        sp_cnt = nearby_types.count('STUCK_PIPE')

        if ml_cnt >= k_cnt and ml_cnt >= sp_cnt and ml_cnt > 0:
            dominant_hazard = "MUD_LOSS"
        elif sp_cnt >= ml_cnt and sp_cnt >= k_cnt and sp_cnt > 0:
            dominant_hazard = "STUCK_PIPE"
        elif k_cnt > 0:
            dominant_hazard = "KICK"
        else:
            dominant_hazard = "NONE"

        # Distinct comparable wells with events nearby
        comparable_event_wells = list(set(e['well'] for e in nearby_events))

        # Construct explanation sentences
        contributing_factors = []
        if len(comparable_event_wells) > 0:
            contributing_factors.append(
                f"{len(comparable_event_wells)} comparable offset wells ({', '.join(comparable_event_wells[:3])}) "
                f"show historical hazard evidence within 100 m of {depth:.1f} m."
            )
        if dominant_hazard != "NONE":
            contributing_factors.append(f"{dominant_hazard.replace('_', ' ')} evidence is the dominant historical hazard pattern.")
        if dist < 500.0:
            contributing_factors.append(f"Closest historical hazard event: approximately {dist:.1f} m from current depth.")

        return {
            "well": clean_target,
            "depth_m": depth,
            "risk_score": risk_score_100,
            "risk_level": risk_level,
            "dominant_hazard": dominant_hazard,
            "comparable_wells_with_hazards_count": len(comparable_event_wells),
            "closest_event_distance_m": dist,
            "contributing_factors": contributing_factors,
            "nearby_events": nearby_events[:5],
            "disclaimer": (
                "Prototype Demonstration (Synthetic depth completion) - "
                "Deterministic Risk Index (0-100), NOT a calibrated statistical probability."
            )
        }

