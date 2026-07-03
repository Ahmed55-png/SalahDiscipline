const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

export function toArabicDigits(n: number): string {
  return String(n)
    .split('')
    .map((d) => AR_DIGITS[Number(d)] ?? d)
    .join('')
}

const BISMILLAH_RE =
  /^بِسْمِ\s+ٱللَّ?ٰ?هِ\s+ٱلرَّحْمَ?ٰ?نِ\s+ٱلرَّحِيمِ\s*/u

export function stripBismillah(text: string): string {
  return text.replace(BISMILLAH_RE, '')
}
