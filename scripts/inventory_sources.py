import os
import json

DATASET_ROOT = r"D:\Downloads\dataset"

def inventory():
    print(f"Scanning {DATASET_ROOT}...")
    inventory_data = {}
    
    for item in os.listdir(DATASET_ROOT):
        path = os.path.join(DATASET_ROOT, item)
        if os.path.isdir(path):
            count = sum(len(files) for _, _, files in os.walk(path))
            size = sum(os.path.getsize(os.path.join(r, f)) for r, _, files in os.walk(path) for f in files)
            inventory_data[item] = {"type": "directory", "files": count, "size_mb": round(size / (1024*1024), 2)}
        else:
            size = os.path.getsize(path)
            inventory_data[item] = {"type": "file", "size_mb": round(size / (1024*1024), 2)}
            
    print(json.dumps(inventory_data, indent=2))
    
if __name__ == "__main__":
    inventory()

