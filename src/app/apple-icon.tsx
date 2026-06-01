import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          borderRadius: '22%',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          width="135"
          height="135"
        >
          <defs>
            <linearGradient id="goldGradA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F4D03F" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
          <path
            d="M50 8 L60 22 L78 22 L78 40 L92 50 L78 60 L78 78 L60 78 L50 92 L40 78 L22 78 L22 60 L8 50 L22 40 L22 22 L40 22 Z"
            fill="none"
            stroke="url(#goldGradA)"
            strokeWidth="2.5"
          />
          <g transform="rotate(22.5 50 50)">
            <path
              d="M50 18 L57 28 L69 28 L69 40 L79 50 L69 60 L69 72 L57 72 L50 82 L43 72 L31 72 L31 60 L21 50 L31 40 L31 28 L43 28 Z"
              fill="none"
              stroke="url(#goldGradA)"
              strokeWidth="1.5"
              opacity="0.8"
            />
          </g>
          <path
            d="M44 36 A14 14 0 1 0 44 64 A11 11 0 1 1 44 36 Z"
            fill="url(#goldGradA)"
          />
          <circle cx="62" cy="44" r="3" fill="url(#goldGradA)" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
