export type PrayerStatus = 'prayed' | 'missed' | 'pending'

export type User = {
  id: string
  username: string
  email: string
  city: string | null
  country: string | null
  calculation_method: number
  azan_choice: string
  created_at: string
}

export type DailyPrayer = {
  id: string
  user_id: string
  date: string
  fajr: PrayerStatus
  dhuhr: PrayerStatus
  asr: PrayerStatus
  maghrib: PrayerStatus
  isha: PrayerStatus
}

export type Streak = {
  user_id: string
  current_streak: number
  longest_streak: number
  last_prayed_date: string | null
}

export type Friendship = {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted'
  created_at: string
}

export type SharedStreak = {
  id: string
  user1_id: string
  user2_id: string
  streak_count: number
  last_updated: string
}
