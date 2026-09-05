import csv
import re
import os
import xml.etree.ElementTree as ET

DATA_DIR = r"D:\Downloads\dataset"
OUTPUT_DIR = r"data\processed"
EVENTS_CSV = os.path.join(OUTPUT_DIR, "events.csv")
DEMO_WITSML_DIR = os.path.join(OUTPUT_DIR, "demo_active_well")

# Keywords for rule-based event extraction
EVENT_KEYWORDS = {
    'MUD_LOSS': ['mud loss', 'lost circulation', 'loss of returns'],
    'KICK': ['kick', 'well control', 'influx', 'flow check'],
    'STUCK_PIPE': ['stuck pipe', 'stuck', 'jarring', 'cannot free', 'pack off'],
    'TORQUE_SPIKE': ['high torque', 'torque spike', 'erratic torque'],
    'OVERPRESSURE': ['overpressure', 'high pressure'],
    'EQUIPMENT_FAILURE': ['equipment failure', 'broke down', 'failed', 'repair'],
    'NPT': ['npt', 'downtime', 'waiting on']
}

def analyze_bsee_war():
    print("--- Analyzing BSEE WAR Remarks ---")
    war_path = os.path.join(DATA_DIR, "mv_war_main_prop_remark.txt")
    
    extracted_events = []
    
    # We will just sample the first 5000 lines
    try:
        with open(war_path, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f)
            headers = next(reader)
            
            lines_read = 0
            for row in reader:
                if not row or len(row) < 2:
                    continue
                
                sn_war = row[0]
                remark = row[1].lower()
                
                # Rule-based extraction
                for event_type, keywords in EVENT_KEYWORDS.items():
                    for kw in keywords:
                        if kw in remark:
                            extracted_events.append({
                                'event_id': f"BSEE-WAR-{sn_war}-{event_type}",
                                'well_id': sn_war, # Needs mapping via mv_war_main.txt to get API_WELL_NUMBER
                                'wellbore_id': sn_war,
                                'timestamp_start': '', 
                                'timestamp_end': '',
                                'depth_start': '',
                                'depth_end': '',
                                'formation': '',
                                'event_type': event_type,
                                'severity': 'UNKNOWN',
                                'description': row[1].strip()[:200] + '...', # Truncate for display
                                'source': 'BSEE_WAR',
                                'source_file': 'mv_war_main_prop_remark.txt',
                                'extraction_method': f'RULE_MATCH_{kw}',
                                'confidence': '0.8'
                            })
                            break # Found one event of this type
                
                lines_read += 1
                if lines_read > 5000:
                    break
    except Exception as e:
        print(f"Error reading WAR: {e}")
        
    print(f"Sampled 5000 WAR lines. Extracted {len(extracted_events)} keyword-matched events.")
    # Show first 3 events
    for e in extracted_events[:3]:
        print(f" - [{e['event_type']}] {e['description']} (Key: {e['well_id']})")
        
    return extracted_events

if __name__ == "__main__":
    analyze_bsee_war()

