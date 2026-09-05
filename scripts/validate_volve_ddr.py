import os
import xml.etree.ElementTree as ET

DDR_DIR = r"D:\Downloads\dataset\Well_technical_data\Daily Drilling Report - XML Version"

def analyze_volve_ddr():
    print("--- Analyzing Volve DDR XML ---")
    files_checked = 0
    extracted_events = []
    
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
                
                date = "Unknown"
                name_report = xml_root.find('.//{*}name')
                if name_report is not None:
                    date = name_report.text
                
                # In WITSML, operations are typically under <activity>
                for op in xml_root.findall('.//{*}activity'):
                    dTimStart = op.find('.//{*}dTimStart')
                    dTimEnd = op.find('.//{*}dTimEnd')
                    desc = op.find('.//{*}comments')
                    md = op.find('.//{*}md')
                    
                    start_time = dTimStart.text if dTimStart is not None else ""
                    end_time = dTimEnd.text if dTimEnd is not None else ""
                    text = desc.text.strip() if desc is not None and desc.text else ""
                    depth = md.text if md is not None else ""
                    
                    if text:
                        extracted_events.append({
                            'wellbore_id': wellbore_id,
                            'date': date,
                            'time': f"{start_time} - {end_time}",
                            'depth': depth,
                            'description': text[:150] + '...' if len(text)>150 else text,
                            'file': file
                        })
                            
                files_checked += 1
                if files_checked >= 50:
                    break
            except Exception as e:
                pass
        if files_checked >= 50:
            break
            
    print(f"Scanned 50 Volve DDR files. Found {len(extracted_events)} operations.")
    for e in extracted_events[:5]:
        print(f" - [{e['wellbore_id']}] {e['date']} | Depth {e['depth']} | {e['description']}")

if __name__ == "__main__":
    analyze_volve_ddr()

