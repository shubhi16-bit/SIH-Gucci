import os
import pandas as pd
import xml.etree.ElementTree as ET
import uuid

# Configuration
WITSML_DIR = r"D:\Downloads\dataset\Well_Realtime"
OUTPUT_PARAMS = r"data\processed\drilling_parameters.parquet"

def parse_witsml_subset(limit_files=50):
    print(f"Scanning WITSML directory: {WITSML_DIR}")
    
    records = []
    files_processed = 0
    
    for root, dirs, files in os.walk(WITSML_DIR):
        for file in files:
            if file == "MetaFileInfo.txt" or not file.endswith(".xml"):
                # Based on inspection, some WITSML files don't have .xml extensions
                # Let's try parsing files that are just numbers e.g. "1", "2" if they are valid XML
                pass 
                
            file_path = os.path.join(root, file)
            
            # Simple heuristic: try to parse as XML
            try:
                tree = ET.parse(file_path)
                xml_root = tree.getroot()
                
                # Check if it is a log file (namespaces removed for simplicity)
                log = xml_root.find('.//{*}log')
                if log is None:
                    continue
                
                well_id = log.find('.//{*}nameWell').text if log.find('.//{*}nameWell') is not None else "Unknown"
                wellbore_id = log.find('.//{*}nameWellbore').text if log.find('.//{*}nameWellbore') is not None else "Unknown"
                
                # Extract curves
                log_data = log.find('.//{*}logData')
                if log_data is None:
                    continue
                
                mnemonics = log_data.find('.//{*}mnemonicList').text.split(',') if log_data.find('.//{*}mnemonicList') is not None else []
                units = log_data.find('.//{*}unitList').text.split(',') if log_data.find('.//{*}unitList') is not None else []
                
                for data_node in log_data.findall('.//{*}data'):
                    values = data_node.text.split(',')
                    depth_or_time = values[0]
                    
                    for i in range(1, len(values)):
                        if values[i] and values[i] != '':
                            records.append({
                                'wellbore_id': wellbore_id,
                                'timestamp': depth_or_time, # Simplify for prototype
                                'measured_depth': depth_or_time, # Assuming depth index
                                'true_vertical_depth': None,
                                'parameter_name': mnemonics[i],
                                'value': float(values[i]),
                                'unit': units[i] if i < len(units) else "",
                                'raw_mnemonic': mnemonics[i],
                                'source': 'WITSML',
                                'source_file': file_path
                            })
                            
                files_processed += 1
                if files_processed >= limit_files:
                    break
            except Exception as e:
                pass # Skip non-XML or malformed files
                
        if files_processed >= limit_files:
            break
            
    df = pd.DataFrame(records)
    if not df.empty:
        os.makedirs(os.path.dirname(OUTPUT_PARAMS), exist_ok=True)
        df.to_parquet(OUTPUT_PARAMS, index=False)
        print(f"Extracted {len(df)} drilling parameters from {files_processed} files.")
        print(f"Saved to {OUTPUT_PARAMS}")
    else:
        print("No valid WITSML data found in subset.")

if __name__ == "__main__":
    parse_witsml_subset()

