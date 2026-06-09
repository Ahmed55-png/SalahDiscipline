export type Zikr = {
  id: string
  arabic: string
  translit: string
  urdu: string
  english: string
  target: number
  category: 'post-salah' | 'daily' | 'morning-evening' | 'durood'
}

export const ZIKR_LIST: Zikr[] = [
  // --- After every prayer ---
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ ٱللَّٰهِ',
    translit: 'SubhanAllah',
    urdu: 'اللہ پاک ہے',
    english: 'Glory be to Allah',
    target: 33,
    category: 'post-salah',
  },
  {
    id: 'alhamdulillah',
    arabic: 'ٱلْحَمْدُ لِلَّٰهِ',
    translit: 'Alhamdulillah',
    urdu: 'تمام تعریفیں اللہ کے لیے',
    english: 'All praise is for Allah',
    target: 33,
    category: 'post-salah',
  },
  {
    id: 'allahuakbar',
    arabic: 'ٱللَّٰهُ أَكْبَرُ',
    translit: 'Allahu Akbar',
    urdu: 'اللہ سب سے بڑا ہے',
    english: 'Allah is the greatest',
    target: 34,
    category: 'post-salah',
  },

  // --- Daily dhikr ---
  {
    id: 'lailaha',
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
    translit: 'La ilaha illa Allah',
    urdu: 'اللہ کے سوا کوئی معبود نہیں',
    english: 'There is no god but Allah',
    target: 100,
    category: 'daily',
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ',
    translit: 'Astaghfirullah',
    urdu: 'میں اللہ سے بخشش مانگتا ہوں',
    english: 'I seek forgiveness from Allah',
    target: 100,
    category: 'daily',
  },
  {
    id: 'subhanallah-wabihamdihi',
    arabic: 'سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ',
    translit: 'SubhanAllahi wa bihamdihi',
    urdu: 'اللہ پاک ہے اور تمام تعریفیں اسی کے لیے ہیں',
    english: 'Glory and praise be to Allah',
    target: 100,
    category: 'daily',
  },
  {
    id: 'subhanallah-azeem',
    arabic: 'سُبْحَانَ ٱللَّٰهِ ٱلْعَظِيمِ وَبِحَمْدِهِ',
    translit: 'SubhanAllahil Azeemi wa bihamdihi',
    urdu: 'اللہ بزرگ پاک ہے اور تمام تعریفیں اسی کے لیے ہیں',
    english: 'Glory be to Allah the Magnificent, and praise be to Him',
    target: 100,
    category: 'daily',
  },
  {
    id: 'la-hawla',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ',
    translit: 'La hawla wa la quwwata illa billah',
    urdu: 'گناہوں سے بچنے اور نیکی کرنے کی طاقت صرف اللہ سے ہے',
    english: 'There is no power nor strength except with Allah',
    target: 100,
    category: 'daily',
  },

  // --- Durood ---
  {
    id: 'durood-short',
    arabic: 'ٱللَّهُمَّ صَلِّ وَسَلِّمْ عَلَىٰ نَبِيِّنَا مُحَمَّدٍ',
    translit: 'Allahumma salli wa sallim ala Nabiyyina Muhammad',
    urdu: 'اے اللہ! ہمارے نبی محمد ﷺ پر درود و سلام بھیج',
    english: 'O Allah, send prayers and peace upon our Prophet Muhammad',
    target: 100,
    category: 'durood',
  },

  // --- Morning / Evening ---
  {
    id: 'hasbiyallahu',
    arabic:
      'حَسْبِيَ ٱللَّٰهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ',
    translit: 'Hasbiyallahu la ilaha illa Huwa, alayhi tawakkaltu',
    urdu: 'اللہ میرے لیے کافی ہے، اس کے سوا کوئی معبود نہیں، اسی پر بھروسہ کیا',
    english: 'Allah is sufficient for me; none is worthy of worship but Him. I rely upon Him.',
    target: 7,
    category: 'morning-evening',
  },
  {
    id: 'bismillah-yadhurru',
    arabic:
      'بِسْمِ ٱللَّٰهِ ٱلَّذِى لَا يَضُرُّ مَعَ ٱسْمِهِ شَىْءٌ فِى ٱلْأَرْضِ وَلَا فِى ٱلسَّمَآءِ',
    translit: 'Bismillahilladhi la yadhurru ma‘asmihi shay’un fil-ardi wala fis-sama’',
    urdu: 'اللہ کے نام سے جس کے نام کے ساتھ زمین و آسمان کی کوئی چیز نقصان نہیں دے سکتی',
    english:
      'In the name of Allah with whose name nothing on earth or in the heavens can cause harm',
    target: 3,
    category: 'morning-evening',
  },
  {
    id: 'radeetu',
    arabic:
      'رَضِيتُ بِٱللَّٰهِ رَبًّا وَبِٱلْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
    translit: 'Radeetu billahi Rabba, wa bil-Islami dina, wa bi-Muhammadin Nabiyya',
    urdu: 'میں اللہ کے رب ہونے، اسلام کے دین ہونے اور محمد ﷺ کے نبی ہونے پر راضی ہوں',
    english:
      'I am pleased with Allah as my Lord, Islam as my religion, and Muhammad ﷺ as my Prophet',
    target: 3,
    category: 'morning-evening',
  },
]

export const CATEGORY_LABEL: Record<Zikr['category'], string> = {
  'post-salah': 'After Salah',
  daily: 'Daily Dhikr',
  durood: 'Durood',
  'morning-evening': 'Morning & Evening',
}

export function zikrById(id: string): Zikr | undefined {
  return ZIKR_LIST.find((z) => z.id === id)
}
