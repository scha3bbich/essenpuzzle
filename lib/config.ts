// ─── Puzzle content types ──────────────────────────────────────────────────

export interface QuizQuestion {
  q: string
  options: string[]
  answer: number // index into options
}

export interface ScrambleWord {
  scrambled: string
  answer: string
  hint: string
}

export interface MathRiddle {
  text: string
  answer: number
  unit: string
}

export interface TrueFalseStatement {
  text: string
  answer: boolean
}

export interface HangmanWord {
  word: string
  hint: string
}

export interface MatchingPair {
  left: string
  right: string
}

/** Day 2 – Memory: two different images that belong together as a pair */
export interface MemoryPair {
  /** URL of the first image */
  imageA: string
  /** URL of the second image (different from imageA) */
  imageB: string
  /** Optional label shown after the pair is matched */
  label?: string
}

/** Day 10 – Hitster: match an audio clip to an image */
export interface HitsterPair {
  /** Public URL of the audio file (MP3/OGG etc.) */
  audioUrl: string
  /** Public URL of the image to match to */
  imageUrl: string
  /** Display label shown after solving (e.g. name of the person) */
  label: string
}

export interface FinalStage {
  type: 'quiz' | 'input'
  question: string
  options?: string[] // only for type=quiz
  answer: string // quiz: index as string ("0","1"…); input: the expected word (uppercase)
  hint?: string
}

export interface DayPuzzleContent {
  // Day 1 – Quiz
  quizQuestions?: QuizQuestion[]
  // Day 2 – Memory (two different images per pair)
  memoryPairs?: MemoryPair[]
  // Day 3 – Scramble
  scrambleWords?: ScrambleWord[]
  // Day 4 – Word Search (grid is fixed in code; words here are display-only)
  wordSearchWords?: string[]
  // Day 5 – Math
  mathRiddles?: MathRiddle[]
  // Day 6 – True/False
  trueFalseStatements?: TrueFalseStatement[]
  // Day 7 – Hangman
  hangmanWords?: HangmanWord[]
  // Day 8 – Sorting
  sortingSteps?: string[]
  // Day 9 – Text Riddles
  textRiddles?: Array<{ riddle: string; answer: string; hint: string }>
  // Day 10 – Hitster (audio-to-image matching)
  matchingPairs?: MatchingPair[] // legacy, kept for backwards compat
  hitsterPairs?: HitsterPair[]
  // Day 11 – Code
  codeEncoded?: number[]
  codeAnswer?: string
  codeClues?: Array<{ clue: string }>
  // Day 12 – Final
  finalStages?: FinalStage[]
}

export interface DayConfig {
  /** Unlock time in MEZ (= Europe/Berlin summer time, UTC+2). Format "HH:MM". */
  unlockTimeMEZ: string
  /** URL for the success screen image (external URL or /public path). */
  successImageUrl: string
  puzzleContent: DayPuzzleContent
}

