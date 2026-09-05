import pandas as pd
import os
import uuid

# Configuration
RAW_BOREHOLE_PATH = r"D:\Downloads\dataset\BSEE Borehole.csv"
OUTPUT_WELLS = r"data\processed\wells.parquet"
OUTPUT_WELLBORES = r"data\processed\wellbores.parquet"

def normalize_bsee_wells():
    print(f"Loading {RAW_BOREHOLE_PATH}...")
    df = pd.read_csv(RAW_BOREHOLE_PATH, dtype=str)
    
    # We only take a subset of valid rows to keep prototype fast, or process all. 
    # BSEE has ~50k-100k wells, which is small enough for pandas.
    print(f"Loaded {len(df)} BSEE boreholes.")
    
    # Normalize Wells
    wells = pd.DataFrame()
    wells['well_id'] = [str(uuid.uuid4()) for _ in range(len(df))]
    wells['source_well_id'] = df['API Well Number']
    wells['api_number'] = df['API Well Number']
    wells['well_name'] = df['Well Name']
    wells['operator'] = df['Company Name']
    wells['field'] = df['Bottom Area'] + " " + df['Bottom Block']
    wells['latitude'] = pd.to_numeric(df['Surface Latitude*'], errors='coerce')
    wells['longitude'] = pd.to_numeric(df['Surface Longitude*'], errors='coerce')
    wells['bottom_latitude'] = pd.to_numeric(df['Bottom Latitude*'], errors='coerce')
    wells['bottom_longitude'] = pd.to_numeric(df['Bottom Longitude*'], errors='coerce')
    wells['total_depth'] = pd.to_numeric(df['BH Total MD (feet)'], errors='coerce')
    wells['tvd'] = pd.to_numeric(df['True Vertical Depth (feet)'], errors='coerce')
    wells['well_type'] = df['Type Code']
    wells['spud_date'] = pd.to_datetime(df['Spud Date'], errors='coerce')
    wells['source'] = 'BSEE'
    
    # Normalize Wellbores
    wellbores = pd.DataFrame()
    wellbores['wellbore_id'] = [str(uuid.uuid4()) for _ in range(len(df))]
    wellbores['well_id'] = wells['well_id']
    wellbores['source_wellbore_id'] = df['API Well Number']
    wellbores['wellbore_name'] = df['Well Name'] + " " + df['Well Name Suffix'].fillna('')
    wellbores['status'] = df['Status Code']
    wellbores['source'] = 'BSEE'
    
    os.makedirs(os.path.dirname(OUTPUT_WELLS), exist_ok=True)
    
    # Save to Parquet
    wells.to_parquet(OUTPUT_WELLS, index=False)
    wellbores.to_parquet(OUTPUT_WELLBORES, index=False)
    
    print(f"Saved {len(wells)} wells to {OUTPUT_WELLS}")
    print(f"Saved {len(wellbores)} wellbores to {OUTPUT_WELLBORES}")

if __name__ == "__main__":
    normalize_bsee_wells()

