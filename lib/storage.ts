import type { UserProgress, WorldMap } from './types'

const PROGRESS_KEY = 'study-buddy-progress'
const WORLD_MAPS_KEY = 'study-buddy-world-maps'

const defaultProgress: UserProgress = {
  totalXp: 0,
  level: 1,
  completedConcepts: [],
  currentWorldMapId: null,
}

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress
  
  try {
    const stored = localStorage.getItem(PROGRESS_KEY)
    if (!stored) return defaultProgress
    return JSON.parse(stored) as UserProgress
  } catch {
    return defaultProgress
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  } catch {
    console.error('Failed to save progress')
  }
}

export function loadWorldMaps(): WorldMap[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(WORLD_MAPS_KEY)
    if (!stored) return []
    return JSON.parse(stored) as WorldMap[]
  } catch {
    return []
  }
}

export function saveWorldMap(worldMap: WorldMap): void {
  if (typeof window === 'undefined') return
  
  try {
    const existing = loadWorldMaps()
    const filtered = existing.filter(w => w.id !== worldMap.id)
    const updated = [worldMap, ...filtered].slice(0, 10) // Keep last 10
    localStorage.setItem(WORLD_MAPS_KEY, JSON.stringify(updated))
  } catch {
    console.error('Failed to save world map')
  }
}

export function getWorldMapById(id: string): WorldMap | null {
  const maps = loadWorldMaps()
  return maps.find(m => m.id === id) || null
}

export function deleteWorldMap(id: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const existing = loadWorldMaps()
    const filtered = existing.filter(w => w.id !== id)
    localStorage.setItem(WORLD_MAPS_KEY, JSON.stringify(filtered))
  } catch {
    console.error('Failed to delete world map')
  }
}

export function addXpAndUpdateProgress(xpToAdd: number, conceptId: string): UserProgress {
  const progress = loadProgress()
  const newXp = progress.totalXp + xpToAdd
  
  const updatedProgress: UserProgress = {
    ...progress,
    totalXp: newXp,
    level: Math.floor(Math.sqrt(newXp / 50)) + 1,
    completedConcepts: progress.completedConcepts.includes(conceptId)
      ? progress.completedConcepts
      : [...progress.completedConcepts, conceptId],
  }
  
  saveProgress(updatedProgress)
  return updatedProgress
}

export function markConceptComplete(worldMapId: string, conceptId: string): void {
  const worldMap = getWorldMapById(worldMapId)
  if (!worldMap) return
  
  const updatedConcepts = worldMap.concepts.map(c =>
    c.id === conceptId ? { ...c, completed: true } : c
  )
  
  saveWorldMap({ ...worldMap, concepts: updatedConcepts })
}
