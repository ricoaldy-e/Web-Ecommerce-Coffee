// src/lib/regions.js

/**
 * Bentuk standar yang kita pakai di FE:
 * { provinces: Array<{ name: string, cities: string[] }> }
 */
export const emptyRegions = { provinces: [] };

/** Normalisasi JSON sumber (mendukung key `cities` ATAU `kota_dan_kabupaten`). */
export function normalizeRegions(raw) {
  const list = Array.isArray(raw?.provinces) ? raw.provinces : [];

  const provinces = list
    .map((p) => {
      const name = String(p?.name ?? "").trim();
      const rawCities = p?.cities ?? p?.kota_dan_kabupaten ?? [];
      const cities = Array.from(
        new Set(
          (Array.isArray(rawCities) ? rawCities : [])
            .map((c) => String(c ?? "").trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, "id"));

      return name ? { name, cities } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, "id"));

  return { provinces };
}

/**
 * Loader dengan cache sederhana di level module agar tidak fetch berulang.
 * Pakai di client component (mis. di useEffect): loadRegions().then(setRegions)
 */
let _cache = null;
export async function loadRegions(url = "/regions-id.json") {
  if (_cache) return _cache;
  try {
    const res = await fetch(url, { cache: "force-cache" });
    const raw = await res.json();
    _cache = normalizeRegions(raw);
    return _cache;
  } catch {
    return emptyRegions;
  }
}

/** Ambil daftar kota utk nama provinsi (case-insensitive). */
export function getCitiesForProvince(regions, provinceName) {
  if (!provinceName) return [];
  const prov = (regions?.provinces ?? []).find(
    (p) => p.name.toLowerCase() === String(provinceName).trim().toLowerCase()
  );
  return prov?.cities ?? [];
}
