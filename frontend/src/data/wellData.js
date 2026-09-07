export const FORMATIONS = ["Barail", "Tipam", "Langpar", "Girujan", "Kopili", "Disang"];

const STATUS_POOL = [
  "completed",
  "completed",
  "completed",
  "drilling",
  "drilling",
  "planning",
  "planning",
  "suspended",
];

const FIELDS = [
  { prefix: "NH", name: "Nahorkatia", lat: 27.2906, lng: 95.3336, count: 10 },
  { prefix: "DJ", name: "Duliajan", lat: 27.333, lng: 95.32, count: 9 },
  { prefix: "LG", name: "Lakwa", lat: 27.2651, lng: 95.3107, count: 7 },
  { prefix: "MN", name: "Moran", lat: 27.3122, lng: 95.3031, count: 6 },
  { prefix: "DK", name: "Dikom", lat: 27.2419, lng: 95.3792, count: 4 },
  { prefix: "HG", name: "Hapjan", lat: 27.2783, lng: 95.2728, count: 4 },
];

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260419);

function buildWells() {
  const wells = [];
  for (const f of FIELDS) {
    for (let i = 0; i < f.count; i++) {
      const status = STATUS_POOL[Math.floor(rng() * STATUS_POOL.length)];
      const stuckPipeRisk = Math.round(8 + rng() * 78);
      const mudLossRisk = Math.round(12 + rng() * 72);
      const risk = stuckPipeRisk > 60 ? "high" : stuckPipeRisk > 38 ? "medium" : "low";
      const id = `${f.prefix}-${String(i + 1).padStart(3, "0")}`;
      wells.push({
        id,
        name: `${f.name} ${f.prefix}-${String(i + 1).padStart(3, "0")}`,
        status,
        lat: Number((f.lat + (rng() - 0.5) * 0.055).toFixed(4)),
        lng: Number((f.lng + (rng() - 0.5) * 0.055).toFixed(4)),
        depth: Math.round(2600 + rng() * 2800),
        formation: FORMATIONS[Math.floor(rng() * FORMATIONS.length)],
        risk,
        stuckPipeRisk,
        mudLossRisk,
      });
    }
  }
  wells[3] = {
    ...wells[3],
    name: "Nahorkatia NH-004",
    risk: "high",
    stuckPipeRisk: 76,
    mudLossRisk: 58,
  };
  return wells;
}

export const nearbyWells = buildWells();

export const candidateLocations = [
  {
    id: "CL-1",
    name: "Candidate Alpha",
    lat: 27.2851,
    lng: 95.3211,
    distanceKm: 1.4,
    description:
      "Optimum structural high. Offset data shows minimal stuck pipe risk in the Tipam formation here. Highly recommended for standard vertical drilling.",
  },
  {
    id: "CL-2",
    name: "Candidate Beta",
    lat: 27.3014,
    lng: 95.2986,
    distanceKm: 2.8,
    description:
      "Secondary structural flank. Proximity to historical mud loss zones requires heavier casing design, but it taps a significantly larger untapped reservoir.",
  },
  {
    id: "CL-3",
    name: "Candidate Gamma",
    lat: 27.2588,
    lng: 95.2902,
    distanceKm: 3.9,
    description:
      "Deep Barail target. High expected pressure (kick risk) based on offset well NH-004. Requires managed pressure drilling but offers massive yield potential.",
  },
];

export const statusColors = {
  drilling: "#3b82f6",
  planning: "#a855f7",
  completed: "#22c55e",
  suspended: "#d1a937",
};

export const riskColors = {
  low: "#22c55e",
  medium: "#d1a937",
  high: "#ef4444",
};

const toRad = (deg) => (deg * Math.PI) / 180;

export function haversineKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function nearestWell(lat, lng) {
  let best = nearbyWells[0];
  let bestD = Number.POSITIVE_INFINITY;
  for (const w of nearbyWells) {
    const d = haversineKm({ lat, lng }, { lat: w.lat, lng: w.lng });
    if (d < bestD) {
      bestD = d;
      best = w;
    }
  }
  return { well: best, distanceKm: bestD };
}

export function searchWells(q) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return nearbyWells.filter((w) =>
    [w.name, w.id, w.formation, w.status].join(" ").toLowerCase().includes(s)
  );
}

export function candidateRisk(c) {
  const seed = c.id.charCodeAt(c.id.length - 1);
  const stuck = 30 + ((seed * 7) % 55);
  const loss = 25 + ((seed * 5) % 50);
  const kick = 20 + ((seed * 3) % 40);
  const overall = stuck > 55 ? "high" : stuck > 40 ? "medium" : "low";
  const color =
    overall === "high" ? "#ef4444" : overall === "medium" ? "#f59e0b" : "#22c55e";
  return { stuck, loss, kick, overall, color };
}