import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  // Disable SW in development to avoid stale-cache headaches.
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {
  // PWA + future config goes here
}

export default withSerwist(nextConfig)
