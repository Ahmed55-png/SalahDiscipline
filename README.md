# Salah Discipline

A PWA (Progressive Web App) that helps Muslims build the discipline of offering all 5 daily prayers through streak tracking and friend accountability — like Snapchat streaks, but for Salah.

## Features

- 5 daily prayer timetable (Aladhan API, location-based, seasonal)
- Daily check-in for each prayer (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Personal streak counter with history
- Azan playback at prayer time
- Push notifications before each prayer
- Friends system + shared streaks (like Snapchat)
- Leaderboard among friends

- Offline support (PWA)
- Installable on mobile home screen

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Auth + DB:** Supabase
- **Prayer Times:** Aladhan API
- **PWA:** Service worker + Web Push
- **Hosting:** Vercel

## Getting Started

```bash
# Install deps
npm install

# Copy env template and fill in Supabase credentials
cp .env.local.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/              Next.js routes
  components/       Reusable UI components
  hooks/            Custom React hooks
  lib/
    supabase/       Supabase clients (browser + server)
    api/            External APIs (Aladhan)
  types/            TypeScript types
```
