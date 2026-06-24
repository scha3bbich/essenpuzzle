// Camp starts July 12, 2026. Day changes at 13:30 MEZ (UTC+2 in summer).
// Day 1 = July 12, Day 12 = July 23.

export const CAMP_START = new Date('2026-07-12T11:30:00Z') // 13:30 MEZ = 11:30 UTC
export const TOTAL_DAYS = 12

/** Returns which day number (1–12) is currently active, or null if outside the range */
export function getCurrentDay(): number | null {
  const now = new Date()
  if (now < CAMP_START) return null
  const msPerDay = 24 * 60 * 60 * 1000
  const elapsed = now.getTime() - CAMP_START.getTime()
  const day = Math.floor(elapsed / msPerDay) + 1
  if (day > TOTAL_DAYS) return null
  return day
}

/** Returns the Date when a given day (1-based) unlocks */
export function getDayUnlockTime(day: number): Date {
  const msPerDay = 24 * 60 * 60 * 1000
  return new Date(CAMP_START.getTime() + (day - 1) * msPerDay)
}

/** Returns the Date when the next day unlocks (for countdown after solving) */
export function getNextDayUnlockTime(currentDay: number): Date | null {
  if (currentDay >= TOTAL_DAYS) return null
  return getDayUnlockTime(currentDay + 1)
}

// ─── Config-aware variants ─────────────────────────────────────────────────

/**
 * Returns the unlock Date for a given day, using the MEZ time from config
 * if provided, or the default 13:30 MEZ otherwise.
 */
export function getDayUnlockTimeWithConfig(day: number, timeMEZ?: string | null): Date {
  if (!timeMEZ) return getDayUnlockTime(day)
  const [h, m] = timeMEZ.split(':').map(Number)
  const utcH = (h - 2 + 24) % 24
  // Base = midnight UTC on the correct calendar date
  const msPerDay = 24 * 60 * 60 * 1000
  const dayDate = new Date(CAMP_START)
  dayDate.setUTCHours(0, 0, 0, 0)
  const base = new Date(dayDate.getTime() + (day - 1) * msPerDay)
  base.setUTCHours(utcH, m, 0, 0)
  return base
}

/**
 * Like getCurrentDay() but respects per-day unlock times from admin config.
 * unlockTimes: array of 12 "HH:MM" MEZ strings (or null = use default).
 */
export function getCurrentDayWithConfig(unlockTimes: (string | null)[]): number | null {
  const now = new Date()
  for (let d = TOTAL_DAYS; d >= 1; d--) {
    const unlock = getDayUnlockTimeWithConfig(d, unlockTimes[d - 1])
    if (now >= unlock) return d
  }
  return null
}

/**
 * Like getNextDayUnlockTime() but uses config times.
 */
export function getNextDayUnlockTimeWithConfig(
  currentDay: number,
  unlockTimes: (string | null)[]
): Date | null {
  if (currentDay >= TOTAL_DAYS) return null
  return getDayUnlockTimeWithConfig(currentDay + 1, unlockTimes[currentDay])
}

/** LocalStorage key for solved days */
export const SOLVED_KEY = 'zeltlager_solved_days'

export function getSolvedDays(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SOLVED_KEY)
    if (!raw) return []
    return JSON.parse(raw) as number[]
  } catch {
    return []
  }
}

export function markDaySolved(day: number): void {
  if (typeof window === 'undefined') return
  const solved = getSolvedDays()
  if (!solved.includes(day)) {
    solved.push(day)
    localStorage.setItem(SOLVED_KEY, JSON.stringify(solved))
  }
}

export function isDaySolved(day: number): boolean {
  return getSolvedDays().includes(day)
}

/** Format a Date as German date string */
export function formatDateDE(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** Format a time as HH:MM MEZ */
export function formatTimeMEZ(date: Date): string {
  // MEZ/MESZ = UTC+2 in summer
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Berlin',
  })
}
