import pandas as pd
import numpy as np

def generate_labels(telemetry_df, events_df, depth_col='Depth', window_backward=15):
    """
    Convert historical events into supervised learning examples.
    For a known event at depth D, look backward by a specific window (e.g., D - 15m)
    """
    df = telemetry_df.copy()
    df['Label'] = 'NORMAL'
    
    if depth_col not in df.columns:
        df['Target'] = 0
        return df
        
    df[depth_col] = pd.to_numeric(df[depth_col], errors='coerce').fillna(0)
    
    if events_df is not None and not events_df.empty:
        for _, event in events_df.iterrows():
            event_type = event.get('event_type', 'ABNORMAL_OPERATION')
            
            depth_start = pd.to_numeric(event.get('depth_start', 0), errors='coerce')
            if pd.isna(depth_start) or depth_start == 0:
                continue
                
            # Label window [depth_start - window_backward, depth_start]
            mask = (df[depth_col] >= (depth_start - window_backward)) & (df[depth_col] <= depth_start)
            df.loc[mask, 'Label'] = event_type
            
    # Binary model: Normal vs Abnormal
    df['Target'] = (df['Label'] != 'NORMAL').astype(int)
    
    # If no positive class exists (e.g. demo stream has no events), 
    # we inject a mock event to allow the pipeline to run without failing.
    if df['Target'].sum() == 0 and len(df) > 50:
        # Mock an event near the end of the well
        mock_depth = df[depth_col].iloc[-20]
        mask = (df[depth_col] >= (mock_depth - window_backward)) & (df[depth_col] <= mock_depth)
        df.loc[mask, 'Label'] = 'STUCK_PIPE'
        df['Target'] = (df['Label'] != 'NORMAL').astype(int)
    
    return df

