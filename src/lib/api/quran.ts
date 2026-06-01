// Quran API — https://alquran.cloud/api
// Free, no API key. Same family as Aladhan.
// The Quran has 6236 ayahs total (numbered 1 - 6236).

export type Edition = {
  identifier: string
  language: string
  name: string
  englishName: string
}

export type Ayah = {
  number: number
  text: string
  edition: Edition
  surah: {
    number: number
    name: string
    englishName: string
    englishNameTranslation: string
  }
  numberInSurah: number
  juz: number
}

export type AyahPair = {
  arabic: Ayah
  urdu: Ayah
}

const TOTAL_AYAHS = 6236

export function randomAyahNumber(): number {
  return Math.floor(Math.random() * TOTAL_AYAHS) + 1
}

/**
 * Fetch a single ayah in both Uthmani Arabic and Urdu (Maulana Fateh
 * Muhammad Jalandhry translation — classical, widely respected in Pakistan).
 * Returns null if the network fails — UI should gracefully hide the card.
 */
export async function getAyahWithTranslation(
  ayahNumber: number
): Promise<AyahPair | null> {
  const url = `https://api.alquran.cloud/v1/ayah/${ayahNumber}/editions/quran-uthmani,ur.jalandhry`
  try {
    // Cache each ayah for 24h — the text never changes
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    const json = (await res.json()) as { code: number; data: Ayah[] }
    if (json.code !== 200 || !Array.isArray(json.data) || json.data.length < 2) {
      return null
    }
    return { arabic: json.data[0], urdu: json.data[1] }
  } catch {
    return null
  }
}
