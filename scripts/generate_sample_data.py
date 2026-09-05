import os
import csv
import uuid

RAW_BOREHOLE_PATH = r"D:\Downloads\dataset\BSEE Borehole.csv"
OUTPUT_WELLS = r"data\processed\sample_wells.csv"
OUTPUT_WELLBORES = r"data\processed\sample_wellbores.csv"

def generate_sample_data():
    os.makedirs(os.path.dirname(OUTPUT_WELLS), exist_ok=True)
    
    print("Generating sample prototype datasets using pure python...")
    
    with open(RAW_BOREHOLE_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        wells_out = []
        wellbores_out = []
        
        for i, row in enumerate(reader):
            if i >= 100: # Take 100 sample wells
                break
                
            well_id = str(uuid.uuid4())
            
            # Wells
            wells_out.append({
                'well_id': well_id,
                'source_well_id': row.get('API Well Number', ''),
                'api_number': row.get('API Well Number', ''),
                'well_name': row.get('Well Name', ''),
                'operator': row.get('Company Name', ''),
                'field': row.get('Bottom Area', '') + " " + row.get('Bottom Block', ''),
                'latitude': row.get('Surface Latitude*', ''),
                'longitude': row.get('Surface Longitude*', ''),
                'total_depth': row.get('BH Total MD (feet)', ''),
                'tvd': row.get('True Vertical Depth (feet)', ''),
                'spud_date': row.get('Spud Date', ''),
                'source': 'BSEE'
            })
            
            # Wellbores
            wellbores_out.append({
                'wellbore_id': str(uuid.uuid4()),
                'well_id': well_id,
                'source_wellbore_id': row.get('API Well Number', ''),
                'wellbore_name': row.get('Well Name', '') + " " + row.get('Well Name Suffix', ''),
                'status': row.get('Status Code', ''),
                'source': 'BSEE'
            })
            
    # Write wells
    if wells_out:
        with open(OUTPUT_WELLS, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=wells_out[0].keys())
            writer.writeheader()
            writer.writerows(wells_out)
            
    # Write wellbores
    if wellbores_out:
        with open(OUTPUT_WELLBORES, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=wellbores_out[0].keys())
            writer.writeheader()
            writer.writerows(wellbores_out)
            
    print(f"Generated {len(wells_out)} sample records in {OUTPUT_WELLS}")

if __name__ == "__main__":
    generate_sample_data()

