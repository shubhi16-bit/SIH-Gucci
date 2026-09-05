import os
import pandas as pd
import xml.etree.ElementTree as ET
import uuid

# Configuration
DDR_DIR = r"D:\Downloads\dataset\Well_technical_data\Daily Drilling Report - XML Version"
OUTPUT_REPORTS = r"data\processed\reports.parquet"
OUTPUT_EVENTS = r"data\processed\events.parquet"

def parse_ddr_subset(limit_files=200):
    print(f"Scanning DDR directory: {DDR_DIR}")
    
    reports = []
    events = []
    files_processed = 0
    
    for root, dirs, files in os.walk(DDR_DIR):
        for file in files:
            if not file.endswith(".xml"):
                continue
                
            file_path = os.path.join(root, file)
            
            try:
                tree = ET.parse(file_path)
                xml_root = tree.getroot()
                
                # Basic DDR info (Statoil/Volve format)
                well_id = xml_root.attrib.get('wellbore', 'Unknown')
                date = xml_root.attrib.get('date', 'Unknown')
                
                report_id = str(uuid.uuid4())
                
                # Extract text or operations
                operations = xml_root.findall('.//operation')
                for op in operations:
                    start_time = op.attrib.get('startTime')
                    end_time = op.attrib.get('endTime')
                    description = op.find('description').text if op.find('description') is not None else ""
                    
                    if description:
                        events.append({
                            'event_id': str(uuid.uuid4()),
                            'well_id': well_id,
                            'wellbore_id': well_id,
                            'timestamp_start': f"{date} {start_time}",
                            'timestamp_end': f"{date} {end_time}",
                            'depth_start': None,
                            'depth_end': None,
                            'formation': None,
                            'event_type': 'OPERATION', # To be mapped by NLP taxonomy
                            'severity': 'INFO',
                            'description': description.strip(),
                            'source': 'VOLVE_DDR',
                            'source_file': file_path,
                            'extraction_method': 'XML_NODE',
                            'confidence': 1.0
                        })
                
                reports.append({
                    'report_id': report_id,
                    'well_id': well_id,
                    'wellbore_id': well_id,
                    'report_type': 'DDR',
                    'report_date': date,
                    'source_file': file_path,
                    'text': 'XML Extraction'
                })
                
                files_processed += 1
                if files_processed >= limit_files:
                    break
                    
            except Exception as e:
                pass # Skip malformed XML
                
        if files_processed >= limit_files:
            break

    df_reports = pd.DataFrame(reports)
    df_events = pd.DataFrame(events)
    
    os.makedirs(os.path.dirname(OUTPUT_REPORTS), exist_ok=True)
    
    if not df_reports.empty:
        df_reports.to_parquet(OUTPUT_REPORTS, index=False)
        print(f"Extracted {len(df_reports)} reports.")
    if not df_events.empty:
        df_events.to_parquet(OUTPUT_EVENTS, index=False)
        print(f"Extracted {len(df_events)} events.")
        
if __name__ == "__main__":
    parse_ddr_subset()

