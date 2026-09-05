import os
import xml.etree.ElementTree as ET
import csv

WITSML_DIR = r"D:\Downloads\dataset\Well_Realtime\1\log"
DEMO_WITSML_DIR = r"data\processed\demo_active_well"

def analyze_witsml():
    print("--- Analyzing WITSML for Active Well Replay ---")
    
    os.makedirs(DEMO_WITSML_DIR, exist_ok=True)
    demo_file_path = os.path.join(DEMO_WITSML_DIR, "demo_stream.csv")
    
    found_log = False
    for root_dir, _, files in os.walk(WITSML_DIR):
        for file in files:
            if not file.endswith(".xml"):
                continue
            file_path = os.path.join(root_dir, file)
            try:
                tree = ET.parse(file_path)
                xml_root = tree.getroot()
                log = xml_root.find('.//{*}log')
                if log is None:
                    continue
                
                well_id = log.find('.//{*}nameWell').text
                wellbore_id = log.find('.//{*}nameWellbore').text
                log_name = log.find('.//{*}name').text
                
                # Extract curves
                log_data = log.find('.//{*}logData')
                if log_data is None:
                    continue
                
                mnemonics_elem = log_data.find('.//{*}mnemonicList')
                units_elem = log_data.find('.//{*}unitList')
                
                if mnemonics_elem is None or not mnemonics_elem.text:
                    continue
                    
                mnemonics = mnemonics_elem.text.split(',')
                units = units_elem.text.split(',') if units_elem is not None and units_elem.text else []
                
                # Require actual drilling parameters
                if 'WOB' not in mnemonics and 'ROP' not in mnemonics and 'RPM' not in mnemonics and 'DEPT' not in mnemonics and 'HKLD' not in mnemonics and 'STOR' not in mnemonics:
                    continue
                    
                print(f"Well: {well_id}, Wellbore: {wellbore_id}, Log: {log_name}")
                print("Curves available:")
                for idx, m in enumerate(mnemonics):
                    u = units[idx] if idx < len(units) else ""
                    print(f" - {m} ({u})")
                    
                # Save a sample stream
                with open(demo_file_path, 'w', newline='') as f:
                    writer = csv.writer(f)
                    writer.writerow(mnemonics)
                    
                    count = 0
                    for data_node in log_data.findall('.//{*}data'):
                        if data_node.text:
                            values = data_node.text.split(',')
                            writer.writerow(values)
                            count += 1
                        if count >= 1000:
                            break
                
                print(f"Created demo active well replay stream at: {demo_file_path} with {count} samples.")
                if count > 50:
                    found_log = True
                    break
            except Exception as e:
                pass
        if found_log:
            break
            
if __name__ == "__main__":
    analyze_witsml()
