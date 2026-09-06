import os
import glob
import re
import csv

BASE_DIR = r'D:\Downloads\dataset\Well_technical_data\WellWellbore'
EVENTS_CSV = r'data\processed\events.csv'
NPD_CSV = r'D:\Downloads\dataset\wellbore_exploration_all.csv'
OUT_CSV = r'data\processed\volve_well_metadata.csv'

# 1. Load the 26 event wells
event_wells = set()
with open(EVENTS_CSV, 'r', encoding='utf-8-sig') as f:
    for row in csv.DictReader(f):
        wbid = row['wellbore_id'].replace('NO ', '').strip()
        event_wells.add(wbid)

print(f"Total event wells to match: {len(event_wells)}")

# 2. Find ACTUAL trajectory files
actual_files = glob.glob(os.path.join(BASE_DIR, '**/*ACTUAL*'), recursive=True)
actual_txt = [f for f in actual_files if not f.endswith('.pdf')]

metadata = {}

def dms_to_dd(dms_str):
    # e.g., 58° 26' 29.7195 N -> 58.44158875
    # Be careful with strange characters for degree symbol
    match = re.search(r'(\d+)\D+(\d+)\D+([\d\.]+)\s*([NSEW])', dms_str)
    if not match:
        return None
    d, m, s, dir = match.groups()
    dd = float(d) + float(m)/60 + float(s)/3600
    if dir in ['S', 'W']:
        dd = -dd
    return dd

for fpath in actual_txt:
    try:
        with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading {fpath}: {e}")
        continue
    
    # Extract wellbore name from path
    # e.g., 15_9-F-1\15_9-F-1 A\... -> "15/9-F-1 A"
    parts = fpath.split(os.sep)
    wb_folder = parts[-2].replace('_', '/')
    wb_name = wb_folder.strip()
    
    lat = None
    lon = None
    td = None
    tvd = None
    max_incl = 0.0
    
    in_survey_list = False
    
    for line in lines:
        line = line.strip()
        if 'Surface Latitude:' in line:
            lat_str = line.split('Surface Latitude:')[1].strip()
            lat = dms_to_dd(lat_str)
        elif 'Surface Longitude:' in line:
            lon_str = line.split('Surface Longitude:')[1].strip()
            lon = dms_to_dd(lon_str)
        elif 'Bottom Hole MD:' in line:
            try:
                td = float(re.sub(r'[^\d\.]', '', line.split(':')[1]))
            except: pass
        elif 'Bottom Hole TVD:' in line:
            try:
                tvd = float(re.sub(r'[^\d\.]', '', line.split(':')[1]))
            except: pass
        elif 'SURVEY LIST' in line:
            in_survey_list = True
        elif in_survey_list:
            # Parse MD, Inc, Azim, ...
            # lines look like: 184.12    0.10      233.25    184.12
            tokens = line.split()
            if len(tokens) >= 4:
                try:
                    inc = float(tokens[1])
                    if inc > max_incl:
                        max_incl = inc
                except:
                    pass
    
    if wb_name:
        metadata[wb_name] = {
            'wellbore_name': wb_name,
            'latitude': lat,
            'longitude': lon,
            'total_depth': td,
            'tvd': tvd,
            'max_inclination': max_incl if max_incl > 0 else None,
            'formation_td': '',
            'formation_hc': '',
            'field': 'VOLVE',
            'well_type': 'DEVELOPMENT' if '-F-' in wb_name else 'EXPLORATION',
            'lat_source': 'TRAJECTORY',
            'td_source': 'TRAJECTORY',
            'tvd_source': 'TRAJECTORY',
            'incl_source': 'TRAJECTORY',
            'formation_source': 'MISSING'
        }

