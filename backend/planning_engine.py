import csv
import math
import uuid
import os

# Haversine distance in meters
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def point_in_polygon(x, y, poly):
    n = len(poly)
    inside = False
    p1x, p1y = poly[0]
    for i in range(n+1):
        p2x, p2y = poly[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xints = (y-p1y)*(p2x-p1x)/(p2y-p1y)+p1x
                    if p1x == p2x or x <= xints:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

class PlanningEngine:
    def __init__(self, metadata_path):
        self.metadata_path = metadata_path
        self.existing_wells = self._load_wells()
        
    def _load_wells(self):
        wells = []
        try:
            with open(self.metadata_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    name = row.get('wlbWellboreName', '')
                    if '15/9' in name:
                        lat = row.get('wlbNsDecDeg')
                        lon = row.get('wlbEwDecDeg')
                        if lat and lon:
                            wells.append({
                                'name': name,
                                'lat': float(lat),
                                'lon': float(lon),
                                'td': float(row.get('wlbFinalVerticalDepth', 0) or 0)
                            })
        except Exception as e:
            print("Error loading existing wells:", e)
        return wells

    def generate_candidates(self, request):
        poly = request.get('area', {}).get('coordinates', [])[0] # [[lon, lat], ...]
        if not poly:
            return []
            
        # Bounding box
        min_lon = min(p[0] for p in poly)
        max_lon = max(p[0] for p in poly)
        min_lat = min(p[1] for p in poly)
        max_lat = max(p[1] for p in poly)
        
        # Grid spacing ~500m (approx 0.005 deg for simplicity)
        spacing = 0.005
        
        candidates = []
        lon = min_lon
        while lon <= max_lon:
            lat = min_lat
            while lat <= max_lat:
                if point_in_polygon(lon, lat, poly):
                    candidates.append({
                        'candidate_id': f"CAND-{str(uuid.uuid4())[:8]}",
                        'lat': lat,
                        'lon': lon,
                        'target_depth': request.get('target_depth', 2500)
                    })
                lat += spacing
            lon += spacing
            
        return candidates

    def apply_constraints(self, candidates, constraints):
        min_spacing = constraints.get('minimum_well_spacing', 500) # meters
        feasible = []
        rejected = []
        
        for c in candidates:
            reject_reasons = []
            
            # 1. Spacing constraint
            closest_dist = float('inf')
            closest_well = None
            for w in self.existing_wells:
                dist = haversine(c['lat'], c['lon'], w['lat'], w['lon'])
                if dist < closest_dist:
                    closest_dist = dist
                    closest_well = w['name']
            
            c['closest_well'] = closest_well
            c['closest_dist'] = closest_dist
            
            if closest_dist < min_spacing:
                reject_reasons.append(f"Too close to existing well {closest_well} ({int(closest_dist)}m < {min_spacing}m)")
                
            if reject_reasons:
                c['status'] = 'rejected'
                c['reasons'] = reject_reasons
                rejected.append(c)
            else:
                c['status'] = 'feasible'
                feasible.append(c)
                
        return feasible, rejected

    def score_candidates(self, candidates, request):
        scored = []
        for c in candidates:
            # Fake/simplified features for the prototype
            dist = c['closest_dist']
            
            # Score components (0-100)
            spacing_score = min(100, (dist / 2000) * 100) # optimal around 2km+
            target_score = 90 # Constant for now since depth matches
            trajectory_score = 85 # Assuming vertical well for simplistic exploration prototype
            historical_risk_score = 75 # Proxy for nearby event density (dummy calculation)
            
            # Weights
            w_spacing = 0.3
            w_target = 0.3
            w_traj = 0.2
            w_risk = 0.2
            
            overall = (spacing_score * w_spacing + 
                       target_score * w_target + 
                       trajectory_score * w_traj + 
                       historical_risk_score * w_risk)
            
            c['scores'] = {
                'overall': round(overall, 1),
                'spacing': round(spacing_score, 1),
                'target': round(target_score, 1),
                'trajectory': round(trajectory_score, 1),
                'historical_risk': round(historical_risk_score, 1)
            }
            
            c['positive_factors'] = [
                f"Excellent distance from existing wells ({int(dist)}m)" if spacing_score > 80 else "Adequate spacing",
                "Simple vertical trajectory estimated"
            ]
            c['negative_factors'] = [
                "Proximity limits expansion" if spacing_score < 50 else None
            ]
            c['negative_factors'] = [x for x in c['negative_factors'] if x]
            
            # Simple estimated trajectory
            c['trajectory_estimate'] = [
                {'md': 0, 'tvd': 0, 'inclination': 0, 'azimuth': 0, 'lat': c['lat'], 'lon': c['lon']},
                {'md': c['target_depth'], 'tvd': c['target_depth'], 'inclination': 0, 'azimuth': 0, 'lat': c['lat'], 'lon': c['lon']}
            ]
            
            scored.append(c)
            
        # Rank
        scored.sort(key=lambda x: x['scores']['overall'], reverse=True)
        return scored

