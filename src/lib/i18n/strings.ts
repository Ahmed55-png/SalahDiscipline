export type Lang = 'en' | 'ur'

export const LANGS: ReadonlyArray<{ code: Lang; label: string; short: string }> = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ur', label: 'اردو', short: 'UR' },
]

// Only translate strings that appear in the visible UI.
// Arabic phrases, prayer names, and proper nouns stay as-is.
export const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    // Header / greeting
    'greeting.welcome_back': 'Welcome back',
    'greeting.good_to_see': 'Good to see you',
    'greeting.hello_again': 'Hello again',

    // Streak card
    'streak.current': 'Current Streak',
    'streak.day': 'day',
    'streak.days': 'days',
    'streak.longest': 'Longest',
    'streak.start_hint': 'Pray all 5 prayers today to start your streak.',

    // Last 7 days
    'week.title': 'Last 7 Days',
    'week.subtitle': 'Your discipline at a glance',
    'week.full_calendar': 'Full calendar',

    // Calendar legend
    'legend.complete': 'Complete',
    'legend.partial': 'Partial',
    'legend.broken': 'Broken',
    'legend.no_data': 'No data',
    'legend.tracked': 'Tracked',

    // Check-in
    'checkin.title': "Today's Check-In",
    'checkin.tap_to_mark': 'Tap to mark',
    'checkin.complete_banner': 'Maashallah — Today complete!',
    'checkin.complete_sub': 'Streak counted · See you tomorrow',
    'checkin.broken_banner': 'Streak broken — start fresh tomorrow.',
    'checkin.rule': '5/5 prayed = streak +1 · Any missed = streak resets',
    'status.prayed': 'Prayed',
    'status.missed': 'Missed',
    'status.pending': 'Pending',

    // Notifications
    'notif.title': 'Namaz Reminders',
    'notif.hint': 'Get a reminder on your phone/laptop before each prayer.',
    'notif.enable': 'Enable Notifications',
    'notif.enabled': "✓ Enabled — you'll be notified",
    'notif.send_test': 'Send Test Notification',
    'notif.asking': 'Asking…',
    'notif.sending': 'Sending…',
    'notif.denied': 'Permission denied. Enable from browser settings.',
    'notif.unsupported': 'Notifications are not supported in this browser.',

    // Profile drawer
    'profile.title': 'Profile',
    'profile.email': 'Email',
    'profile.location': 'Location',
    'profile.current_streak': 'Current Streak',
    'profile.longest_streak': 'Longest Streak',
    'profile.logout': 'Logout',

    // Calendar drawer
    'calendar.title': 'Calendar',

    // Install prompt
    'install.title': 'Install as an app',
    'install.hint': 'Home screen icon, full screen, notifications support.',
    'install.install': 'Install',
    'install.later': 'Later',
  },
  ur: {
    'greeting.welcome_back': 'خوش آمدید',
    'greeting.good_to_see': 'مل کر خوشی ہوئی',
    'greeting.hello_again': 'پھر سے سلام',

    'streak.current': 'موجودہ تسلسل',
    'streak.day': 'دن',
    'streak.days': 'دن',
    'streak.longest': 'سب سے زیادہ',
    'streak.start_hint': 'اپنا تسلسل شروع کرنے کے لیے آج پانچوں نمازیں پڑھیں۔',

    'week.title': 'پچھلے 7 دن',
    'week.subtitle': 'ایک نظر میں آپ کی پابندی',
    'week.full_calendar': 'مکمل کیلنڈر',

    'legend.complete': 'مکمل',
    'legend.partial': 'جزوی',
    'legend.broken': 'منقطع',
    'legend.no_data': 'ریکارڈ نہیں',
    'legend.tracked': 'ریکارڈ شدہ',

    'checkin.title': 'آج کی پابندی',
    'checkin.tap_to_mark': 'لمس کر کے نشان لگائیں',
    'checkin.complete_banner': 'ماشاءاللہ — آج مکمل!',
    'checkin.complete_sub': 'تسلسل گنا گیا · کل ملتے ہیں',
    'checkin.broken_banner': 'تسلسل ٹوٹ گیا — کل سے نئے سرے سے۔',
    'checkin.rule': '5/5 ادا = تسلسل +1 · کوئی چھوٹی = ری سیٹ',
    'status.prayed': 'ادا کی',
    'status.missed': 'چھوٹ گئی',
    'status.pending': 'باقی',

    'notif.title': 'نماز کی یاد دہانی',
    'notif.hint': 'ہر نماز سے پہلے فون یا لیپ ٹاپ پر یاد دہانی۔',
    'notif.enable': 'یاد دہانی فعال کریں',
    'notif.enabled': '✓ فعال ہے — آپ کو یاد دہانی ملے گی',
    'notif.send_test': 'ٹیسٹ یاد دہانی بھیجیں',
    'notif.asking': 'پوچھ رہا ہے…',
    'notif.sending': 'بھیجی جا رہی ہے…',
    'notif.denied': 'اجازت نہیں ملی۔ براؤزر کی ترتیبات سے فعال کریں۔',
    'notif.unsupported': 'یہ براؤزر یاد دہانی کی سہولت نہیں دیتا۔',

    'profile.title': 'پروفائل',
    'profile.email': 'ای میل',
    'profile.location': 'مقام',
    'profile.current_streak': 'موجودہ تسلسل',
    'profile.longest_streak': 'سب سے زیادہ تسلسل',
    'profile.logout': 'لاگ آؤٹ',

    'calendar.title': 'کیلنڈر',

    'install.title': 'ایپ کی طرح انسٹال کریں',
    'install.hint': 'ہوم اسکرین آئیکن، فل اسکرین، یاد دہانی کی سہولت۔',
    'install.install': 'انسٹال',
    'install.later': 'بعد میں',
  },
}

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'ur'
}
