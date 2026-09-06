import pandas as pd
import numpy as np

def extract_features(telemetry_df, window_sizes=[5, 10]):
    """
    Extract derived time-series and depth-series features over sliding windows.
    telemetry_df: DataFrame containing at least ROP, TQA (Torque), SWOB (WOB), SPPA (Standpipe Pressure)
    """
    df = telemetry_df.copy()
    
    # Ensure standard column names based on demo_stream.csv
    col_map = {
        'ROP5': 'ROP',
        'TQA': 'Torque',
        'SWOB': 'WOB',
        'SPPA': 'Pressure',
        'DMEA': 'Depth'
    }
    df = df.rename(columns={k: v for k, v in col_map.items() if k in df.columns})
    df = df.loc[:, ~df.columns.duplicated(keep='first')]
    
    # Fill NAs
    df = df.ffill().fillna(0)
    
    core_cols = ['ROP', 'Torque', 'WOB', 'Pressure']
    
    for col in core_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            
            for w in window_sizes:
                df[f'{col}_roll_mean_{w}'] = df[col].rolling(w, min_periods=1).mean()
                df[f'{col}_roll_std_{w}'] = df[col].rolling(w, min_periods=1).std().fillna(0)
                
            # Slope / Delta (rate of change)
            df[f'Delta_{col}'] = df[col].diff().fillna(0)
            
    return df

def add_contextual_features(df, context_dict):
    """
    context_dict: e.g., {'formation_match': 0.8, 'prox_to_hist_event': 15.0, 'hist_event_freq': 3}
    """
    for k, v in context_dict.items():
        df[k] = v
    return df

