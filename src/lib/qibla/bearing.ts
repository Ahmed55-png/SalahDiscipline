// Great-circle math for Qibla direction and distance.

// Coordinates of the Kaaba in Makkah al-Mukarramah.
export const KAABA = { lat: 21.4225, lon: 39.8262 } as const

const EARTH_RADIUS_KM = 6371.0088

const toRad = (deg: number) => (deg * Math.PI) / 180
const toDeg = (rad: number) => (rad * 180) / Math.PI

/**
 * Initial bearing from (lat, lon) to the Kaaba, in degrees clockwise from
 * true north. Result is in [0, 360).
 */
export function qiblaBearing(lat: number, lon: number): number {
  const φ1 = toRad(lat)
  const φ2 = toRad(KAABA.lat)
  const Δλ = toRad(KAABA.lon - lon)
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const θ = toDeg(Math.atan2(y, x))
  return (θ + 360) % 360
}

/**
 * Great-circle distance in kilometres from (lat, lon) to the Kaaba.
 */
export function qiblaDistanceKm(lat: number, lon: number): number {
  const φ1 = toRad(lat)
  const φ2 = toRad(KAABA.lat)
  const Δφ = toRad(KAABA.lat - lat)
  const Δλ = toRad(KAABA.lon - lon)
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

/**
 * Shortest signed rotation (deg) from `current` to `target`, in (-180, 180].
 * Positive = clockwise (turn right), negative = counter-clockwise (turn left).
 */
export function shortestRotation(current: number, target: number): number {
  let diff = ((target - current + 540) % 360) - 180
  if (diff === -180) diff = 180
  return diff
}
