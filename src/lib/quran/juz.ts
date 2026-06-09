export type JuzMeta = {
  number: number
  arabic: string // common Arabic name of the para
  translit: string // English transliteration
  startSurah: number
  startAyah: number
  startSurahName: string
}

// 30 ajzāʾ (paras) of the Qurʾān. Names follow the common Urdu/Indo-Pak
// naming after the first word of each juz.
export const JUZ_LIST: JuzMeta[] = [
  { number: 1, arabic: 'الم', translit: 'Alif Lam Meem', startSurah: 1, startAyah: 1, startSurahName: 'Al-Fatihah' },
  { number: 2, arabic: 'سَيَقُولُ', translit: 'Sayaqulu', startSurah: 2, startAyah: 142, startSurahName: 'Al-Baqarah' },
  { number: 3, arabic: 'تِلْكَ ٱلرُّسُلُ', translit: 'Tilka-r-Rusul', startSurah: 2, startAyah: 253, startSurahName: 'Al-Baqarah' },
  { number: 4, arabic: 'لَن تَنَالُوا۟', translit: 'Lan Tanalu', startSurah: 3, startAyah: 92, startSurahName: 'Aal-i-Imran' },
  { number: 5, arabic: 'وَٱلْمُحْصَنَاتُ', translit: 'Wal-Muhsanat', startSurah: 4, startAyah: 24, startSurahName: 'An-Nisa' },
  { number: 6, arabic: 'لَّا يُحِبُّ ٱللَّهُ', translit: 'La Yuhibbullah', startSurah: 4, startAyah: 148, startSurahName: 'An-Nisa' },
  { number: 7, arabic: 'وَإِذَا سَمِعُوا', translit: 'Wa Idha Sami‘u', startSurah: 5, startAyah: 82, startSurahName: 'Al-Maidah' },
  { number: 8, arabic: 'وَلَوْ أَنَّنَا', translit: 'Wa Law Annana', startSurah: 6, startAyah: 111, startSurahName: 'Al-An‘am' },
  { number: 9, arabic: 'قَدْ أَفْلَحَ', translit: 'Qad Aflaha', startSurah: 7, startAyah: 88, startSurahName: 'Al-A‘raf' },
  { number: 10, arabic: 'وَٱعْلَمُوٓا', translit: 'Wa I‘lamu', startSurah: 8, startAyah: 41, startSurahName: 'Al-Anfal' },
  { number: 11, arabic: 'يَعْتَذِرُونَ', translit: 'Ya‘tadhirun', startSurah: 9, startAyah: 94, startSurahName: 'At-Tawbah' },
  { number: 12, arabic: 'وَمَا مِن دَآبَّةٍ', translit: 'Wa Ma Min Dabbatin', startSurah: 11, startAyah: 6, startSurahName: 'Hud' },
  { number: 13, arabic: 'وَمَآ أُبَرِّئُ', translit: 'Wa Ma Ubarri’u', startSurah: 12, startAyah: 53, startSurahName: 'Yusuf' },
  { number: 14, arabic: 'رُّبَمَا', translit: 'Rubama', startSurah: 15, startAyah: 1, startSurahName: 'Al-Hijr' },
  { number: 15, arabic: 'سُبْحَانَ ٱلَّذِىٓ', translit: 'Subhanalladhi', startSurah: 17, startAyah: 1, startSurahName: 'Al-Isra' },
  { number: 16, arabic: 'قَالَ أَلَمْ', translit: 'Qala Alam', startSurah: 18, startAyah: 75, startSurahName: 'Al-Kahf' },
  { number: 17, arabic: 'ٱقْتَرَبَ', translit: 'Iqtaraba', startSurah: 21, startAyah: 1, startSurahName: 'Al-Anbiya' },
  { number: 18, arabic: 'قَدْ أَفْلَحَ', translit: 'Qad Aflaha', startSurah: 23, startAyah: 1, startSurahName: 'Al-Mu’minun' },
  { number: 19, arabic: 'وَقَالَ ٱلَّذِينَ', translit: 'Wa Qala’l-ladhina', startSurah: 25, startAyah: 21, startSurahName: 'Al-Furqan' },
  { number: 20, arabic: 'أَمَّنْ خَلَقَ', translit: 'Amman Khalaqa', startSurah: 27, startAyah: 56, startSurahName: 'An-Naml' },
  { number: 21, arabic: 'ٱتْلُ مَآ أُوحِىَ', translit: 'Utlu Ma Uhiya', startSurah: 29, startAyah: 46, startSurahName: 'Al-‘Ankabut' },
  { number: 22, arabic: 'وَمَن يَقْنُتْ', translit: 'Wa Man Yaqnut', startSurah: 33, startAyah: 31, startSurahName: 'Al-Ahzab' },
  { number: 23, arabic: 'وَمَا لِىَ', translit: 'Wa Ma Liya', startSurah: 36, startAyah: 22, startSurahName: 'Ya-Sin' },
  { number: 24, arabic: 'فَمَنْ أَظْلَمُ', translit: 'Faman Azlam', startSurah: 39, startAyah: 32, startSurahName: 'Az-Zumar' },
  { number: 25, arabic: 'إِلَيْهِ يُرَدُّ', translit: 'Ilayhi Yuraddu', startSurah: 41, startAyah: 47, startSurahName: 'Fussilat' },
  { number: 26, arabic: 'حم', translit: 'Ha Mim', startSurah: 46, startAyah: 1, startSurahName: 'Al-Ahqaf' },
  { number: 27, arabic: 'قَالَ فَمَا خَطْبُكُمْ', translit: 'Qala Fama Khatbukum', startSurah: 51, startAyah: 31, startSurahName: 'Adh-Dhariyat' },
  { number: 28, arabic: 'قَدْ سَمِعَ ٱللَّهُ', translit: 'Qad Sami‘a Allah', startSurah: 58, startAyah: 1, startSurahName: 'Al-Mujadilah' },
  { number: 29, arabic: 'تَبَارَكَ ٱلَّذِى', translit: 'Tabaraka’l-ladhi', startSurah: 67, startAyah: 1, startSurahName: 'Al-Mulk' },
  { number: 30, arabic: 'عَمَّ', translit: '‘Amma', startSurah: 78, startAyah: 1, startSurahName: 'An-Naba' },
]
