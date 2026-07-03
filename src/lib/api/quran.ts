// Quran API — https://alquran.cloud/api
// Free, no API key. Same family as Aladhan.
// The Quran has 6236 ayahs total (numbered 1 - 6236),
// 114 surahs, 30 juz/paras.

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

export type SurahMeta = {
  number: number
  name: string // Arabic
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: 'Meccan' | 'Medinan'
}

export type SurahDetail = {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  revelationType: string
  numberOfAyahs: number
  ayahs: Array<{
    number: number
    numberInSurah: number
    text: string
    juz: number
  }>
}

export type SurahPair = {
  meta: SurahMeta
  arabic: SurahDetail
  urdu: SurahDetail
}

const TOTAL_AYAHS = 6236
const BASE = 'https://api.alquran.cloud/v1'

export function randomAyahNumber(): number {
  return Math.floor(Math.random() * TOTAL_AYAHS) + 1
}

/**
 * Single ayah in Uthmani Arabic + Urdu (Maulana Fateh Muhammad Jalandhry).
 */
export async function getAyahWithTranslation(
  ayahNumber: number
): Promise<AyahPair | null> {
  const url = `${BASE}/ayah/${ayahNumber}/editions/quran-uthmani,ur.jalandhry`
  try {
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

/**
 * The 114-surah index. Cached for a week — list is static.
 */
export async function getAllSurahs(): Promise<SurahMeta[] | null> {
  try {
    const res = await fetch(`${BASE}/surah`, {
      next: { revalidate: 60 * 60 * 24 * 7 },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { code: number; data: SurahMeta[] }
    if (json.code !== 200 || !Array.isArray(json.data)) return null
    return json.data
  } catch {
    return null
  }
}

/**
 * Full surah text in Arabic + Urdu. Cached for a week — text is static.
 */
export async function getSurahWithTranslation(
  surahNumber: number
): Promise<SurahPair | null> {
  if (surahNumber < 1 || surahNumber > 114) return null
  try {
    const res = await fetch(
      `${BASE}/surah/${surahNumber}/editions/quran-uthmani,ur.jalandhry`,
      { next: { revalidate: 60 * 60 * 24 * 7 } }
    )
    if (!res.ok) return null
    const json = (await res.json()) as {
      code: number
      data: SurahDetail[]
    }
    if (json.code !== 200 || !Array.isArray(json.data) || json.data.length < 2) {
      return null
    }
    const arabic = json.data[0]
    const urdu = json.data[1]
    return {
      arabic,
      urdu,
      meta: {
        number: arabic.number,
        name: arabic.name,
        englishName: arabic.englishName,
        englishNameTranslation: arabic.englishNameTranslation,
        numberOfAyahs: arabic.numberOfAyahs,
        revelationType: arabic.revelationType as 'Meccan' | 'Medinan',
      },
    }
  } catch {
    return null
  }
}

export type JuzPair = {
  number: number
  arabicAyahs: Array<{
    number: number
    text: string
    numberInSurah: number
    surah: { number: number; englishName: string; name: string }
  }>
  urduAyahs: Array<{
    number: number
    text: string
    numberInSurah: number
    surah: { number: number; englishName: string; name: string }
  }>
}

/**
 * Full juz (para) in Arabic + Urdu. Cached for a week.
 */
export async function getJuzWithTranslation(
  juzNumber: number
): Promise<JuzPair | null> {
  if (juzNumber < 1 || juzNumber > 30) return null
  try {
    const [arRes, urRes] = await Promise.all([
      fetch(`${BASE}/juz/${juzNumber}/quran-uthmani`, {
        next: { revalidate: 60 * 60 * 24 * 7 },
      }),
      fetch(`${BASE}/juz/${juzNumber}/ur.jalandhry`, {
        next: { revalidate: 60 * 60 * 24 * 7 },
      }),
    ])
    if (!arRes.ok || !urRes.ok) return null
    const arJson = (await arRes.json()) as {
      code: number
      data: { ayahs: JuzPair['arabicAyahs'] }
    }
    const urJson = (await urRes.json()) as {
      code: number
      data: { ayahs: JuzPair['urduAyahs'] }
    }
    if (arJson.code !== 200 || urJson.code !== 200) return null
    return {
      number: juzNumber,
      arabicAyahs: arJson.data.ayahs,
      urduAyahs: urJson.data.ayahs,
    }
  } catch {
    return null
  }
}
