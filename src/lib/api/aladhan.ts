export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'

export type PrayerTimings = {
  Fajr: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

export type AladhanResponse = {
  code: number
  status: string
  data: {
    timings: PrayerTimings & {
      Sunrise: string
      Sunset: string
      Imsak: string
      Midnight: string
    }
    date: {
      readable: string
      hijri: { date: string; month: { en: string }; year: string }
    }
    meta: {
      timezone: string
      method: { id: number; name: string }
    }
  }
}

const BASE_URL = 'https://api.aladhan.com/v1'

// school: 0 = Shafi/Maliki/Hanbali (Standard), 1 = Hanafi.
// Pakistan/India/Bangladesh follow Hanafi which calculates Asr later
// (shadow length = 2x object length vs 1x for Standard). Default 1.
export async function getTimingsByCity(
  city: string,
  country: string,
  method: number = 1,
  school: number = 1
): Promise<AladhanResponse> {
  const url = `${BASE_URL}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}&school=${school}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Aladhan API error: ${res.status}`)
  return res.json()
}

export async function getTimingsByCoordinates(
  latitude: number,
  longitude: number,
  method: number = 1,
  school: number = 1
): Promise<AladhanResponse> {
  const url = `${BASE_URL}/timings?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Aladhan API error: ${res.status}`)
  return res.json()
}
