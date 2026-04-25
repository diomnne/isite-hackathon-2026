export interface Concept {
  id: string
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  xpReward: number
  completed: boolean
  location: string
}

export interface WorldMap {
  id: string
  title: string
  sourceText: string
  concepts: Concept[]
  createdAt: string
}

export interface UserProgress {
  totalXp: number
  level: number
  completedConcepts: string[]
  currentWorldMapId: string | null
}

export interface EvaluationResult {
  passed: boolean
  feedback: string
  correctPoints: string[]
  missedPoints: string[]
  xpAwarded: number
}

export interface Challenge {
  conceptId: string
  narrative: string
  expectedTopics: string[]
}
