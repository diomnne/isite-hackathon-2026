// XP thresholds follow a quadratic curve: 0, 100, 300, 600, 1000, 1500...
// Each level requires progressively more XP

export function getLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1
}

export function getXpForLevel(level: number): number {
  return 50 * Math.pow(level - 1, 2)
}

export function getXpForNextLevel(level: number): number {
  return getXpForLevel(level + 1)
}

export function getXpProgress(xp: number): {
  currentLevel: number
  currentLevelXp: number
  nextLevelXp: number
  progressPercent: number
} {
  const currentLevel = getLevel(xp)
  const currentLevelXp = getXpForLevel(currentLevel)
  const nextLevelXp = getXpForNextLevel(currentLevel)
  const xpIntoLevel = xp - currentLevelXp
  const xpNeeded = nextLevelXp - currentLevelXp
  const progressPercent = Math.min((xpIntoLevel / xpNeeded) * 100, 100)

  return {
    currentLevel,
    currentLevelXp,
    nextLevelXp,
    progressPercent,
  }
}

export function getDifficultyXp(difficulty: 'easy' | 'medium' | 'hard'): number {
  switch (difficulty) {
    case 'easy':
      return 50
    case 'medium':
      return 100
    case 'hard':
      return 200
    default:
      return 50
  }
}

export function getLevelTitle(level: number): string {
  if (level <= 2) return 'Novice Scholar'
  if (level <= 4) return 'Apprentice Sage'
  if (level <= 6) return 'Journeyman Mage'
  if (level <= 8) return 'Adept Wizard'
  if (level <= 10) return 'Master Arcanist'
  return 'Grand Archmage'
}
