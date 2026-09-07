const cache = new Map();

export async function searchLocation(query, limit = 5) {
  const key = query.trim().toLowerCase();
  if (!key) return [];
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      key
    )}&count=${limit}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }
    const results = data.results.map((d) => {
      const parts = [d.name, d.admin1, d.country].filter(Boolean);
      return {
        name: parts.join(", "),
        lat: Number(d.latitude),
        lng: Number(d.longitude),
      };
    });
    cache.set(key, results);
    return results;
  } catch {
    return [];
  }
}