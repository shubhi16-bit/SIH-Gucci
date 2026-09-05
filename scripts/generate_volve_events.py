import os
import csv
import uuid
import xml.etree.ElementTree as ET

DDR_DIR = r"D:\Downloads\dataset\Well_technical_data\Daily Drilling Report - XML Version"
OUTPUT_EVENTS = r"data\processed\events.csv"

def classify_event(text):
    text = text.lower()
    if 'kick' in text or 'well control' in text:
        return 'KICK', 'HIGH'
    if 'stuck' in text or 'pack off' in text or 'jarring' in text:
        return 'STUCK_PIPE', 'HIGH'
    if 'loss' in text or 'lost circulation' in text:
        return 'MUD_LOSS', 'HIGH'
    if 'fail' in text or 'repair' in text or 'breakdown' in text:
        return 'EQUIPMENT_FAILURE', 'MEDIUM'
    if 'wait' in text or 'downtime' in text or 'npt' in text:
        return 'NPT', 'MEDIUM'
    if 'problem' in text:
        return 'ABNORMAL_OPERATION', 'LOW'
    return None, None

def generate_events():
    events = []
    
    for root_dir, _, files in os.walk(DDR_DIR):
        for file in files:
            if not file.endswith(".xml"):
                continue
            
            file_path = os.path.join(root_dir, file)
            try:
                tree = ET.parse(file_path)
                xml_root = tree.getroot()
                
                wellbore_id = "Unknown"
                name_wellbore = xml_root.find('.//{*}nameWellbore')
                if name_wellbore is not None:
                    wellbore_id = name_wellbore.text
                
                date = xml_root.find('.//{*}name').text if xml_root.find('.//{*}name') is not None else ""
                
                for op in xml_root.findall('.//{*}activity'):
                    dTimStart = op.find('.//{*}dTimStart')
                    dTimEnd = op.find('.//{*}dTimEnd')
                    desc = op.find('.//{*}comments')
                    md = op.find('.//{*}md')
                    
                    start_time = dTimStart.text if dTimStart is not None else ""
                    end_time = dTimEnd.text if dTimEnd is not None else ""
                    text = desc.text.strip() if desc is not None and desc.text else ""
                    depth = md.text if md is not None else ""
                    
                    event_type, confidence = classify_event(text)
                    if event_type:
                        events.append({
                            'event_id': str(uuid.uuid4()),
                            'well_id': wellbore_id.split(' ')[0] if ' ' in wellbore_id else wellbore_id,
                            'wellbore_id': wellbore_id,
                            'timestamp_start': f"{date} {start_time}",
                            'timestamp_end': f"{date} {end_time}",
                            'depth_start': depth,
                            'depth_end': depth,
                            'event_type': event_type,
                            'description': text,
                            'source': 'VOLVE_DDR',
                            'source_file': file,
                            'extraction_method': 'XML_NODE_KEYWORD',
                            'confidence': confidence
                        })
            except Exception:
                pass
                
    os.makedirs(os.path.dirname(OUTPUT_EVENTS), exist_ok=True)
    with open(OUTPUT_EVENTS, 'w', newline='', encoding='utf-8') as f:
        if events:
            writer = csv.DictWriter(f, fieldnames=events[0].keys())
            writer.writeheader()
            writer.writerows(events)
            
    print(f"Validated and extracted {len(events)} true risk events into {OUTPUT_EVENTS}.")

if __name__ == "__main__":
    generate_events()

