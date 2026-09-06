"""
Interactive Demo Scenario for SIH 2026 Presentation
Usage: python ml_v2/run_demo_scenario.py [--well 15/9-F-5] [--depth 2500]
"""

import sys
import argparse
sys.path.append('.')
from ml_v2.demo_risk_scorer import DemoRiskScorer

def run_demo_scenario(well_name: str = "15/9-F-5", depth: float = 2500.0):
    print("=" * 65)
    print("eRTMAC-NWIS DRILLING RISK & EVIDENCE DEMO (SIH 2026)")
    print("=" * 65)

    scorer = DemoRiskScorer()
    res = scorer.score_well_depth(well_name, depth)

    if "error" in res:
        print(f"Error: {res['error']}")
        return res

    print(f"\n[TARGET DRILLING CONTEXT]")
    print(f"  Wellbore:      {res['well']}")
    print(f"  Current Depth: {res['depth_m']:.1f} m MD")

    print(f"\n[DEMO RISK ASSESSMENT]")
    print(f"  Risk Level:    {res['risk_level']} HISTORICAL RISK")
    print(f"  Risk Score:    {res['risk_score']} / 100")
    print(f"  Primary Hazard:{res['dominant_hazard'].replace('_', ' ')}")
    print(f"  Status:        {res['disclaimer']}")

    print(f"\n[TRACEABLE EVIDENCE SUMMARY]")
    for factor in res['contributing_factors']:
        print(f"  • {factor}")

    print(f"\n[RETRIEVED NEARBY HISTORICAL EVENTS (within 100m)]")
    if not res['nearby_events']:
        print("  (No offset hazard events recorded within 100m)")
    else:
        for idx, ev in enumerate(res['nearby_events'], 1):
            src_tag = "Synthetic Depth Completion" if ev['synthetic_depth'] else "Historical NPD Log"
            print(f"  {idx}. Offset Well: {ev['well']} (Similarity: {ev['similarity_score']}/100)")
            print(f"     Hazard Type: {ev['event_type']} at {ev['depth']:.1f} m (Distance: {ev['distance_m']:.1f} m)")
            print(f"     Source:      {src_tag}")
            print(f"     Description: \"{ev['description']}\"")
            print()

    print("=" * 65)
    return res

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run eRTMAC-NWIS Demo Scenario")
    parser.add_argument("--well", type=str, default="15/9-F-5", help="Target well name")
    parser.add_argument("--depth", type=float, default=2500.0, help="Target depth in meters")
    args = parser.parse_args()

    run_demo_scenario(args.well, args.depth)

