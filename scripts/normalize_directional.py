import pandas as pd
import os

# Configuration
RAW_DIR_PATH = r"D:\Downloads\dataset\dsptsdelimit.txt"
OUTPUT_TRAJ = r"data\processed\trajectories.parquet"

def normalize_directional_data(chunk_size=500000, limit_chunks=2):
    print(f"Loading directional data from {RAW_DIR_PATH} in chunks...")
    
    # Based on the data inspection, no headers, delimited by comma, strings quoted
    columns = [
        "API_WELL_NUMBER", "MD", "TVD", "INCLINATION", "N_S_CODE", "N_S_COORD", 
        "BLANK1", "E_W_CODE", "E_W_COORD", "BLANK2", "BLANK3", "LONGITUDE", "LATITUDE"
    ]
    
    chunks = []
    processed = 0
    
    # Because of missing headers and possible varying types, read carefully
    for chunk in pd.read_csv(RAW_DIR_PATH, names=columns, chunksize=chunk_size, dtype=str, on_bad_lines='skip'):
        # Normalize chunk
        df = pd.DataFrame()
        df['wellbore_id'] = chunk['API_WELL_NUMBER']
        df['measured_depth'] = pd.to_numeric(chunk['MD'], errors='coerce')
        df['true_vertical_depth'] = pd.to_numeric(chunk['TVD'], errors='coerce')
        df['inclination'] = pd.to_numeric(chunk['INCLINATION'], errors='coerce')
        df['azimuth'] = None # Requires computation from N/S E/W if not explicitly provided
        df['latitude'] = pd.to_numeric(chunk['LATITUDE'], errors='coerce')
        df['longitude'] = pd.to_numeric(chunk['LONGITUDE'], errors='coerce')
        df['source'] = 'BSEE_DIR'
        
        # Filter invalid rows to save space
        df = df.dropna(subset=['measured_depth', 'latitude'])
        
        chunks.append(df)
        processed += 1
        
        if processed >= limit_chunks:
            break
            
    if chunks:
        final_df = pd.concat(chunks, ignore_index=True)
        os.makedirs(os.path.dirname(OUTPUT_TRAJ), exist_ok=True)
        final_df.to_parquet(OUTPUT_TRAJ, index=False)
        print(f"Extracted {len(final_df)} trajectory points.")
        print(f"Saved to {OUTPUT_TRAJ}")
    else:
        print("No directional data parsed.")

if __name__ == "__main__":
    normalize_directional_data()

