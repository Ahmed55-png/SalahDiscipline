import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(circle at 30% 25%, #134E4A 0%, #064E3B 50%, #0A1F1A 100%)',
          borderRadius: '15%',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          width="380"
          height="380"
        >
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FCE7A8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FCE7A8" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F4D03F" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#glow)" />
          <path
            d="M50 8 L60 22 L78 22 L78 40 L92 50 L78 60 L78 78 L60 78 L50 92 L40 78 L22 78 L22 60 L8 50 L22 40 L22 22 L40 22 Z"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="2.5"
          />
          <g transform="rotate(22.5 50 50)">
            <path
              d="M50 18 L57 28 L69 28 L69 40 L79 50 L69 60 L69 72 L57 72 L50 82 L43 72 L31 72 L31 60 L21 50 L31 40 L31 28 L43 28 Z"
              fill="none"
              stroke="url(#goldGrad)"
              strokeWidth="1.5"
              opacity="0.8"
            />
          </g>
          <path
            d="M44 36 A14 14 0 1 0 44 64 A11 11 0 1 1 44 36 Z"
            fill="url(#goldGrad)"
          />
          <circle cx="62" cy="44" r="3" fill="url(#goldGrad)" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
