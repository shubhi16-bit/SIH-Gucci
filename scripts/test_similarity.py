import sys
import os

sys.path.append(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

from backend.similarity import SimilarityEngine

# =========================================================
# CONFIGURATION
# =========================================================

METADATA_PATH = r"C:\Users\User\Downloads\wellbore_exploration_all.csv"
EVENTS_PATH = r"data\processed\events.csv"


# =========================================================
# PROPOSED WELL
# =========================================================

current_well = {
    "name": "PROPOSED-WELL-01",
    "field": "VOLVE",
    "well_type": "EXPLORATION",

    "latitude": 58.435903,
    "longitude": 1.929736,

    "total_depth": 4200.0,
    "tvd": 3300.0,

    "max_inclination": 58.0,

    "formation_td": "SMITH BANK FM",
    "formation_hc": "HUGIN FM"
}


# =========================================================
# CURRENT DRILLING DEPTH
# =========================================================

CURRENT_DEPTH = 2210.0

TOP_K = 3

DEPTH_TOLERANCE = 15.0


# =========================================================
# CREATE SIMILARITY ENGINE
# =========================================================

engine = SimilarityEngine(
    METADATA_PATH,
    EVENTS_PATH
)


# =========================================================
# RUN COMPLETE ANALYSIS
# =========================================================

result = engine.analyze_well(
    current_well,
    CURRENT_DEPTH,
    TOP_K,
    DEPTH_TOLERANCE
)


# =========================================================
# DISPLAY RESULTS
# =========================================================

print("\n========================================")
print("       SIMILARITY ENGINE RESULTS")
print("========================================")

print("\nProposed Well:")
print(
    result["proposed_well"]["name"]
)

print("\nCurrent Depth:")
print(
    result["current_depth"],
    "m"
)


# =========================================================
# COMPARABLE WELLS
# =========================================================

print("\n----------------------------------------")
print("TOP COMPARABLE WELLS")
print("----------------------------------------")

for well in result["comparable_wells"]:

    print(
        f"\nRank {well['rank']}: "
        f"{well['well']}"
    )

    print(
        f"Similarity: "
        f"{well['similarity_score']}%"
    )

    print(
        f"Geographic: "
        f"{well['geographic_similarity']}%"
    )

    print(
        f"Depth: "
        f"{well['depth_similarity']}%"
    )

    print(
        f"Formation: "
        f"{well['formation_similarity']}%"
    )

    print(
        f"Trajectory: "
        f"{well['trajectory_similarity']}%"
    )

    print(
        f"Context: "
        f"{well['context_similarity']}%"
    )

    print(
        f"Historical events: "
        f"{well['total_historical_events']}"
    )

    print(
        "Event summary:",
        well["historical_events"]
    )


# =========================================================
# HISTORICAL DEPTH EVIDENCE
# =========================================================

print("\n----------------------------------------")
print("HISTORICAL DEPTH EVIDENCE")
print("----------------------------------------")

evidence = result[
    "historical_depth_evidence"
]

print(
    f"Events within "
    f"±{DEPTH_TOLERANCE} m:"
    f" {len(evidence)}"
)

for event in evidence:

    print(
        f"\n{event['well']}"
    )

    print(
        f"  Event: "
        f"{event['event_type']}"
    )

    print(
        f"  Event depth: "
        f"{event['event_depth']} m"
    )

    print(
        f"  Distance: "
        f"{event['depth_distance']} m"
    )

    print(
        f"  Confidence: "
        f"{event['confidence']}"
    )


# =========================================================
# HISTORICAL RISK FEATURES
# =========================================================

print("\n----------------------------------------")
print("HISTORICAL RISK FEATURES")
print("----------------------------------------")

risk = result[
    "historical_risk_features"
]

for key, value in risk.items():

    print(
        f"{key}: {value}"
    )


print("\n========================================")
print("          ANALYSIS COMPLETE")
print("========================================")