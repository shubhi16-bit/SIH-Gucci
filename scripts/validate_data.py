import pandas as pd
import os

PROCESSED_DIR = r"data\processed"

def validate_data():
    report = []
    
    # Check Wells
    wells_path = os.path.join(PROCESSED_DIR, "wells.parquet")
    if os.path.exists(wells_path):
        df = pd.read_parquet(wells_path)
        report.append(f"WELLS: {len(df)} records.")
        report.append(f" - Missing coordinates: {df['latitude'].isna().sum()}")
        report.append(f" - Missing total depth: {df['total_depth'].isna().sum()}")
        
    # Check Wellbores
    wellbores_path = os.path.join(PROCESSED_DIR, "wellbores.parquet")
    if os.path.exists(wellbores_path):
        df = pd.read_parquet(wellbores_path)
        report.append(f"WELLBORES: {len(df)} records.")
        
    # Check Trajectories
    traj_path = os.path.join(PROCESSED_DIR, "trajectories.parquet")
    if os.path.exists(traj_path):
        df = pd.read_parquet(traj_path)
        report.append(f"TRAJECTORIES: {len(df)} records.")
        report.append(f" - Missing depths: {df['measured_depth'].isna().sum()}")
        
    # Check Parameters
    params_path = os.path.join(PROCESSED_DIR, "drilling_parameters.parquet")
    if os.path.exists(params_path):
        df = pd.read_parquet(params_path)
        report.append(f"DRILLING_PARAMETERS: {len(df)} records.")
        
    # Check Events
    events_path = os.path.join(PROCESSED_DIR, "events.parquet")
    if os.path.exists(events_path):
        df = pd.read_parquet(events_path)
        report.append(f"EVENTS: {len(df)} records.")
        
    print("\n".join(report))
    
    with open("docs/extraction_report.md", "w") as f:
        f.write("# Extraction & Validation Report\n\n")
        f.write("\n".join([f"- {line}" for line in report]))

if __name__ == "__main__":
    validate_data()