export interface AdminConfig {
  days: DayConfig[] // 12 entries; index 0 = Day 1
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Convert "HH:MM" MEZ (MESZ = UTC+2 in summer) to a full unlock Date for the
 * given camp day (1-based). July is MESZ so we subtract 2 h to get UTC.
 */
export function unlockDateForDay(day: number, timeMEZ: string): Date {
  const [h, m] = timeMEZ.split(':').map(Number)
  const utcH = (h - 2 + 24) % 24
  // Camp starts July 12 2026 (UTC midnight reference)
  const CAMP_DATE_0 = new Date('2026-07-12T00:00:00Z')
  const msPerDay = 24 * 60 * 60 * 1000
  const base = new Date(CAMP_DATE_0.getTime() + (day - 1) * msPerDay)
  base.setUTCHours(utcH, m, 0, 0)
  return base
}

// ─── Default config ────────────────────────────────────────────────────────

export const DEFAULT_CONFIG: AdminConfig = {
  days: [
    // Day 1 – Quiz
    {
      unlockTimeMEZ: '13:30',
      successImageUrl: '/camp-success.png',
      puzzleContent: {
        quizQuestions: [
          { q: 'Was ist ein typisches Zeltlager-Gericht, das in einem großen Topf über dem Feuer gekocht wird?', options: ['Sushi', 'Gulasch', 'Pizza', 'Fondue'], answer: 1 },
          { q: 'Welches Werkzeug benutzt man zum Essen beim Zeltlager?', options: ['Löffel, Gabel & Messer', 'Stäbchen', 'Hände allein', 'Pinzette'], answer: 0 },
          { q: 'Was macht man mit Lebensmitteln im Zeltlager, damit sie frisch bleiben?', options: ['In die Sonne legen', 'Im Schatten & in Kühlboxen lagern', 'Vergraben', 'An Bäume hängen'], answer: 1 },
          { q: 'Was trinkt man beim Zeltlager am meisten?', options: ['Kaffee', 'Energydrinks', 'Wasser', 'Milch pur'], answer: 2 },
        ],
      },
    },
    // Day 2 – Memory (image pairs added via admin)
    {
      unlockTimeMEZ: '13:30',
      successImageUrl: '/camp-success.png',
      puzzleContent: {
        memoryPairs: [],
      },
    },
    // Day 3 – Scramble
    {
      unlockTimeMEZ: '13:30',
      successImageUrl: '/camp-success.png',
      puzzleContent: {
        scrambleWords: [
          { scrambled: 'PTEOP', answer: 'TOPFE', hint: 'Damit kocht man Suppe' },
          { scrambled: 'SAESL', answer: 'SALSE', hint: 'Damit würzt man alles' },
          { scrambled: 'EFRREU', answer: 'FEURER', hint: 'Darauf wird gekocht' },
          { scrambled: 'EGMEUS', answer: 'GEMUESE', hint: 'Gesundes Mittagessen' },
        ],
      },
    },
    // Day 4 – Word Search (grid is hardcoded in component)
    {
      unlockTimeMEZ: '13:30',
      successImageUrl: '/camp-success.png',
      puzzleContent: {
        wordSearchWords: ['SUPPE', 'TOPF', 'SALZ', 'BROT'],
      },
    },
    // Day 5 – Math
    {
      unlockTimeMEZ: '13:30',
      successImageUrl: '/camp-success.png',
      puzzleContent: {
        mathRiddles: [
          { text: 'Im Zeltlager kochen 3 Köche. Jeder schält 8 Kartoffeln. Wie viele Kartoffeln wurden insgesamt geschält?', answer: 24, unit: 'Kartoffeln' },
          { text: 'Es gibt 5 Tische. An jedem Tisch sitzen 6 Kinder. Wie viele Kinder essen zusammen zu Mittag?', answer: 30, unit: 'Kinder' },
          { text: 'Für die Suppe braucht man 4 Liter Wasser pro Topf. Es werden 3 Töpfe gekocht. Wie viele Liter Wasser werden insgesamt benötigt?', answer: 12, unit: 'Liter' },
        ],
      },
    },
    // Day 6 – True/False
    {
      unlockTimeMEZ: '13:30',
      successImageUrl: '/camp-success.png',
      puzzleContent: {
        trueFalseStatements: [
          { text: 'Rohes Fleisch sollte niemals bei Zimmertemperatur gelagert werden.', answer: true },
          { text: 'Man kann Nudeln auch in kaltem Wasser kochen — das spart Zeit.', answer: false },
          { text: 'Salz erhöht den Siedepunkt des Wassers leicht.', answer: true },
          { text: 'Beim Zeltlager sollte man Essensreste immer im Zelt aufbewahren.', answer: false },
          { text: 'Frisches Wasser ist die wichtigste Zutat beim Kochen draußen.', answer: true },
        ],
      },
    },
    // Day 7 – Hangman
    {
      unlockTimeMEZ: '13:30',
      successImageUrl: '/camp-success.png',
      puzzleContent: {
        hangmanWords: [
          { word: 'MITTAGESSEN', hint: 'Was man mittags zu sich nimmt' },
          { word: 'LAGERFEUER', hint: 'Wärmt und erhellt das Zeltlager' },
          { word: 'KOCHLOEFFEL', hint: 'Wichtiges Küchenwerkzeug' },
        ],
      },
    },
    // Day 8 – Sorting
    {
      unlockTimeMEZ: '13:30',
      successImageUrl: '/camp-success.png',
      puzzleContent: {
        sortingSteps: [
          'Wasser in den Topf füllen',
          'Wasser zum Kochen bringen',
          'Salz ins Wasser geben',
          'Nudeln ins kochende Wasser geben',
          'Nudeln al dente kochen',
          'Nudeln abgießen und servieren',
        ],
      },
    },
    // Day 9 – Text Riddles
    {
      unlockTimeMEZ: '13:30',
      successImageUrl: '/camp-success.png',
      puzzleContent: {
        textRiddles: [
          { riddle: 'Ich habe Zähne, aber kein Maul. Ich helfe beim Kochen, aber esse nichts selbst. Was bin ich?', answer: 'GABEL', hint: 'Man braucht mich zum Essen' },
          { riddle: 'Ich bin rund, ich bin hohl. Ich fasse viel Wasser und stehe auf dem Feuer. Was bin ich?', answer: 'TOPF', hint: 'Ein Kochgefäß' },
          { riddle: 'Ich weiß, aber ich bin kein Schnee. Ich würze die Suppe, aber ich bin kein Gewürz aus der Pflanzenwelt. Was bin ich?', answer: 'SALZ', hint: 'Kommt aus dem Meer oder aus der Erde' },
        ],
      },
    },
    // Day 10 – Hitster
    {
      unlockTimeMEZ: '13:30',
      successImageUrl: '/camp-success.png',
      puzzleContent: {
        hitsterPairs: [],
      },
    },
    // Day 11 – Code
    {
      unlockTimeMEZ: '13:30',
      successImageUrl: '/camp-success.png',
      puzzleContent: {
        codeEncoded: [19, 21, 16, 16, 5],
        codeAnswer: 'SUPPE',
        codeClues: [
          { clue: 'Erstes Buchstabe: Im Alphabet der 19. Buchstabe' },
          { clue: '4. Buchstabe: Genauso wie der 3. Buchstabe' },
          { clue: 'Letzter Buchstabe: Der 5. Buchstabe im Alphabet' },
        ],
      },
    },
    // Day 12 – Final
    {
      unlockTimeMEZ: '13:30',
      successImageUrl: '/camp-success.png',
      puzzleContent: {
        finalStages: [
          { type: 'quiz', question: 'Was ist das Lieblingsessen vieler Zeltlager-Kinder?', options: ['Rotkohl', 'Nudeln mit Tomatensauce', 'Fischsuppe', 'Blattsalat'], answer: '1' },
          { type: 'input', question: 'Wie viele Tage hat dieses Zeltlager-Abenteuer gedauert?', answer: '12', hint: 'So viele Rätsel gab es' },
          { type: 'quiz', question: 'Was ist das Wichtigste beim Kochen im Freien?', options: ['Scharfe Messer', 'Feuer und sicherer Umgang damit', 'Schnelle Zubereitung', 'Teure Zutaten'], answer: '1' },
          { type: 'input', question: 'Was serviert man traditionell am Ende eines Zeltlager-Mittagessens zum Nachtisch?', answer: 'OBST', hint: 'Wächst auf Bäumen oder Sträuchern — z.B. Apfel oder Banane' },
        ],
      },
    },
  ],
}
