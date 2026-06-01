import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Salah Discipline',
    short_name: 'Salah',
    description:
      'Build the discipline of 5 daily prayers — track your streak and stay accountable with friends.',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0A1F1A',
    theme_color: '#0F5132',
    categories: ['lifestyle', 'productivity', 'social'],
    lang: 'en',
    dir: 'ltr',
    prefer_related_applications: false,
    related_applications: [],
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
