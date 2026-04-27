'use client'

import { ConceptCard } from './concept-card'
import { Swords, Star, Trophy } from 'lucide-react'
import type { Concept } from '@/lib/types'

interface WorldMapProps {
  title?: string
  concepts: Concept[]
  onSelectConcept: (concept: Concept) => void
}

export function WorldMap({ title, concepts, onSelectConcept }: WorldMapProps) {
  const completedCount = concepts.filter(c => c.completed).length
  const totalXp = concepts.reduce((sum, c) => sum + (c.completed ? c.xpReward : 0), 0)
  const potentialXp = concepts.reduce((sum, c) => sum + c.xpReward, 0)

  return (
    <div className="space-y-6">
      {/* Title equivalent to st.header */}
      {title && (
        <div className="mb-8 border-b border-[var(--gold-dim)]/30 pb-4">
          <h2 className="text-4xl font-bold font-serif text-[var(--gold)] flex items-center gap-4">
            <span className="text-5xl">🏰</span> {title}
          </h2>
        </div>
      )}
      {/* Stats bar */}
      <div className="flex items-center justify-between p-5 rounded-xl stone-texture">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--gold)]/10 border border-[var(--gold-dim)]/50 flex items-center justify-center">
              <Swords className="h-5 w-5 text-[var(--gold)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--gold-dim)] uppercase tracking-wider">Challenges</p>
              <p className="text-xl font-serif font-bold text-[var(--gold)]">
                {completedCount} / {concepts.length}
              </p>
            </div>
          </div>
          <div className="h-10 w-px bg-[var(--gold-dim)]/30" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--gold)]/10 border border-[var(--gold-dim)]/50 flex items-center justify-center">
              <Star className="h-5 w-5 text-[var(--gold)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--gold-dim)] uppercase tracking-wider">XP Earned</p>
              <p className="text-xl font-serif font-bold text-[var(--gold)]">
                {totalXp.toLocaleString()} <span className="text-sm font-normal text-[var(--parchment-dark)]">/ {potentialXp}</span>
              </p>
            </div>
          </div>
        </div>
        {completedCount === concepts.length && concepts.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/40">
            <Trophy className="h-5 w-5 text-[var(--success)]" />
            <span className="text-sm font-semibold text-[var(--success)]">
              Victory!
            </span>
          </div>
        )}
      </div>

      {/* Concept grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {concepts.map((concept, index) => (
          <ConceptCard
            key={concept.id}
            concept={concept}
            index={index}
            onClick={() => onSelectConcept(concept)}
          />
        ))}
      </div>
    </div>
  )
}