# Add any exploration wells from NPD just in case we miss them
with open(NPD_CSV, 'r', encoding='utf-8-sig') as f:
    for row in csv.DictReader(f):
        if row.get('wlbField','').upper() != 'VOLVE':
            continue
        wbid = row['wlbWellboreName'].replace('NO ', '').strip()
        if wbid in metadata:
            metadata[wbid]['formation_td'] = row.get('wlbFormationAtTd', '')
            metadata[wbid]['formation_hc'] = row.get('wlbFormationWithHc1', '')
            metadata[wbid]['formation_source'] = 'NPD'
            # if trajectory missed lat/lon, use NPD
            if not metadata[wbid]['latitude']:
                try:
                    metadata[wbid]['latitude'] = float(row['wlbNsDecDeg'])
                    metadata[wbid]['longitude'] = float(row['wlbEwDecDeg'])
                    metadata[wbid]['lat_source'] = 'NPD'
                except: pass
        else:
            try:
                lat = float(row['wlbNsDecDeg'])
                lon = float(row['wlbEwDecDeg'])
                td = float(row['wlbTotalDepth'])
                tvd = float(row['wlbFinalVerticalDepth'])
                incl = float(row['wlbMaxInclation'])
            except:
                continue
                
            metadata[wbid] = {
                'wellbore_name': wbid,
                'latitude': lat,
                'longitude': lon,
                'total_depth': td,
                'tvd': tvd,
                'max_inclination': incl,
                'formation_td': row.get('wlbFormationAtTd', ''),
                'formation_hc': row.get('wlbFormationWithHc1', ''),
                'field': 'VOLVE',
                'well_type': row.get('wlbWellType', ''),
                'lat_source': 'NPD',
                'td_source': 'NPD',
                'tvd_source': 'NPD',
                'incl_source': 'NPD',
                'formation_source': 'NPD'
            }

# Add events counts and fallback to parent for missing wells (e.g. ST2, A, B)
for wbid in event_wells:
    if wbid not in metadata:
        # Try to find parent in metadata
        parent1 = re.sub(r'\s+[A-Z0-9]+$', '', wbid).strip()  # 15/9-19 ST2 -> 15/9-19
        parent2 = re.sub(r'[A-Z0-9]+$', '', wbid).strip()     # 15/9-19ST2 -> 15/9-19
        parent = None
        if parent1 in metadata: parent = parent1
        elif parent2 in metadata: parent = parent2
        elif wbid == '15/9-19 ST2' and '15/9-19 S' in metadata:
            parent = '15/9-19 S'
        elif wbid == '15/9-19 BT2' and '15/9-19 B' in metadata:
            parent = '15/9-19 B'
        
        if parent:
            print(f"Well {wbid} missing, falling back to parent {parent}")
            metadata[wbid] = dict(metadata[parent])
            metadata[wbid]['wellbore_name'] = wbid
            metadata[wbid]['lat_source'] = metadata[parent]['lat_source'] + '_PARENT'
            metadata[wbid]['td_source'] = metadata[parent]['td_source'] + '_PARENT'
            metadata[wbid]['tvd_source'] = metadata[parent]['tvd_source'] + '_PARENT'
            metadata[wbid]['incl_source'] = metadata[parent]['incl_source'] + '_PARENT'
            metadata[wbid]['formation_source'] = metadata[parent]['formation_source'] + '_PARENT'
        else:
            print(f"WARNING: Event well {wbid} not found in metadata and no parent found!")
            metadata[wbid] = {
                'wellbore_name': wbid,
                'latitude': None, 'longitude': None, 'total_depth': None, 'tvd': None, 'max_inclination': None,
                'formation_td': '', 'formation_hc': '', 'field': 'VOLVE', 'well_type': '',
                'lat_source': 'MISSING', 'td_source': 'MISSING', 'tvd_source': 'MISSING', 'incl_source': 'MISSING', 'formation_source': 'MISSING'
            }

rows = []
for wbid in sorted(metadata.keys()):
    if wbid not in event_wells and '-F-' not in wbid and '15/9-19' not in wbid:
        continue # filter out non-Volve just in case
    rows.append(metadata[wbid])

fieldnames = ['wellbore_name','latitude','longitude',
              'total_depth','tvd','max_inclination','formation_td','formation_hc',
              'field','well_type','lat_source','td_source','tvd_source','incl_source','formation_source']

with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    w.writerows(rows)

print(f"\nSuccessfully wrote {len(rows)} wells to {OUT_CSV}")

# Summary for event wells
has_lat = sum(1 for r in rows if r['latitude'] and r['wellbore_name'] in event_wells)
has_td = sum(1 for r in rows if r['total_depth'] and r['wellbore_name'] in event_wells)
has_tvd = sum(1 for r in rows if r['tvd'] and r['wellbore_name'] in event_wells)
has_incl = sum(1 for r in rows if r['max_inclination'] and r['wellbore_name'] in event_wells)

total_event = len(event_wells)
print(f"\nCoverage of {total_event} EVENT WELLS:")
print(f"  Coordinates: {has_lat}/{total_event}")
print(f"  Total Depth: {has_td}/{total_event}")
print(f"  TVD:         {has_tvd}/{total_event}")
print(f"  Max Incl:    {has_incl}/{total_event}")
