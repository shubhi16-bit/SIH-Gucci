import os
import xml.etree.ElementTree as ET
import csv
import json

WITSML_DIR = r"D:\Downloads\dataset\Well_Realtime"
OUTPUT_DIR = r"data\processed\volve_realtime_demo"

TARGET_CURVES = {
    'TIME': ['TIME', 'time'],
    'DEPTH': ['DMEA', 'DEPT', 'DEPTH', 'md'],
    'ROP': ['ROP', 'ROP5', 'rop'],
    'WOB': ['SWOB', 'WOB', 'wob'],
    'RPM': ['RPM', 'TRPM_RT', 'rpm'],
    'TORQUE': ['TQA', 'STOR', 'torque'],
    'PRESSURE': ['SPPA', 'pressure'],
    'HOOKLOAD': ['HKLD', 'hookload'],
    'FLOW': ['TFLO', 'flow']
}

def identify_curve_mapping(mnemonics):
    mapping = {}
    missing = list(TARGET_CURVES.keys())
    for idx, m in enumerate(mnemonics):
        m_upper = m.upper()
        for target, aliases in TARGET_CURVES.items():
            if target in missing and any(a.upper() == m_upper or a.upper() in m_upper for a in aliases):
                mapping[target] = idx
                missing.remove(target)
                break
    return mapping, missing

def extract_witsml_cohort():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    wellbore_logs = {}
    
    for root_dir, _, files in os.walk(WITSML_DIR):
        for file in files:
            if not file.endswith(".xml"):
                continue
            
            file_path = os.path.join(root_dir, file)
            try:
                tree = ET.parse(file_path)
                xml_root = tree.getroot()
                log = xml_root.find('.//{*}log')
                if log is None: continue
                
                well_id_node = log.find('.//{*}nameWell')
                wellbore_id_node = log.find('.//{*}nameWellbore')
                
                if well_id_node is None or wellbore_id_node is None: continue
                    
                well_id = well_id_node.text
                wellbore_id = wellbore_id_node.text
                log_name = log.find('.//{*}name').text
                
                log_data = log.find('.//{*}logData')
                if log_data is None: continue
                    
                mnemonics_elem = log_data.find('.//{*}mnemonicList')
                if mnemonics_elem is None or not mnemonics_elem.text: continue
                    
                mnemonics = mnemonics_elem.text.split(',')
                
                mapping, missing = identify_curve_mapping(mnemonics)
                
                if 'TIME' not in mapping and 'DEPTH' not in mapping: continue
                if 'ROP' not in mapping and 'WOB' not in mapping and 'RPM' not in mapping: continue
                    
                if wellbore_id not in wellbore_logs:
                    wellbore_logs[wellbore_id] = []
                    
                wellbore_logs[wellbore_id].append({
                    'path': file_path,
                    'mapping': mapping,
                    'missing': missing,
                    'log_name': log_name,
                    'well_id': well_id
                })
                    
            except Exception as e:
                pass
                
    manifest = []
    total_size = 0
    
    for wellbore_id, log_files in wellbore_logs.items():
        best_rows = None
        best_mapping = None
        best_missing = None
        best_log_name = None
        best_file_path = None
        best_delta = -1
        
        for file_info in log_files:
            file_path = file_info['path']
            mapping = file_info['mapping']
            missing = file_info['missing']
            log_name = file_info['log_name']
            well_id = file_info['well_id']
            
            try:
                tree = ET.parse(file_path)
                log_data = tree.getroot().find('.//{*}logData')
                if log_data is None: continue
                
                headers = list(TARGET_CURVES.keys())
                all_rows = []
                for data_node in log_data.findall('.//{*}data'):
                    if not data_node.text: continue
                    values = data_node.text.split(',')
                    row_out = []
                    for h in headers:
                        if h in mapping:
                            row_out.append(values[mapping[h]])
                        else:
                            row_out.append("")
                    all_rows.append(row_out)
                    
                if 'DEPTH' in mapping:
                    depth_idx = headers.index('DEPTH')
                    for i in range(len(all_rows) - 1000):
                        start_d = all_rows[i][depth_idx]
                        end_d = all_rows[i+999][depth_idx]
                        try:
                            delta = float(end_d) - float(start_d)
                            # Reject negative depths (calibration sweeps)
                            if float(start_d) < 0:
                                continue
                            # Reject impossibly fast drilling (e.g. > 150 m/hr). 1000 samples is usually a few hours.
                            # We just avoid delta > 500m per 1000 samples to be safe.
                            if delta > 300:
                                continue
                                
                            if delta > best_delta:
                                best_delta = delta
                                best_rows = all_rows[i : i + 1000]
                                best_mapping = mapping
                                best_missing = missing
                                best_log_name = log_name
                                best_file_path = file_path
                        except:
                            pass
                
                if not best_rows and len(all_rows) >= 1000:
                    best_rows = all_rows[:1000]
                    best_mapping = mapping
                    best_missing = missing
                    best_log_name = log_name
                    best_file_path = file_path
                    best_delta = 0
            except:
                pass
                
        if best_rows:
            out_filename = wellbore_id.replace('/', '_').replace(' ', '_').replace('-', '_') + ".csv"
            out_filepath = os.path.join(OUTPUT_DIR, out_filename)
            headers = list(TARGET_CURVES.keys())
            
            with open(out_filepath, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(headers)
                writer.writerows(best_rows)
                
            total_size += os.path.getsize(out_filepath)
                
            start_time = best_rows[0][headers.index('TIME')] if 'TIME' in best_mapping and best_rows[0][headers.index('TIME')] else ""
            end_time = best_rows[-1][headers.index('TIME')] if 'TIME' in best_mapping and best_rows[-1][headers.index('TIME')] else ""
            start_depth = best_rows[0][headers.index('DEPTH')] if 'DEPTH' in best_mapping and best_rows[0][headers.index('DEPTH')] else ""
            end_depth = best_rows[-1][headers.index('DEPTH')] if 'DEPTH' in best_mapping and best_rows[-1][headers.index('DEPTH')] else ""
            
            manifest.append({
                "well_name": well_id,
                "wellbore_id": wellbore_id,
                "witsml_log_name": best_log_name,
                "source_file": best_file_path,
                "samples": len(best_rows),
                "start_time": start_time,
                "end_time": end_time,
                "start_depth": start_depth,
                "end_depth": end_depth,
                "depth_drilled_in_window": best_delta,
                "available_curves": [k for k in TARGET_CURVES.keys() if k in best_mapping],
                "missing_curves": best_missing,
                "file_path": out_filepath
            })
            print(f"Processed well: {wellbore_id} -> {len(best_rows)} samples, depth delta: {best_delta:.2f}m")
            
    manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
        
    print(f"\nManifest created with {len(manifest)} wells at {manifest_path}")
    print(f"Total storage used: {total_size / 1024:.2f} KB")

if __name__ == "__main__":
    extract_witsml_cohort()

